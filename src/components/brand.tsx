import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Logo() {
  return <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="AIcyclopedia home"><span className="wordmark">AIcyclopedia<span className="text-ochre">.</span></span></Link>;
}
export function SiteHeader({ right }: { right?: ReactNode }) {
  return <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-md">
    <div className="editorial-wrap grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
      <div className="flex min-w-0 items-center gap-6"><Logo /><span className="hidden max-w-40 border-l pl-6 text-[10px] leading-relaxed text-muted-foreground lg:block">THE BUSINESS AUTOMATION ENCYCLOPEDIA</span></div>
      <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-5 text-sm">
        <Link to="/automations" className="hidden text-muted-foreground transition-colors hover:text-primary sm:inline">Automations</Link>
        {right ?? <Button asChild size="sm" className="h-10 px-4"><Link to="/setup">Get started <ArrowUpRight /></Link></Button>}
      </nav>
    </div>
  </header>;
}
export function SiteFooter() {
  return <footer className="border-t"><div className="editorial-wrap py-10">
    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><Logo /><nav className="flex gap-6 text-sm text-muted-foreground"><Link to="/automations">Automations</Link><Link to="/setup">Business setup</Link><Link to="/dashboard">Try the demo</Link></nav></div>
    <div className="mt-8 flex flex-col justify-between gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row"><span>The business automation encyclopedia.</span><span>Local-only demo · Sample data · Nothing is sent or charged.</span></div>
  </div></footer>;
}
export const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";
export const btnQuiet = "inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary";
export const btnOutline = "inline-flex items-center justify-center gap-2 rounded-md border border-input bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary";
export const fieldCls = "w-full rounded-md border border-input bg-surface px-4 py-3 text-[0.95rem] placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";
