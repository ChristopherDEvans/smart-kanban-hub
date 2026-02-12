import { Task, PRIORITY_CONFIG, TaskPriority } from "@/types/kanban";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useDeleteTask } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const deleteTask = useDeleteTask();
  const priority = PRIORITY_CONFIG[task.priority as TaskPriority] || PRIORITY_CONFIG.medium;

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
      className={`group rounded-lg border border-border/50 bg-kanban-task p-3.5 task-card-hover cursor-pointer animate-fade-in ${
        isDragging ? "opacity-50 bg-kanban-task-drag shadow-xl" : ""
      }`}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`h-2 w-2 rounded-full ${priority.color} shrink-0`} />
            <h4 className="font-medium text-sm truncate text-foreground">{task.title}</h4>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 ml-4">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 flex-wrap ml-4">
            {task.due_date && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), "MMM d")}
              </span>
            )}
            {task.labels?.map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 bg-secondary/80 text-secondary-foreground"
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask.mutate(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
