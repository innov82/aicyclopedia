import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Clock, Scissors, Wrench, Store } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import studio from "@/assets/business-studio.jpg.asset.json";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({ meta: [
    { title: "AIcyclopedia — Make room for the work you love" },
    { name: "description", content: "Your business website, a focused lead dashboard, and automated follow-up. Explore one simple business setup in the AIcyclopedia local demo." },
    { property: "og:title", content: "AIcyclopedia — Make room for the work you love" },
    { property: "og:description", content: "A thoughtful business website, a calm dashboard, and follow-up that happens for you." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Home,
});

function Home() {
  const demo = useDemo();
  const lead = demo.leads[0];
  const scheduled = lead?.timeline.find(e => e.status === "scheduled");
  return <div className="min-h-dvh"><SiteHeader /><main>
    <section className="editorial-hero">
      <img src={studio.url} alt="A shop owner welcoming a customer in a bright, carefully considered workspace" width={1536} height={1024} fetchPriority="high" className="hero-photo" />
      <div className="hero-shade" />
      <div className="editorial-wrap hero-content reveal">
        <p className="mb-5 text-[11px] font-medium text-ochre">LESS ADMIN. MORE BUSINESS.</p>
        <h1>Make room for<br />the work you love.</h1>
        <p className="hero-description mt-6 text-base leading-relaxed">Your website brings in inquiries. Your dashboard keeps them in order. Automated follow-up takes care of what comes next.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild className="h-12 bg-ochre px-5 text-forest hover:bg-ochre/90"><Link to="/setup">Build my business setup <ArrowUpRight /></Link></Button>
          <Button asChild variant="ghost" className="h-12 px-2 text-parchment hover:bg-parchment/10 hover:text-parchment"><Link to="/automations">Explore automations <ArrowRight /></Link></Button>
        </div>
        <p className="mt-5 text-[11px] text-parchment/65">Try the local demo. No account, no commitment.</p>
      </div>
      <p className="hero-caption">At the counter, not behind a screen. · Photo: Unsplash</p>
    </section>
    <div className="bg-forest"><div className="editorial-wrap activity-ribbon">
      <div><p className="mb-2 text-ochre">A GLIMPSE OF YOUR DAY · SAMPLE DATA</p><p className="font-medium">{lead?.name ?? "Your next customer"} <span className="text-parchment/60">· {lead?.stage ?? "New inquiry"}</span></p></div>
      <div className="flex items-center gap-3"><Check className="h-4 w-4 shrink-0 text-ochre" /><div><p>{lead?.timeline.find(e => e.kind === "ack")?.text ?? "Inquiry activity appears in your dashboard"}</p><p className="detail mt-1">Illustrative activity · Nothing sent</p></div></div>
      <div className="flex items-center gap-3"><Clock className="h-4 w-4 shrink-0 text-ochre" /><div><p>{scheduled ? "Follow-up scheduled" : "Every inquiry, in one place"}</p><Link to="/dashboard" className="detail mt-1 inline-flex items-center gap-2 underline underline-offset-4">Open the actual demo <ArrowUpRight className="h-3 w-3" /></Link></div></div>
    </div></div>
    <section className="border-b"><div className="editorial-wrap flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between"><p className="eyebrow">Built around your business</p><div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">{[{name:"Beauty & brows",icon:Scissors},{name:"Home services",icon:Wrench},{name:"Your business",icon:Store}].map(({name,icon:Icon})=><Link to="/setup" key={name} className="flex items-center gap-3 text-sm transition-colors hover:text-attention"><Icon className="h-4 w-4 text-muted-foreground" />{name}<ArrowUpRight className="h-3 w-3" /></Link>)}</div></div></section>
    <section className="editorial-wrap py-14 sm:py-16">
      <div className="mb-8 grid gap-3 sm:grid-cols-2 sm:items-end"><div><p className="eyebrow mb-3">A connected way to work</p><h2 className="text-3xl sm:text-4xl">From first hello to next visit.</h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:justify-self-end">Three parts. One simple setup. You stay in control of the conversations that need a human touch.</p></div>
      <div className="walkthrough">
        <section><div className="walkthrough-preview"><p className="mb-4 text-[10px] text-muted-foreground">YOUR WEBSITE</p><p className="font-display text-xl">{demo.business.name}</p><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{demo.site.tagline}</p><div className="mt-4 border-t pt-3"><Link to="/site" className="inline-flex items-center gap-2 text-xs font-medium">Send an inquiry <ArrowUpRight className="h-3 w-3" /></Link></div></div><p className="eyebrow mt-5">01 / Website</p><h3 className="mt-2 text-2xl">A welcoming front door.</h3><p className="mt-2 text-sm text-muted-foreground">Your services, your words, and a clear way to get in touch.</p></section>
        <section><div className="walkthrough-preview"><p className="mb-3 text-[10px] text-muted-foreground">YOUR DASHBOARD · SAMPLE LEADS</p><div className="divide-y">{demo.leads.slice(0,3).map(l=><Link key={l.id} to="/dashboard" search={{tab:"leads",lead:l.id}} className="flex items-center justify-between gap-3 py-3"><span className="truncate text-xs font-medium">{l.name}</span><span className="shrink-0 rounded-sm bg-accent px-2 py-1 text-[10px] text-primary">{l.stage}</span></Link>)}</div></div><p className="eyebrow mt-5">02 / Dashboard</p><h3 className="mt-2 text-2xl">Nothing slips through.</h3><p className="mt-2 text-sm text-muted-foreground">Every inquiry, its next step, and the ones that need you.</p></section>
        <section><div className="walkthrough-preview bg-accent/40"><p className="mb-4 text-[10px] text-muted-foreground">YOUR FOLLOW-UP · SIMULATED</p><div className="space-y-4">{[{icon:Check,text:"Acknowledge the inquiry"},{icon:Clock,text:"Follow up about booking"},{icon:Clock,text:"Remind them before their visit"}].map(({icon:Icon,text})=><div key={text} className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border bg-surface"><Icon className="h-3 w-3 text-primary" /></span><p className="text-xs">{text}</p></div>)}</div></div><p className="eyebrow mt-5">03 / Follow-up</p><h3 className="mt-2 text-2xl">Thoughtful. On time.</h3><p className="mt-2 text-sm text-muted-foreground">Simple reminders run for you. Unusual questions come to you.</p></section>
      </div>
    </section>
    <section className="package-band"><div className="editorial-wrap grid gap-8 py-12 md:grid-cols-[1.1fr_1fr_auto] md:items-center"><div><p className="mb-3 text-[11px] text-ochre">ONE PACKAGE. THE ESSENTIALS.</p><h2 className="text-3xl">Business essentials.</h2><p className="mt-3 max-w-sm text-sm leading-relaxed text-parchment/70">A website, lead dashboard, and the follow-ups that keep business moving.</p></div><ul className="space-y-3 text-sm text-parchment/85">{["Inquiry acknowledgment & booking follow-up","Appointment reminders & review requests","Human handoff when it matters"].map(t=><li key={t} className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ochre" />{t}</li>)}</ul><div><Button asChild className="h-12 bg-ochre text-forest hover:bg-ochre/90"><Link to="/setup">Build my setup <ArrowUpRight /></Link></Button><p className="mt-3 text-[10px] text-parchment/60">Illustrative pilot pricing in setup.<br />Nothing charged in this demo.</p></div></div></section>
  </main><SiteFooter /></div>;
}
