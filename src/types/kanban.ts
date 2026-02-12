import { Tables } from "@/integrations/supabase/types";

export type Task = Tables<"tasks">;

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Column {
  id: TaskStatus;
  title: string;
  icon: string;
}

export const COLUMNS: Column[] = [
  { id: "todo", title: "To Do", icon: "📋" },
  { id: "in_progress", title: "In Progress", icon: "⚡" },
  { id: "done", title: "Done", icon: "✅" },
];

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-priority-low" },
  medium: { label: "Medium", color: "bg-priority-medium" },
  high: { label: "High", color: "bg-priority-high" },
  urgent: { label: "Urgent", color: "bg-priority-urgent" },
};

export const LABEL_OPTIONS = [
  "Bug", "Feature", "Design", "Backend", "Frontend", "Documentation", "Testing", "DevOps"
];
