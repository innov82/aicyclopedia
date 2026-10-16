import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ArrowRight, Sparkles, Scissors, Wrench, Store } from "lucide-react";
import { SiteHeader, SiteFooter, btnPrimary, btnOutline, fieldCls } from "@/components/brand";
import { setupBusiness, useDemo, GOAL_LABEL, BUSINESS_LABEL, type BusinessType, type Goal } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/setup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set up your demo — AIcyclopedia" },
      { name: "description", content: "Tell us your business type and goal. We'll recommend one simple package to try." },
      { property: "og:title", content: "Set up your demo — AIcyclopedia" },
      { property: "og:description", content: "One quick step to see AIcyclopedia working for your business." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Setup,
});

const TYPES: { id: BusinessType; icon: typeof Scissors }[] = [
  { id: "beauty", icon: Scissors },
  { id: "home", icon: Wrench },
  { id: "other", icon: Store },
];
const GOALS: Goal[] = ["book", "follow", "return"];

const INCLUDED = [
  "Your business website with an inquiry form",
  "Lead dashboard",
  "Instant inquiry acknowledgment",
  "Booking follow-up",
  "Appointment reminders",
  "Review requests",
];

function Setup() {
  const demo = useDemo();
  const [type, setType] = useState<BusinessType>(demo.business.type);
  const [name, setName] = useState(demo.business.name);
  const [goal, setGoal] = useState<Goal>(demo.business.goal);
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setupBusiness({ type, name: name.trim() || "Willow Brow Studio", goal });
    setDone(true);
    requestAnimationFrame(() => document.getElementById("package")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pt-12 pb-16 sm:px-8 sm:pt-16">
        <p className="eyebrow">Your business, considered</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Tell us about your business.</h1>
        <p className="mt-3 text-muted-foreground">A website, a focused dashboard, and thoughtful follow-up. One simple setup.</p>

        <form onSubmit={submit} className="mt-10 space-y-9">
          <fieldset>
            <legend className="text-sm font-medium">Business type</legend>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup">
              {TYPES.map((t) => (
                <label
                  key={t.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border bg-surface px-4 py-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                    type === t.id ? "border-primary bg-accent/50" : "hover:bg-secondary/60",
                  )}
                >
                  <input type="radio" name="type" value={t.id} checked={type === t.id} onChange={() => setType(t.id)} className="sr-only" />
                  <t.icon className={cn("h-4 w-4 shrink-0", type === t.id ? "text-primary" : "text-muted-foreground")} aria-hidden />
                  <span className="text-sm font-medium">{BUSINESS_LABEL[t.id]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="bname" className="text-sm font-medium">Business name</label>
            <input id="bname" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={cn(fieldCls, "mt-3")} />
          </div>

          <fieldset>
            <legend className="text-sm font-medium">Primary goal</legend>
            <div className="mt-3 inline-flex w-full flex-col gap-1 rounded-2xl border bg-secondary/60 p-1 sm:flex-row" role="radiogroup">
              {GOALS.map((g) => (
                <label
                  key={g}
                  className={cn(
                    "flex-1 cursor-pointer rounded-xl px-3 py-2.5 text-center text-sm transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                    goal === g ? "bg-surface font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <input type="radio" name="goal" value={g} checked={goal === g} onChange={() => setGoal(g)} className="sr-only" />
                  {GOAL_LABEL[g]}
                </label>
              ))}
            </div>
          </fieldset>

          <Button variant="ghost" size="natural" type="submit" className={btnPrimary}>
            {done ? "Update recommendation" : "See my recommendation"} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {done && (
          <section id="package" aria-labelledby="pkg-title" className="mt-16 scroll-mt-24 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <p className="eyebrow flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden /> Recommended for {name || "your business"}
            </p>
            <div className="mt-4 border-y border-primary/20 bg-surface px-6 py-9 sm:px-9">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id="pkg-title" className="text-3xl">Business essentials</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Tuned for: {GOAL_LABEL[goal].toLowerCase()}</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-display text-4xl">
                    $199<span className="text-base text-muted-foreground">/month</span>
                  </p>
                  <p className="text-sm text-muted-foreground">+ messaging usage</p>
                </div>
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {INCLUDED.map((i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {i}
                  </li>
                ))}
              </ul>
              <p className="mt-8 rounded-xl bg-secondary/70 px-4 py-3 text-xs text-muted-foreground">
                Illustrative pilot pricing for discussion only. Nothing is charged and there is no checkout in this demo.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to="/dashboard" className={btnPrimary}>Try the demo</Link>
                <Link to="/site" className={btnOutline}>View example website</Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
