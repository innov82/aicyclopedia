
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  _identifier text,
  _window_start timestamptz
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE public.rate_limits
     SET request_count = request_count + 1
   WHERE identifier = _identifier
     AND window_start = _window_start
  RETURNING request_count INTO new_count;

  IF new_count IS NULL THEN
    INSERT INTO public.rate_limits (identifier, window_start, request_count)
    VALUES (_identifier, _window_start, 1)
    ON CONFLICT (identifier, window_start)
      DO UPDATE SET request_count = public.rate_limits.request_count + 1
    RETURNING request_count INTO new_count;
  END IF;

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_rate_limit(text, timestamptz) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(text, timestamptz) TO service_role;
