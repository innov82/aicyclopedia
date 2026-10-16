import { useSyncExternalStore } from "react";

export type BusinessType = "beauty" | "home" | "other";
export type Goal = "book" | "follow" | "return";
export type Stage = "New" | "Contacted" | "Booked" | "Lost";

export type EventKind =
  | "inquiry"
  | "ack"
  | "followup"
  | "reminder"
  | "review"
  | "stage"
  | "flag"
  | "owner"
  | "paused"
  | "skipped";

export type TimelineEvent = {
  id: string;
  at: number;
  kind: EventKind;
  text: string;
  status?: "simulated" | "scheduled" | "cancelled" | "info";
  dueAt?: number;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  inquiry: string;
  stage: Stage;
  createdAt: number;
  ownerTakeover: boolean;
  followUpPaused: boolean;
  needsAttention: boolean;
  ownerReply: string;
  timeline: TimelineEvent[];
};

export type AutomationId =
  | "inquiry-ack"
  | "lead-chase"
  | "unknown-question"
  | "booking-reminder"
  | "review-request"
  | "win-back";

export type Site = { headline: string; tagline: string; services: string };

export type DemoState = {
  version: 1;
  business: { type: BusinessType; name: string; goal: Goal };
  automationsEnabled: boolean;
  automations: Record<AutomationId, boolean>;
  site: Site;
  leads: Lead[];
};

const KEY = "aicyclopedia-demo-v1";
const HOUR = 3600_000;
const DAY = 24 * HOUR;

export const BUSINESS_LABEL: Record<BusinessType, string> = {
  beauty: "Beauty & brows",
  home: "Home services",
  other: "Other",
};
export const GOAL_LABEL: Record<Goal, string> = {
  book: "Book more appointments",
  follow: "Follow up with leads",
  return: "Bring customers back",
};

const uid = () => Math.random().toString(36).slice(2, 10);

function siteFor(type: BusinessType, name: string): Site {
  if (type === "home")
    return {
      headline: `${name} — repairs done right, on schedule.`,
      tagline: "Local, licensed, and easy to reach. Tell us what you need and we'll get back to you.",
      services: "Repairs\nInstallations\nMaintenance visits",
    };
  if (type === "other")
    return {
      headline: `${name}`,
      tagline: "Tell us what you're looking for and we'll get back to you.",
      services: "Consultations\nAppointments\nPackages",
    };
  return {
    headline: `${name} — brows, lashes, and calm.`,
    tagline: "Thoughtful brow shaping and lash services. Send a note and we'll find you a time.",
    services: "Brow shaping\nBrow tint\nLash lift",
  };
}

function seedLeads(now: number): Lead[] {
  const mk = (
    name: string,
    email: string,
    inquiry: string,
    stage: Stage,
    ageH: number,
    extra: Partial<Lead> = {},
    events: Omit<TimelineEvent, "id">[] = [],
  ): Lead => {
    const createdAt = now - ageH * HOUR;
    return {
      id: uid(),
      name,
      email,
      inquiry,
      stage,
      createdAt,
      ownerTakeover: false,
      followUpPaused: false,
      needsAttention: false,
      ownerReply: "",
      timeline: [
        { id: uid(), at: createdAt, kind: "inquiry", text: "Inquiry received from website form", status: "info" },
        ...events.map((e) => ({ ...e, id: uid() })),
      ],
      ...extra,
    };
  };
  return [
    mk("Maya Chen", "maya@example.com", "Hi! Do you have anything open Saturday morning?", "New", 2, {}, [
      { at: now - 2 * HOUR + 60_000, kind: "ack", text: "Acknowledgment logged (simulated — not sent)", status: "simulated" },
      { at: now - 2 * HOUR + 60_000, kind: "followup", text: "Booking follow-up scheduled", status: "scheduled", dueAt: now + 22 * HOUR },
    ]),
    mk("Jordan Ellis", "jordan@example.com", "Can you work with my brow tattoo from 2019 that's faded to grey?", "New", 5, { needsAttention: true }, [
      { at: now - 5 * HOUR + 60_000, kind: "ack", text: "Acknowledgment logged (simulated — not sent)", status: "simulated" },
      { at: now - 5 * HOUR + 60_000, kind: "flag", text: "Question not covered by your answers — needs your attention", status: "info" },
    ]),
    mk("Priya Patel", "priya@example.com", "Looking to book a first appointment next week.", "Booked", 30, {}, [
      { at: now - 29 * HOUR, kind: "stage", text: "Stage changed to Booked", status: "info" },
      { at: now - 29 * HOUR, kind: "reminder", text: "Appointment reminder scheduled", status: "scheduled", dueAt: now + 1 * DAY },
    ]),
    mk("Sam Rivera", "sam@example.com", "What do you charge for a first visit?", "Contacted", 52, {}, [
      { at: now - 51 * HOUR, kind: "ack", text: "Acknowledgment logged (simulated — not sent)", status: "simulated" },
      { at: now - 27 * HOUR, kind: "followup", text: "Follow-up logged (simulated — not sent)", status: "simulated" },
    ]),
  ];
}

export function defaultState(): DemoState {
  const name = "Willow Brow Studio";
  return {
    version: 1,
    business: { type: "beauty", name, goal: "book" },
    automationsEnabled: true,
    automations: {
      "inquiry-ack": true,
      "lead-chase": true,
      "unknown-question": true,
      "booking-reminder": true,
      "review-request": true,
      "win-back": false,
    },
    site: siteFor("beauty", name),
    leads: seedLeads(Date.now()),
  };
}

// ---------- store ----------
let state: DemoState | null = null;
const listeners = new Set<() => void>();

function load(): DemoState {
  if (state) return state;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed?.version === 1) {
        state = parsed;
        return state;
      }
    }
  } catch {
    /* ignore */
  }
  state = defaultState();
  persist();
  return state;
}

function persist() {
  try {
    if (typeof window !== "undefined" && state) window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function set(next: DemoState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function update(fn: (s: DemoState) => DemoState) {
  set(fn(load()));
}

export function useDemo(): DemoState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) {
          state = null;
          l();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(l);
        window.removeEventListener("storage", onStorage);
      };
    },
    load,
    load,
  );
}

// ---------- actions ----------
export function resetDemo() {
  const cur = load();
  const fresh = defaultState();
  fresh.business = cur.business;
  fresh.site = siteFor(cur.business.type, cur.business.name);
  set(fresh);
}

export function setupBusiness(b: DemoState["business"]) {
  const fresh = defaultState();
  fresh.business = b;
  fresh.site = siteFor(b.type, b.name);
  set(fresh);
}

export function setGlobalAutomations(on: boolean) {
  update((s) => ({ ...s, automationsEnabled: on }));
}

export function setAutomation(id: AutomationId, on: boolean) {
  update((s) => ({ ...s, automations: { ...s.automations, [id]: on } }));
}

export function updateSite(site: Site) {
  update((s) => ({ ...s, site }));
}

const KNOWN: Record<BusinessType, string[]> = {
  beauty: ["book", "appointment", "open", "available", "availability", "time", "price", "cost", "charge", "brow", "lash", "tint", "shape", "hours", "saturday", "sunday", "weekend", "today", "tomorrow", "week"],
  home: ["book", "appointment", "quote", "estimate", "price", "cost", "charge", "repair", "install", "available", "availability", "hours", "today", "tomorrow", "week", "emergency"],
  other: ["book", "appointment", "price", "cost", "available", "availability", "hours", "today", "tomorrow", "week"],
};

/** True when the message asks a question our sample answers don't cover. */
export function isUnknownQuestion(text: string, type: BusinessType) {
  const t = text.toLowerCase();
  if (!t.includes("?")) return false;
  return !KNOWN[type].some((k) => t.includes(k));
}

function canAutomate(s: DemoState, lead: Lead) {
  return s.automationsEnabled && !lead.followUpPaused && !lead.ownerTakeover;
}

export function submitInquiry(input: { name: string; email: string; phone?: string; inquiry: string }): string {
  const s = load();
  const now = Date.now();
  const lead: Lead = {
    id: uid(),
    name: input.name,
    email: input.email,
    phone: input.phone || undefined,
    inquiry: input.inquiry,
    stage: "New",
    createdAt: now,
    ownerTakeover: false,
    followUpPaused: false,
    needsAttention: false,
    ownerReply: "",
    timeline: [{ id: uid(), at: now, kind: "inquiry", text: "Inquiry received from website form", status: "info" }],
  };
  const unknown = isUnknownQuestion(input.inquiry, s.business.type);
  if (!s.automationsEnabled) {
    lead.timeline.push({ id: uid(), at: now, kind: "skipped", text: "Automations are paused — no messages logged", status: "info" });
  } else {
    if (s.automations["inquiry-ack"])
      lead.timeline.push({ id: uid(), at: now, kind: "ack", text: "Acknowledgment logged (simulated — not sent)", status: "simulated" });
    if (unknown && s.automations["unknown-question"]) {
      lead.needsAttention = true;
      lead.timeline.push({ id: uid(), at: now, kind: "flag", text: "Question not covered by your answers — needs your attention. No answer was guessed.", status: "info" });
    }
    if (s.automations["lead-chase"])
      lead.timeline.push({ id: uid(), at: now, kind: "followup", text: "Booking follow-up scheduled", status: "scheduled", dueAt: now + DAY });
  }
  set({ ...s, leads: [lead, ...s.leads] });
  return lead.id;
}

function patchLead(id: string, fn: (l: Lead, s: DemoState) => Lead) {
  update((s) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? fn(l, s) : l)) }));
}

function cancelScheduled(l: Lead, kinds: EventKind[], reason: string): TimelineEvent[] {
  let changed = false;
  const tl = l.timeline.map((e) => {
    if (e.status === "scheduled" && kinds.includes(e.kind)) {
      changed = true;
      return { ...e, status: "cancelled" as const, text: `${e.text} — cancelled (${reason})` };
    }
    return e;
  });
  return changed ? tl : l.timeline;
}

export function setStage(id: string, stage: Stage) {
  patchLead(id, (l, s) => {
    if (l.stage === stage) return l;
    const now = Date.now();
    let timeline = [...l.timeline, { id: uid(), at: now, kind: "stage" as const, text: `Stage changed to ${stage}`, status: "info" as const }];
    if (stage === "Booked" || stage === "Lost") {
      timeline = cancelScheduled({ ...l, timeline }, ["followup"], stage === "Booked" ? "lead booked" : "lead marked lost");
    }
    if (stage !== "Booked") timeline = cancelScheduled({ ...l, timeline }, ["reminder"], "no longer booked");
    if (stage === "Booked") {
      if (canAutomate(s, l) && s.automations["booking-reminder"])
        timeline.push({ id: uid(), at: now, kind: "reminder", text: "Sample appointment reminder scheduled", status: "scheduled", dueAt: now + DAY });
      else
        timeline.push({ id: uid(), at: now, kind: "skipped", text: "Reminder not scheduled — automation off or paused", status: "info" });
    }
    return { ...l, stage, timeline };
  });
}

export function setFollowUpPaused(id: string, paused: boolean) {
  patchLead(id, (l) => {
    const now = Date.now();
    let timeline = [...l.timeline];
    if (paused) timeline = cancelScheduled(l, ["followup", "reminder"], "follow-up paused");
    timeline.push({ id: uid(), at: now, kind: "paused", text: paused ? "Follow-up paused for this lead" : "Follow-up resumed for this lead", status: "info" });
    return { ...l, followUpPaused: paused, timeline };
  });
}

export function setOwnerTakeover(id: string, on: boolean) {
  patchLead(id, (l) => {
    const now = Date.now();
    let timeline = [...l.timeline];
    if (on) timeline = cancelScheduled(l, ["followup", "reminder"], "owner took over");
    timeline.push({ id: uid(), at: now, kind: "owner", text: on ? "You took over this conversation — automations stopped for this lead" : "Handed back to automations", status: "info" });
    return { ...l, ownerTakeover: on, timeline };
  });
}

export function setOwnerReply(id: string, text: string) {
  patchLead(id, (l) => ({ ...l, ownerReply: text }));
}

export function logOwnerReply(id: string) {
  patchLead(id, (l) => {
    if (!l.ownerReply.trim()) return l;
    return {
      ...l,
      needsAttention: false,
      ownerReply: "",
      stage: l.stage === "New" ? "Contacted" : l.stage,
      timeline: [
        ...l.timeline,
        { id: uid(), at: Date.now(), kind: "owner", text: `Your reply logged (simulated — not sent): "${l.ownerReply.trim()}"`, status: "simulated" },
      ],
    };
  });
}

export function relTime(ts: number) {
  const d = ts - Date.now();
  const abs = Math.abs(d);
  const fmt = (n: number, u: string) => `${n} ${u}${n === 1 ? "" : "s"}`;
  let s: string;
  if (abs < 60_000) return d >= 0 ? "in a moment" : "just now";
  if (abs < HOUR) s = fmt(Math.round(abs / 60_000), "min");
  else if (abs < DAY) s = fmt(Math.round(abs / HOUR), "hour");
  else s = fmt(Math.round(abs / DAY), "day");
  return d >= 0 ? `in ${s}` : `${s} ago`;
}
