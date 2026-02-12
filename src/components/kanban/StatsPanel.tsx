import { useMemo } from "react";
import { Task, TaskStatus } from "@/types/kanban";
import { useTasks } from "@/hooks/useTasks";
import { BarChart3 } from "lucide-react";

export function StatsPanel() {
  const { data: tasks = [] } = useTasks();

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, todo, pct };
  }, [tasks]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (stats.pct / 100) * circumference;

  return (
    <div className="w-[260px] shrink-0 border-l border-border/50 bg-card/50 p-5 flex flex-col gap-5 overflow-y-auto scrollbar-thin">
      {/* Team header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Selected</p>
          <h3 className="font-display font-bold text-sm text-foreground">My Board</h3>
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Donut chart */}
      <div className="flex items-center justify-center py-2">
        <div className="relative">
          <svg width="120" height="120" className="-rotate-90">
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-bold text-xl text-foreground">{stats.pct}%</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h4 className="font-display font-semibold text-sm text-foreground mb-3">Tasks</h4>
        <div className="grid grid-cols-2 gap-2.5">
          <StatBox label="TOTAL" value={stats.total} color="text-primary" />
          <StatBox label="COMPLETED" value={stats.done} color="text-status-done" />
          <StatBox label="IN PROGRESS" value={stats.inProgress} color="text-status-progress" />
          <StatBox label="TO DO" value={stats.todo} color="text-status-todo" />
        </div>
      </div>

      {/* Priority breakdown */}
      <div>
        <h4 className="font-display font-semibold text-sm text-foreground mb-3">By Priority</h4>
        <div className="space-y-2">
          {(["urgent", "high", "medium", "low"] as const).map((p) => {
            const count = tasks.filter((t) => t.priority === p).length;
            const pct = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
            const colors: Record<string, string> = {
              urgent: "bg-priority-urgent",
              high: "bg-priority-high",
              medium: "bg-priority-medium",
              low: "bg-priority-low",
            };
            return (
              <div key={p} className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground capitalize w-14">{p}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors[p]} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-muted/50 border border-border/30 p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
        {label}
      </p>
      <p className={`font-display font-bold text-lg ${color}`}>{value}</p>
    </div>
  );
}
