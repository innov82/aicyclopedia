import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Info } from "lucide-react";
import { useDemo, submitInquiry } from "@/lib/demo-store";
import { btnPrimary, fieldCls } from "@/components/brand";
import studio from "@/assets/business-studio.jpg.asset.json";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/site")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Example business website — AIcyclopedia demo" },
      { name: "description", content: "An example business website with a working inquiry form that feeds the demo dashboard." },
      { property: "og:title", content: "Example business website — AIcyclopedia demo" },
      { property: "og:description", content: "Send a test inquiry and watch it arrive in the dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SitePage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(80),
  email: z.string().trim().email("Please enter a valid email").max(200),
  phone: z.string().trim().max(30).optional(),
  inquiry: z.string().trim().min(3, "Tell us a little about what you need").max(1000),
});

function SitePage() {
  const demo = useDemo();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", inquiry: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const services = demo.site.services.split("\n").map((s) => s.trim()).filter(Boolean);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      for (const i of r.error.issues) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    const id = submitInquiry(r.data);
    navigate({ to: "/dashboard", search: { tab: "leads", lead: id, fresh: 1 } });
  }

  const field = (k: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`f-${k}`} className="text-sm font-medium">{label}</label>
      <input
        id={`f-${k}`}
        value={form[k]}
        onChange={(e) => setForm({ ...form, [k]: e.target.value })}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `e-${k}` : undefined}
        className={cn(fieldCls, "mt-2")}
        {...props}
      />
      {errors[k] && <p id={`e-${k}`} className="mt-1.5 text-sm text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="min-h-dvh bg-surface">
      <div className="sticky top-0 z-30 border-b bg-forest text-parchment">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-2.5 text-sm sm:px-8">
          <span className="flex min-w-0 items-center gap-2">
            <Info className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-[11px] leading-relaxed sm:text-sm">Example website — demo mode. Inquiries go to your demo dashboard only.</span>
          </span>
          <Link to="/dashboard" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-background/15 px-3 py-1 font-medium hover:bg-background/25">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Dashboard
          </Link>
        </div>
      </div>

      <header className="mx-auto max-w-5xl px-5 pt-8 sm:px-8">
        <p className="font-display text-xl">{demo.business.name}</p>
      </header>

      <main className="mx-auto grid max-w-5xl gap-14 px-5 py-14 sm:px-8 md:grid-cols-[1.1fr_1fr] md:py-20">
        <section className="min-w-0">
          <img src={studio.url} width={1536} height={1024} alt="A warm welcome at a small business workspace" className="studio-image mb-7" />
          <h1 className="text-3xl leading-tight sm:text-4xl">{demo.site.headline}</h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">{demo.site.tagline}</p>
          {services.length > 0 && (
            <>
              <h2 className="mt-12 font-sans text-sm font-semibold tracking-normal">Services</h2>
              <ul className="mt-3 divide-y border-y">
                {services.map((s) => (
                  <li key={s} className="py-3">{s}</li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-8 text-sm text-muted-foreground">
            Edit this page from the <Link to="/dashboard" search={{ tab: "website" }} className="underline underline-offset-4">Website tab</Link>.
          </p>
        </section>

        <section aria-labelledby="contact-title" className="h-fit border-t-2 border-primary bg-background p-6 sm:p-8">
          <h2 id="contact-title" className="text-2xl">Send an inquiry</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try a normal question, or something unusual to see it flagged.</p>
          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            {field("name", "Name", { autoComplete: "name", required: true })}
            {field("email", "Email", { type: "email", autoComplete: "email", required: true })}
            {field("phone", "Phone (optional)", { type: "tel", autoComplete: "tel" })}
            <div>
              <label htmlFor="f-inquiry" className="text-sm font-medium">How can we help?</label>
              <textarea
                id="f-inquiry"
                rows={4}
                value={form.inquiry}
                onChange={(e) => setForm({ ...form, inquiry: e.target.value })}
                aria-invalid={!!errors.inquiry}
                aria-describedby={errors.inquiry ? "e-inquiry" : undefined}
                className={cn(fieldCls, "mt-2 resize-y")}
                placeholder="e.g. Do you have anything open next Tuesday?"
              />
              {errors.inquiry && <p id="e-inquiry" className="mt-1.5 text-sm text-destructive">{errors.inquiry}</p>}
            </div>
            <Button variant="ghost" size="natural" type="submit" className={cn(btnPrimary, "w-full")}>Send inquiry</Button>
            <p className="text-center text-xs text-muted-foreground">Demo: nothing is emailed or texted.</p>
          </form>
        </section>
      </main>
    </div>
  );
}
