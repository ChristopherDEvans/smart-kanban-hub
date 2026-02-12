import { useState, useMemo, useCallback } from "react";
import { Task, COLUMNS, TaskStatus } from "@/types/kanban";
import confetti from "canvas-confetti";
import { useTasks, useMoveTask } from "@/hooks/useTasks";
import { KanbanColumn } from "./KanbanColumn";
import { TaskDialog } from "./TaskDialog";
import { TaskCard } from "./TaskCard";
import { StatsPanel } from "./StatsPanel";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
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

  const handleAddTask = (status: TaskStatus = "todo") => {
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

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#2dd4bf", "#a78bfa", "#fbbf24", "#f87171", "#38bdf8"],
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

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

    const targetTasks = tasksByStatus[targetStatus].filter((t) => t.id !== taskId);
    const position = targetTasks.length;

    if (task.status !== targetStatus || task.position !== position) {
      // Fire confetti when completing a task!
      if (targetStatus === "done" && task.status !== "done") {
        fireConfetti();
      }
      moveTask.mutate({ id: taskId, status: targetStatus, position });
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {};

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left sidebar */}
      <AppSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onNewTask={() => handleAddTask("todo")} />

        {/* Board area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-x-auto p-6">
            {/* Page title */}
            <div className="mb-6">
              <h1 className="font-display font-bold text-2xl text-foreground">Tasks</h1>
            </div>

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
                <div className="flex gap-6">
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
                    <div className="opacity-90 rotate-1 scale-105">
                      <TaskCard task={activeTask} onEdit={() => {}} />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>

          {/* Right stats panel */}
          <StatsPanel />
        </div>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
