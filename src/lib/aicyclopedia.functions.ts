import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function serverClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    },
  );
}

export type IndustrySummary = {
  id: string;
  name: string;
  slug: string;
  category: string;
  hero_copy: string | null;
  tool_count: number;
};

export const listPublishedIndustries = createServerFn({ method: "GET" }).handler(
  async (): Promise<IndustrySummary[]> => {
    const supabase = serverClient();
    const { data, error } = await supabase
      .from("industries")
      .select(
        "id, name, slug, category, hero_copy, tool_rankings(tool_id, tool:tools!inner(published))",
      )
      .eq("published", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((i) => {
      const rankings = (i.tool_rankings ?? []) as Array<{
        tool_id: string;
        tool: { published: boolean } | null;
      }>;
      const toolIds = new Set(
        rankings.filter((r) => r.tool?.published).map((r) => r.tool_id),
      );
      return {
        id: i.id,
        name: i.name,
        slug: i.slug,
        category: i.category,
        hero_copy: i.hero_copy,
        tool_count: toolIds.size,
      };
    });
  },
);

const leadSchema = z.object({
  email: z.string().trim().email().max(255),
  industry_slug: z.string().trim().max(120).optional().nullable(),
  source_page: z.string().trim().max(255).optional().nullable(),
  problem_text: z.string().trim().max(2000).optional().nullable(),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const { error } = await supabase.from("leads").insert({
      email: data.email,
      industry_slug: data.industry_slug ?? null,
      source_page: data.source_page ?? null,
      problem_text: data.problem_text ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ------------------- Detail pages -------------------

export type IndustryFull = {
  id: string;
  name: string;
  slug: string;
  category: string;
  hero_copy: string | null;
  stats_blurb: string | null;
  pain_points: string[] | null;
};

export type UseCaseSummary = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  tool_count: number;
};

export type ToolSummary = {
  id: string;
  name: string;
  slug: string;
  one_liner: string | null;
  logo_url: string | null;
  pricing_from: number | null;
  pricing_model: string | null;
  affiliate_url: string | null;
  website_url: string | null;
  featured: boolean;
  avg_rank: number;
};


export const getIndustryPage = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().max(120) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const { data: industry, error } = await supabase
      .from("industries")
      .select("id, name, slug, category, hero_copy, stats_blurb, pain_points")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!industry) return null;

    const { data: rankings, error: rErr } = await supabase
      .from("tool_rankings")
      .select(
        "rank, tool:tools(id,name,slug,one_liner,logo_url,pricing_from,pricing_model,affiliate_url,website_url,featured,published), use_case:use_cases(id,name,slug,short_description,published)",
      )
      .eq("industry_id", industry.id);
    if (rErr) throw new Error(rErr.message);

    const useCasesMap = new Map<string, UseCaseSummary>();
    const toolAgg = new Map<
      string,
      { tool: NonNullable<(typeof rankings)[number]["tool"]>; sum: number; count: number }
    >();

    for (const r of rankings ?? []) {
      const uc = r.use_case;
      if (uc && uc.published) {
        const existing = useCasesMap.get(uc.id);
        if (existing) existing.tool_count += 1;
        else
          useCasesMap.set(uc.id, {
            id: uc.id,
            name: uc.name,
            slug: uc.slug,
            short_description: uc.short_description,
            tool_count: 1,
          });
      }
      const t = r.tool;
      if (t && t.published) {
        const cur = toolAgg.get(t.id) ?? { tool: t, sum: 0, count: 0 };
        cur.sum += r.rank;
        cur.count += 1;
        toolAgg.set(t.id, cur);
      }
    }

    const topTools: ToolSummary[] = Array.from(toolAgg.values())
      .map((x) => ({
        id: x.tool.id,
        name: x.tool.name,
        slug: x.tool.slug,
        one_liner: x.tool.one_liner,
        logo_url: x.tool.logo_url,
        pricing_from: x.tool.pricing_from,
        pricing_model: x.tool.pricing_model,
        affiliate_url: x.tool.affiliate_url,
        website_url: x.tool.website_url,
        featured: Boolean((x.tool as { featured?: boolean }).featured),
        avg_rank: x.sum / x.count,
      }))

      .sort((a, b) => a.avg_rank - b.avg_rank)
      .slice(0, 3);

    return {
      industry: {
        ...industry,
        pain_points: Array.isArray(industry.pain_points)
          ? (industry.pain_points as unknown[]).map(String)
          : null,
      } as IndustryFull,
      useCases: Array.from(useCasesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      topTools,
    };
  });

export const getUseCasePage = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ industrySlug: z.string().max(120), useCaseSlug: z.string().max(120) }).parse(d),
  )
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const [{ data: industry }, { data: useCase }] = await Promise.all([
      supabase
        .from("industries")
        .select("id, name, slug, category, hero_copy, stats_blurb")
        .eq("slug", data.industrySlug)
        .eq("published", true)
        .maybeSingle(),
      supabase
        .from("use_cases")
        .select("id, name, slug, short_description, buyer_pain")
        .eq("slug", data.useCaseSlug)
        .eq("published", true)
        .maybeSingle(),
    ]);
    if (!industry || !useCase) return null;

    const { data: rankings, error } = await supabase
      .from("tool_rankings")
      .select(
        "id, rank, verdict, fit_notes, tool:tools(id,name,slug,one_liner,description,logo_url,pricing_from,pricing_model,affiliate_url,website_url,integrations,featured,published)",
      )
      .eq("industry_id", industry.id)
      .eq("use_case_id", useCase.id)
      .order("rank", { ascending: true });
    if (error) throw new Error(error.message);

    const { data: relatedRankings } = await supabase
      .from("tool_rankings")
      .select("use_case:use_cases(id,name,slug,short_description,published)")
      .eq("industry_id", industry.id);

    const related: UseCaseSummary[] = [];
    const seen = new Set<string>([useCase.id]);
    for (const r of relatedRankings ?? []) {
      const uc = r.use_case;
      if (uc && uc.published && !seen.has(uc.id)) {
        seen.add(uc.id);
        related.push({
          id: uc.id,
          name: uc.name,
          slug: uc.slug,
          short_description: uc.short_description,
          tool_count: 0,
        });
        if (related.length >= 3) break;
      }
    }

    return {
      industry,
      useCase,
      rankings: (rankings ?? []).filter((r) => r.tool && r.tool.published),
      related,
    };
  });

export const getToolPage = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().max(120) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = serverClient();
    const { data: tool, error } = await supabase
      .from("tools")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!tool) return null;

    const { data: rankings, error: rErr } = await supabase
      .from("tool_rankings")
      .select(
        "rank, verdict, fit_notes, industry:industries(name,slug,published), use_case:use_cases(name,slug,published)",
      )
      .eq("tool_id", tool.id)
      .order("rank", { ascending: true });
    if (rErr) throw new Error(rErr.message);

    return {
      tool,
      rankings: (rankings ?? []).filter(
        (r) => r.industry && r.industry.published && r.use_case && r.use_case.published,
      ),
    };
  });

// ------------------- Admin -------------------
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const adminListLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("id, email, industry_slug, source_page, problem_text, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListRankings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("tool_rankings")
      .select(
        "id, rank, verdict, fit_notes, tool:tools(name,slug), industry:industries(name,slug), use_case:use_cases(name,slug)",
      )
      .order("rank", { ascending: true })
      .limit(1000);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const rankingUpdateSchema = z.object({
  id: z.string().uuid(),
  rank: z.number().int().min(1).max(999),
  verdict: z.string().trim().max(200).nullable().optional(),
  fit_notes: z.string().trim().max(2000).nullable().optional(),
});

export const adminUpdateRanking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => rankingUpdateSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("tool_rankings")
      .update({
        rank: data.rank,
        verdict: data.verdict ?? null,
        fit_notes: data.fit_notes ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
