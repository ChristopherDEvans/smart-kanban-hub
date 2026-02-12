import { useState, useMemo } from "react";
import { Task, COLUMNS, TaskStatus } from "@/types/kanban";
import { useTasks, useMoveTask } from "@/hooks/useTasks";
import { KanbanColumn } from "./KanbanColumn";
import { TaskDialog } from "./TaskDialog";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import { LayoutDashboard, Plus } from "lucide-react";

export function KanbanBoard() {
  const { data: tasks = [], isLoading } = useTasks();
  const moveTask = useMoveTask();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => {
      const status = t.status as TaskStatus;
      if (grouped[status]) grouped[status].push(t);
    });
    return grouped;
  }, [tasks]);

  const handleAddTask = (status: TaskStatus) => {
    setEditingTask(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    let targetStatus: TaskStatus;
    if (["todo", "in_progress", "done"].includes(overId)) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;
      targetStatus = overTask.status as TaskStatus;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Calculate new position
    const targetTasks = tasksByStatus[targetStatus].filter((t) => t.id !== taskId);
    const position = targetTasks.length;

    if (task.status !== targetStatus || task.position !== position) {
      moveTask.mutate({ id: taskId, status: targetStatus, position });
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // handled in dragEnd
  };

  const totalTasks = tasks.length;
  const doneTasks = tasksByStatus.done.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground tracking-tight">
                FlowBoard
              </h1>
              <p className="text-xs text-muted-foreground">
                {totalTasks > 0
                  ? `${doneTasks}/${totalTasks} completed`
                  : "Your tasks, organized"}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAddTask("todo")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors glow-primary"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-x-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Loading...
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-5 max-w-7xl mx-auto justify-center">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByStatus[column.id]}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="opacity-90 rotate-2 scale-105">
                  <TaskCard task={activeTask} onEdit={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
