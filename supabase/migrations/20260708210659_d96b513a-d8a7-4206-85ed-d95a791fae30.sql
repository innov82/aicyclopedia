
CREATE TABLE public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (identifier, window_start)
);

CREATE INDEX rate_limits_identifier_window_idx
  ON public.rate_limits (identifier, window_start DESC);
CREATE INDEX rate_limits_created_at_idx
  ON public.rate_limits (created_at);

GRANT ALL ON public.rate_limits TO service_role;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies: only service_role (edge functions) accesses this table.
