import type { Priority, TaskStatus } from "../types";

// ---------- Columns (statuses) ----------

// The order of columns on the board, left to right
export const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

// Small coloured dot next to each column title
export const statusDotColors: Record<TaskStatus, string> = {
  TODO: "bg-slate-400",
  IN_PROGRESS: "bg-sky-400",
  IN_REVIEW: "bg-amber-400",
  DONE: "bg-emerald-400",
};

// ---------- Priorities ----------

export const PRIORITY_ORDER: Priority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

export const priorityLabels: Record<Priority, string> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const priorityStyles: Record<Priority, string> = {
  URGENT: "bg-red-500/15 text-red-300",
  HIGH: "bg-orange-500/15 text-orange-300",
  MEDIUM: "bg-yellow-500/15 text-yellow-300",
  LOW: "bg-emerald-500/15 text-emerald-300",
};

// ---------- Due dates ----------

// "2026-12-01T00:00:00.000Z" → "Dec 1"
export function formatDueDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC", // due dates are saved as plain dates, so don't shift them
  });
}

// Today as "YYYY-MM-DD" in the user's own time zone
function todayString() {
  return new Date().toLocaleDateString("en-CA"); // en-CA gives YYYY-MM-DD
}

export type DueState = "overdue" | "today" | "upcoming";

// Is the task late, due today, or later? (Finished tasks are never late.)
export function getDueState(dueDate: string, status: TaskStatus): DueState {
  if (status === "DONE") return "upcoming";

  const due = dueDate.slice(0, 10); // "2026-12-01"
  const today = todayString();

  if (due < today) return "overdue";
  if (due === today) return "today";
  return "upcoming";
}

export const dueStateStyles: Record<DueState, string> = {
  overdue: "text-red-400",
  today: "text-amber-300",
  upcoming: "text-slate-400",
};