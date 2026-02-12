import { Task, Column as ColumnType, TaskStatus } from "@/types/kanban";
import { TaskCard } from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-status-todo",
  in_progress: "bg-status-progress",
  done: "bg-status-done",
};

export function KanbanColumn({ column, tasks, onAddTask, onEditTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col min-w-[300px] max-w-[340px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[column.id]}`} />
          <h3 className="font-display font-semibold text-sm text-foreground tracking-wide">
            {column.title}
          </h3>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-medium">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Cards container */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition-colors duration-200 ${
          isOver
            ? "bg-primary/5 border-2 border-dashed border-primary/30"
            : "bg-kanban-column border border-border/30"
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-24 text-muted-foreground/50 text-xs">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
