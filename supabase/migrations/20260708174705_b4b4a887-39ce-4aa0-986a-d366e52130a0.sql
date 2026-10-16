
CREATE TABLE public.industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  hero_copy TEXT,
  pain_points JSONB DEFAULT '[]'::jsonb,
  stats_blurb TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.industries TO anon, authenticated;
GRANT ALL ON public.industries TO service_role;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published industries" ON public.industries FOR SELECT USING (published = true);

CREATE TABLE public.use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  buyer_pain TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.use_cases TO anon, authenticated;
GRANT ALL ON public.use_cases TO service_role;
ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published use cases" ON public.use_cases FOR SELECT USING (published = true);

CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  website_url TEXT,
  affiliate_url TEXT,
  logo_url TEXT,
  pricing_from NUMERIC,
  pricing_model TEXT,
  one_liner TEXT,
  description TEXT,
  pros JSONB DEFAULT '[]'::jsonb,
  cons JSONB DEFAULT '[]'::jsonb,
  integrations JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tools TO anon, authenticated;
GRANT ALL ON public.tools TO service_role;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published tools" ON public.tools FOR SELECT USING (published = true);

CREATE TABLE public.tool_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES public.industries(id) ON DELETE CASCADE,
  use_case_id UUID REFERENCES public.use_cases(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  fit_notes TEXT,
  verdict TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tool_rankings TO anon, authenticated;
GRANT ALL ON public.tool_rankings TO service_role;
ALTER TABLE public.tool_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view rankings for published tools" ON public.tool_rankings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tools t WHERE t.id = tool_rankings.tool_id AND t.published = true));

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  industry_slug TEXT,
  source_page TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT WITH CHECK (true);
