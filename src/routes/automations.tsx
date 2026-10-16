import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { AutomationCards } from "@/components/automation-cards";
import { SiteHeader, SiteFooter, fieldCls } from "@/components/brand";
import { GOAL_LABEL, type Goal } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/automations")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Explore automations — AIcyclopedia" },
      { name: "description", content: "Six plain-language automations for small businesses, grouped by goal: booking, follow-up, and bringing customers back." },
      { property: "og:title", content: "Explore automations — AIcyclopedia" },
      { property: "og:description", content: "Six plain-language automations, each with a clear trigger, action, and handoff to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AutomationsPage,
});

const FILTERS: (Goal | "all")[] = ["all", "book", "follow", "return"];

function AutomationsPage() {
  const [q, setQ] = useState("");
  const [goal, setGoal] = useState<Goal | "all">("all");
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pt-14 pb-24 sm:px-8">
        <p className="eyebrow">Explore automations</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">The quiet work, taken care of.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Each one is a simple rule. Toggles here change your <Link to="/dashboard" className="underline underline-offset-4">demo dashboard</Link> — they're simulated, nothing is sent.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <label htmlFor="auto-q" className="sr-only">Search automations</label>
            <input id="auto-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className={cn(fieldCls, "pl-10 py-2.5")} />
          </div>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by goal">
            {FILTERS.map((f) => (
              <Button variant="ghost" size="natural"
                key={f}
                onClick={() => setGoal(f)}
                aria-pressed={goal === f}
                className={cn("rounded-full px-3.5 py-2 text-sm transition-colors", goal === f ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary")}
              >
                {f === "all" ? "All" : GOAL_LABEL[f]}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-10">
          <AutomationCards query={q} goal={goal} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
