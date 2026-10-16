import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  AlertCircle, ArrowLeft, CalendarCheck, Check, Clock, ExternalLink, Hand, LayoutGrid, Globe, Users, Zap,
  Pause, Play, RotateCcw, Send, Ban, Info, MessageSquare, X,
} from "lucide-react";
import { Logo, btnPrimary, btnOutline, fieldCls } from "@/components/brand";
import { AutomationCards } from "@/components/automation-cards";
import { Switch } from "@/components/ui/switch";
import {
  useDemo, resetDemo, setStage, setFollowUpPaused, setOwnerTakeover, setOwnerReply, logOwnerReply,
  setGlobalAutomations, updateSite, relTime, BUSINESS_LABEL, type Lead, type Stage, type TimelineEvent,
} from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const search = z.object({
  tab: z.enum(["overview", "leads", "website", "automations"]).optional().catch(undefined),
  lead: z.string().optional().catch(undefined),
  fresh: z.number().optional().catch(undefined),
});

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Demo dashboard — AIcyclopedia" },
      { name: "description", content: "Try the AIcyclopedia dashboard with sample leads, follow-ups, and automations. Demo mode — nothing is sent." },
      { property: "og:title", content: "Demo dashboard — AIcyclopedia" },
      { property: "og:description", content: "Sample leads, follow-ups, and automations in one calm view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Tab = "overview" | "leads" | "website" | "automations";
const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "leads", label: "Leads", icon: Users },
  { id: "website", label: "Website", icon: Globe },
  { id: "automations", label: "Automations", icon: Zap },
];
const STAGES: Stage[] = ["New", "Contacted", "Booked", "Lost"];

function Dashboard() {
  const demo = useDemo();
  const { tab = "overview", lead: leadId, fresh } = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard" });
  const go = (t: Tab, lead?: string) => navigate({ search: { tab: t, lead } });
  const attention = demo.leads.filter((l) => l.needsAttention);

  return (
    <div className="dashboard-ui min-h-dvh bg-background">
      <div role="status" className="bg-forest text-parchment">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-5 py-2 text-center text-sm">
          <Info className="h-4 w-4 shrink-0" aria-hidden />
          <span><strong className="font-semibold">Demo mode</strong> — sample data; no messages are sent.</span>
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 sm:flex sm:justify-between sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Logo />
            <span className="hidden truncate border-l pl-4 text-sm text-muted-foreground md:inline">
              {demo.business.name} · {BUSINESS_LABEL[demo.business.type]}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/site" className={cn(btnPrimary, "px-4 py-2 text-sm")}>
              <Send className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Test a new inquiry</span><span className="sm:hidden">Test</span>
            </Link>
            <Button variant="ghost" size="natural"
              onClick={() => {
                if (confirm("Reset the demo to its sample data?")) {
                  resetDemo();
                  go("overview");
                }
              }}
              className={cn(btnOutline, "px-3 py-2")}
              aria-label="Reset demo"
              title="Reset demo"
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> <span className="hidden lg:inline">Reset demo</span>
            </Button>
          </div>
        </div>
        <nav aria-label="Dashboard" className="mx-auto max-w-6xl overflow-x-auto px-3 sm:px-6">
          <ul className="flex gap-1">
            {TABS.map((t) => (
              <li key={t.id}>
                <Button variant="ghost" size="natural"
                  onClick={() => go(t.id)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-3 text-sm whitespace-nowrap transition-colors",
                    tab === t.id ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <t.icon className="h-4 w-4" aria-hidden />
                  {t.label}
                  {t.id === "leads" && attention.length > 0 && (
                    <span className="rounded-full bg-attention-soft px-1.5 text-xs font-medium text-attention">{attention.length}</span>
                  )}
                  {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {tab === "overview" && <Overview onOpen={(id) => go("leads", id)} />}
        {tab === "leads" && <Leads selectedId={leadId} fresh={!!fresh} onSelect={(id) => go("leads", id)} />}
        {tab === "website" && <WebsiteTab />}
        {tab === "automations" && <AutomationsTab />}
      </main>
    </div>
  );
}

// ---------------- Overview ----------------
function Overview({ onOpen }: { onOpen: (id: string) => void }) {
  const demo = useDemo();
  const attention = demo.leads.filter((l) => l.needsAttention);
  const booked = demo.leads.filter((l) => l.stage === "Booked");
  const scheduled = demo.leads.flatMap((l) =>
    l.timeline.filter((e) => e.status === "scheduled").map((e) => ({ e, l })),
  ).sort((a, b) => (a.e.dueAt ?? 0) - (b.e.dueAt ?? 0));
  const newCount = demo.leads.filter((l) => l.stage === "New").length;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Good to see you.</h1>
        </div>
        <AutomationMaster />
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
        {[
          ["Leads", demo.leads.length],
          ["New", newCount],
          ["Booked", booked.length],
          ["Scheduled follow-ups", scheduled.length],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface p-5">
            <dt className="text-sm text-muted-foreground">{k}</dt>
            <dd className="mt-1 font-display text-3xl">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="-mt-6 text-xs text-muted-foreground">Counts from sample data in this browser.</p>

      <section aria-labelledby="att-h">
        <h2 id="att-h" className="flex items-center gap-2 text-2xl">
          <AlertCircle className="h-5 w-5 text-attention" aria-hidden /> Needs your attention
        </h2>
        {attention.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">Nothing waiting on you. Nice.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {attention.map((l) => (
              <li key={l.id}>
                <Button variant="ghost" size="natural" onClick={() => onOpen(l.id)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-attention/25 bg-attention-soft/60 p-4 text-left transition-colors hover:bg-attention-soft">
                  <span className="min-w-0">
                    <span className="block font-medium">{l.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">“{l.inquiry}”</span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-attention">Reply →</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="recent-h">
          <h2 id="recent-h" className="text-2xl">Recent leads</h2>
          <ul className="mt-4 divide-y rounded-2xl border bg-surface">
            {demo.leads.slice(0, 5).map((l) => (
              <li key={l.id}>
                <Button variant="ghost" size="natural" onClick={() => onOpen(l.id)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-secondary/40">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{l.name}</span>
                    <span className="block text-xs text-muted-foreground">{relTime(l.createdAt)}</span>
                  </span>
                  <StageBadge stage={l.stage} />
                </Button>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="up-h">
          <h2 id="up-h" className="text-2xl">Coming up</h2>
          {scheduled.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">No follow-ups or reminders scheduled.</p>
          ) : (
            <ul className="mt-4 divide-y rounded-2xl border bg-surface">
              {scheduled.slice(0, 5).map(({ e, l }) => (
                <li key={e.id}>
                  <Button variant="ghost" size="natural" onClick={() => onOpen(l.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-secondary/40">
                    {e.kind === "reminder" ? <CalendarCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{e.kind === "reminder" ? "Appointment reminder" : "Booking follow-up"} · {l.name}</span>
                      <span className="block text-xs text-muted-foreground">Simulated · {e.dueAt ? relTime(e.dueAt) : ""}</span>
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function AutomationMaster() {
  const demo = useDemo();
  return (
    <label className="flex items-center gap-3 rounded-full border bg-surface py-2 pr-2 pl-4 text-sm">
      <span>
        Automations{" "}
        <strong className={demo.automationsEnabled ? "text-success" : "text-attention"}>
          {demo.automationsEnabled ? "running" : "paused"}
        </strong>
      </span>
      <Switch checked={demo.automationsEnabled} onCheckedChange={setGlobalAutomations} aria-label="Automations enabled (simulated)" />
    </label>
  );
}

function StageBadge({ stage }: { stage: Stage }) {
  const cls: Record<Stage, string> = {
    New: "bg-accent text-accent-foreground",
    Contacted: "bg-secondary text-foreground",
    Booked: "bg-success-soft text-success",
    Lost: "bg-muted text-muted-foreground",
  };
  return <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", cls[stage])}>{stage}</span>;
}

// ---------------- Leads ----------------
function Leads({ selectedId, fresh, onSelect }: { selectedId?: string; fresh: boolean; onSelect: (id?: string) => void }) {
  const demo = useDemo();
  const selected = demo.leads.find((l) => l.id === selectedId);
  const [showFresh, setShowFresh] = useState(fresh);
  useEffect(() => setShowFresh(fresh), [fresh, selectedId]);

  return (
    <div className="animate-in fade-in duration-300">
      {showFresh && selected && (
        <div role="status" className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-primary/25 bg-accent/60 p-4 text-sm">
          <p><strong>New inquiry from {selected.name} arrived.</strong> Any messages below are simulated and logged only — nothing was emailed or texted.</p>
          <Button variant="ghost" size="natural" onClick={() => setShowFresh(false)} aria-label="Dismiss" className="shrink-0 rounded-full p-1 hover:bg-background/60"><X className="h-4 w-4" /></Button>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <section aria-label="Leads list" className={cn(selected && "hidden lg:block")}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl">Leads</h1>
            <span className="text-sm text-muted-foreground">{demo.leads.length}</span>
          </div>
          <ul className="mt-4 divide-y rounded-2xl border bg-surface">
            {demo.leads.map((l) => (
              <li key={l.id}>
                <Button variant="ghost" size="natural"
                  onClick={() => onSelect(l.id)}
                  aria-current={l.id === selectedId ? "true" : undefined}
                  className={cn("block w-full px-4 py-3.5 text-left transition-colors", l.id === selectedId ? "bg-accent/50" : "hover:bg-secondary/40")}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 font-medium">
                      {l.needsAttention && <AlertCircle className="h-4 w-4 shrink-0 text-attention" aria-label="Needs attention" />}
                      <span className="truncate">{l.name}</span>
                    </span>
                    <StageBadge stage={l.stage} />
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted-foreground">{l.inquiry}</span>
                </Button>
              </li>
            ))}
          </ul>
        </section>
        {selected ? (
          <LeadDetail lead={selected} onBack={() => onSelect(undefined)} />
        ) : (
          <div className="hidden place-items-center rounded-2xl border border-dashed p-10 text-center text-muted-foreground lg:grid">
            <div>
              <MessageSquare className="mx-auto h-6 w-6" aria-hidden />
              <p className="mt-3">Pick a lead to see the conversation.</p>
              <Link to="/site" className="mt-4 inline-block text-sm text-primary underline underline-offset-4">Or test a new inquiry</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeadDetail({ lead, onBack }: { lead: Lead; onBack: () => void }) {
  const demo = useDemo();
  const automating = demo.automationsEnabled && !lead.followUpPaused && !lead.ownerTakeover;
  return (
    <section aria-labelledby="lead-h" className="min-w-0 rounded-2xl border bg-surface p-5 sm:p-7 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <Button variant="ghost" size="natural" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground lg:hidden">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All leads
      </Button>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id="lead-h" className="truncate text-3xl">{lead.name}</h2>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {lead.email}{lead.phone ? ` · ${lead.phone}` : ""} · {relTime(lead.createdAt)}
          </p>
        </div>
        <div>
          <label htmlFor="stage" className="sr-only">Stage</label>
          <select id="stage" value={lead.stage} onChange={(e) => setStage(lead.id, e.target.value as Stage)} className={cn(fieldCls, "w-auto py-2 pr-8")}>
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1", automating ? "bg-success-soft text-success" : "bg-attention-soft text-attention")}>
          {automating ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
          {lead.ownerTakeover ? "You're handling this lead" : lead.followUpPaused ? "Follow-up paused" : demo.automationsEnabled ? "Automations active" : "All automations paused"}
        </span>
        <Button variant="ghost" size="natural" onClick={() => setFollowUpPaused(lead.id, !lead.followUpPaused)} className={cn(btnOutline, "px-3.5 py-1.5")} disabled={lead.ownerTakeover}>
          {lead.followUpPaused ? <><Play className="h-3.5 w-3.5" /> Resume follow-up</> : <><Pause className="h-3.5 w-3.5" /> Pause follow-up</>}
        </Button>
        <Button variant="ghost" size="natural" onClick={() => setOwnerTakeover(lead.id, !lead.ownerTakeover)} className={cn(btnOutline, "px-3.5 py-1.5")}>
          <Hand className="h-3.5 w-3.5" /> {lead.ownerTakeover ? "Hand back" : "Take over"}
        </Button>
      </div>

      <div className="mt-7">
        <p className="text-xs font-medium text-muted-foreground">Their inquiry</p>
        <p className="mt-2 rounded-xl bg-secondary/70 px-4 py-3">“{lead.inquiry}”</p>
      </div>

      {lead.needsAttention && (
        <div className="mt-6 rounded-xl border border-attention/30 bg-attention-soft/60 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-attention">
            <AlertCircle className="h-4 w-4" aria-hidden /> Needs your attention
          </p>
          <p className="mt-1 text-sm text-muted-foreground">This question isn't covered by your saved answers, so nothing was guessed. Write the reply yourself.</p>
          <label htmlFor="owner-reply" className="mt-4 block text-sm font-medium">Your response</label>
          <textarea
            id="owner-reply"
            rows={3}
            value={lead.ownerReply}
            onChange={(e) => setOwnerReply(lead.id, e.target.value)}
            placeholder={`Hi ${lead.name.split(" ")[0]}, thanks for asking — `}
            className={cn(fieldCls, "mt-2")}
          />
          <Button variant="ghost" size="natural" onClick={() => logOwnerReply(lead.id)} disabled={!lead.ownerReply.trim()} className={cn(btnPrimary, "mt-3 px-4 py-2 text-sm disabled:opacity-50")}>
            Log reply (simulated)
          </Button>
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-sans text-sm font-semibold tracking-normal">Activity</h3>
        <ol className="mt-4 space-y-0">
          {[...lead.timeline].reverse().map((e, i, arr) => (
            <TimelineRow key={e.id} e={e} last={i === arr.length - 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function TimelineRow({ e, last }: { e: TimelineEvent; last: boolean }) {
  const icon =
    e.status === "cancelled" ? <Ban className="h-3.5 w-3.5" /> :
    e.status === "scheduled" ? <Clock className="h-3.5 w-3.5" /> :
    e.kind === "flag" ? <AlertCircle className="h-3.5 w-3.5" /> :
    e.kind === "owner" ? <Hand className="h-3.5 w-3.5" /> :
    e.status === "simulated" ? <Check className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />;
  const tone =
    e.status === "cancelled" ? "text-muted-foreground bg-muted" :
    e.status === "scheduled" ? "text-primary bg-accent" :
    e.kind === "flag" ? "text-attention bg-attention-soft" :
    e.status === "simulated" ? "text-success bg-success-soft" : "text-muted-foreground bg-secondary";
  const label = e.status === "simulated" ? "Simulated" : e.status === "scheduled" ? "Scheduled · simulated" : e.status === "cancelled" ? "Cancelled" : null;
  return (
    <li className="relative flex gap-4 pb-5">
      {!last && <span aria-hidden className="absolute top-7 bottom-0 left-[13px] w-px bg-border" />}
      <span className={cn("relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", tone)} aria-hidden>{icon}</span>
      <div className="min-w-0 pt-0.5">
        <p className={cn("text-sm", e.status === "cancelled" && "text-muted-foreground line-through decoration-muted-foreground/40")}>{e.text}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {relTime(e.at)}
          {e.dueAt && e.status === "scheduled" ? ` · due ${relTime(e.dueAt)}` : ""}
          {label ? ` · ${label}` : ""}
        </p>
      </div>
    </li>
  );
}

// ---------------- Website ----------------
function WebsiteTab() {
  const demo = useDemo();
  const [site, setSite] = useState(demo.site);
  const [saved, setSaved] = useState(false);
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] animate-in fade-in duration-300">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateSite({ headline: site.headline.slice(0, 140), tagline: site.tagline.slice(0, 300), services: site.services.slice(0, 600) });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className="space-y-6"
      >
        <div>
          <p className="eyebrow">Website</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Your example website</h1>
          <p className="mt-2 text-muted-foreground">Edit the words, then open it to send a test inquiry.</p>
        </div>
        <div>
          <label htmlFor="w-h" className="text-sm font-medium">Headline</label>
          <input id="w-h" value={site.headline} onChange={(e) => setSite({ ...site, headline: e.target.value })} maxLength={140} className={cn(fieldCls, "mt-2")} />
        </div>
        <div>
          <label htmlFor="w-t" className="text-sm font-medium">Short description</label>
          <textarea id="w-t" rows={3} value={site.tagline} onChange={(e) => setSite({ ...site, tagline: e.target.value })} maxLength={300} className={cn(fieldCls, "mt-2")} />
        </div>
        <div>
          <label htmlFor="w-s" className="text-sm font-medium">Services <span className="font-normal text-muted-foreground">(one per line)</span></label>
          <textarea id="w-s" rows={4} value={site.services} onChange={(e) => setSite({ ...site, services: e.target.value })} maxLength={600} className={cn(fieldCls, "mt-2")} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="natural" type="submit" className={btnPrimary}>{saved ? <><Check className="h-4 w-4" /> Saved</> : "Save changes"}</Button>
          <Link to="/site" className={btnOutline}>Open website <ExternalLink className="h-4 w-4" aria-hidden /></Link>
        </div>
      </form>
      <aside aria-label="Preview" className="h-fit rounded-2xl border bg-surface p-6">
        <p className="text-xs text-muted-foreground">Preview</p>
        <p className="mt-4 font-display text-sm text-muted-foreground">{demo.business.name}</p>
        <p className="mt-2 font-display text-2xl leading-tight">{site.headline}</p>
        <p className="mt-3 text-sm text-muted-foreground">{site.tagline}</p>
        <div className="mt-5 rounded-xl border bg-background p-4 text-sm text-muted-foreground">Inquiry form · Name · Email · Phone · Message</div>
      </aside>
    </div>
  );
}

// ---------------- Automations ----------------
function AutomationsTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Automations</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">What runs for you</h1>
          <p className="mt-2 max-w-lg text-muted-foreground">Simulated. Turning something off stops it from being logged on new inquiries and stage changes.</p>
        </div>
        <AutomationMaster />
      </div>
      <AutomationCards />
    </div>
  );
}
