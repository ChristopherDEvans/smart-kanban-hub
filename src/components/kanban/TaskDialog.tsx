import { useState } from "react";
import { Task, TaskStatus, TaskPriority, LABEL_OPTIONS, PRIORITY_CONFIG } from "@/types/kanban";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultStatus?: TaskStatus;
}

export function TaskDialog({ open, onOpenChange, task, defaultStatus = "todo" }: TaskDialogProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<TaskPriority>((task?.priority as TaskPriority) || "medium");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [labels, setLabels] = useState<string[]>(task?.labels || []);
  const [status, setStatus] = useState<TaskStatus>((task?.status as TaskStatus) || defaultStatus);

  const toggleLabel = (label: string) => {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description,
      priority,
      due_date: dueDate || null,
      labels,
      status,
    };

    if (isEditing) {
      updateTask.mutate({ id: task.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createTask.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  // Reset form when opening
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTitle(task?.title || "");
      setDescription(task?.description || "");
      setPriority((task?.priority as TaskPriority) || "medium");
      setDueDate(task?.due_date || "");
      setLabels(task?.labels || []);
      setStatus((task?.status as TaskStatus) || defaultStatus);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-muted border-border/50 focus-visible:ring-primary"
            autoFocus
          />

          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-muted border-border/50 focus-visible:ring-primary resize-none"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-muted border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/50">
                  {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="bg-muted border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/50">
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-muted border-border/50 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Labels</label>
            <div className="flex flex-wrap gap-1.5">
              {LABEL_OPTIONS.map((label) => (
                <Badge
                  key={label}
                  variant={labels.includes(label) ? "default" : "secondary"}
                  className={`cursor-pointer text-xs transition-colors ${
                    labels.includes(label)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  onClick={() => toggleLabel(label)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            disabled={!title.trim()}
          >
            {isEditing ? "Save Changes" : "Create Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
