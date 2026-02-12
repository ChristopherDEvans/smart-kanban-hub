import { Task, PRIORITY_CONFIG, TaskPriority } from "@/types/kanban";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Paperclip, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDeleteTask } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const LABEL_COLORS: Record<string, string> = {
  Bug: "bg-destructive/15 text-destructive",
  Feature: "bg-primary/15 text-primary",
  Design: "bg-accent/15 text-accent",
  Backend: "bg-priority-high/15 text-priority-high",
  Frontend: "bg-status-todo/15 text-status-todo",
  Documentation: "bg-priority-medium/15 text-priority-medium",
  Testing: "bg-status-done/15 text-status-done",
  DevOps: "bg-priority-urgent/15 text-priority-urgent",
};

// Simulate a progress value from priority
function getProgress(task: Task): number {
  const map: Record<string, number> = { low: 30, medium: 50, high: 75, urgent: 90 };
  return map[task.priority] || 50;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const deleteTask = useDeleteTask();
  const priority = PRIORITY_CONFIG[task.priority as TaskPriority] || PRIORITY_CONFIG.medium;
  const progress = getProgress(task);
  const firstLabel = task.labels?.[0];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border border-border/40 bg-card p-4 task-card-hover cursor-pointer animate-fade-in ${
        isDragging ? "opacity-50 shadow-2xl scale-105" : ""
      }`}
      onClick={() => onEdit(task)}
      {...attributes}
      {...listeners}
    >
      {/* Label badge + menu */}
      <div className="flex items-center justify-between mb-2.5">
        {firstLabel ? (
          <Badge
            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md border-0 ${
              LABEL_COLORS[firstLabel] || "bg-primary/15 text-primary"
            }`}
          >
            {firstLabel}
          </Badge>
        ) : (
          <Badge className="text-[11px] font-medium px-2.5 py-0.5 rounded-md border-0 bg-primary/15 text-primary">
            {task.title.split(" ")[0]}
          </Badge>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask.mutate(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-0.5 rounded"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Title */}
      <h4 className="font-display font-semibold text-sm text-foreground mb-1 truncate">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${priority.color} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[11px] text-muted-foreground font-medium">{progress}%</span>
      </div>

      {/* Footer: avatars + meta */}
      <div className="flex items-center justify-between">
        {/* Fake avatar stack */}
        <div className="flex -space-x-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-6 w-6 rounded-full border-2 border-card bg-secondary flex items-center justify-center"
            >
              <span className="text-[9px] text-secondary-foreground font-medium">
                {String.fromCharCode(65 + i)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1 text-[11px]">
            <Paperclip className="h-3 w-3" />
            {task.labels?.length || 0}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <MessageCircle className="h-3 w-3" />
            {Math.floor(Math.random() * 5) + 1}
          </span>
        </div>
      </div>
    </div>
  );
}
