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

export function KanbanColumn({ column, tasks, onAddTask, onEditTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col flex-1 min-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-sm text-foreground tracking-wide">
          {column.title}
        </h3>
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
        className={`flex-1 space-y-3 min-h-[200px] rounded-xl p-1 transition-colors duration-200 ${
          isOver ? "bg-primary/5 ring-2 ring-dashed ring-primary/20" : ""
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-32 rounded-xl border border-dashed border-border/30 text-muted-foreground/40 text-xs">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
