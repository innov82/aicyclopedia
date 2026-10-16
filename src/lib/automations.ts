import type { AutomationId, Goal } from "./demo-store";

export type AutomationInfo = {
  id: AutomationId;
  goal: Goal;
  title: string;
  trigger: string;
  action: string;
  handoff: string;
};

export const AUTOMATIONS: AutomationInfo[] = [
  {
    id: "inquiry-ack",
    goal: "follow",
    title: "Say thanks right away",
    trigger: "Someone sends an inquiry from your website.",
    action: "A short, friendly acknowledgment is prepared so they know you got it.",
    handoff: "It never answers their question for you — that stays with you.",
  },
  {
    id: "lead-chase",
    goal: "follow",
    title: "Nudge quiet leads",
    trigger: "A new lead hasn't booked after a day.",
    action: "One gentle follow-up asking if they'd like to pick a time.",
    handoff: "Stops automatically once they book, you take over, or you pause it.",
  },
  {
    id: "unknown-question",
    goal: "follow",
    title: "Flag questions only you can answer",
    trigger: "An inquiry asks something your saved answers don't cover.",
    action: "The lead is moved to “Needs your attention” with a space for your reply.",
    handoff: "No answer is ever guessed. You write it.",
  },
  {
    id: "booking-reminder",
    goal: "book",
    title: "Remind before appointments",
    trigger: "A lead is marked Booked.",
    action: "A reminder is scheduled for the day before their visit.",
    handoff: "Cancelled automatically if the booking changes.",
  },
  {
    id: "review-request",
    goal: "return",
    title: "Ask for a review",
    trigger: "An appointment is completed.",
    action: "A thank-you note with a link to leave a review.",
    handoff: "Unhappy replies come straight to you, not to a review site.",
  },
  {
    id: "win-back",
    goal: "return",
    title: "Invite regulars back",
    trigger: "A past customer hasn't visited in eight weeks.",
    action: "A short note inviting them to rebook.",
    handoff: "Any reply lands in your leads list for you to handle.",
  },
];
