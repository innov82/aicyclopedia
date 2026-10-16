import { useMemo } from "react";
import { Zap, Send, Hand } from "lucide-react";
import { AUTOMATIONS } from "@/lib/automations";
import { GOAL_LABEL, setAutomation, useDemo, type Goal } from "@/lib/demo-store";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function AutomationCards({ query = "", goal = "all" }: { query?: string; goal?: Goal | "all" }) {
  const demo = useDemo();
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AUTOMATIONS.filter(
      (a) => (goal === "all" || a.goal === goal) && (!q || [a.title, a.trigger, a.action, a.handoff].join(" ").toLowerCase().includes(q)),
    );
  }, [query, goal]);
  const groups = (["book", "follow", "return"] as Goal[]).map((g) => [g, list.filter((a) => a.goal === g)] as const).filter(([, l]) => l.length);

  if (!groups.length) return <p className="py-10 text-muted-foreground">No automations match that search.</p>;
  return (
    <div className="space-y-12">
      {groups.map(([g, items]) => (
        <section key={g}>
          <h2 className="font-sans text-sm font-semibold tracking-normal text-muted-foreground">{GOAL_LABEL[g]}</h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {items.map((a) => {
              const on = demo.automations[a.id];
              return (
                <li key={a.id} className="rounded-lg border-t-2 border-t-primary/30 bg-surface p-6 transition-colors hover:bg-accent/30">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                    <h3 className="min-w-0 text-xl">{a.title}</h3>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={cn("text-xs", on ? "text-primary" : "text-muted-foreground")}>{on ? "On" : "Off"}</span>
                      <Switch checked={on} onCheckedChange={(v) => setAutomation(a.id, v)} aria-label={`${a.title} — simulated`} />
                    </div>
                  </div>
                  <dl className="mt-5 space-y-3 text-sm">
                    <Row icon={Zap} label="When" text={a.trigger} />
                    <Row icon={Send} label="Then" text={a.action} />
                    <Row icon={Hand} label="You" text={a.handoff} />
                  </dl>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Row({ icon: Icon, label, text }: { icon: typeof Zap; label: string; text: string }) {
  return (
    <div className="grid grid-cols-[1.25rem_3rem_minmax(0,1fr)] items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
      <dt className="font-medium">{label}</dt>
      <dd className="text-muted-foreground">{text}</dd>
    </div>
  );
}

