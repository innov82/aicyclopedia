
REVOKE EXECUTE ON FUNCTION public.increment_rate_limit(text, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_rate_limit(text, timestamptz) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_rate_limit(text, timestamptz) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(text, timestamptz) TO service_role;
