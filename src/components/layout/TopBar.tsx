import { Search, Bell, CalendarDays } from "lucide-react";

interface TopBarProps {
  onNewTask: () => void;
}

export function TopBar({ onNewTask }: TopBarProps) {
  return (
    <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      {/* Left: search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tasks..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
        />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        <button className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <button className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <CalendarDays className="h-4 w-4" />
        </button>

        <button
          onClick={onNewTask}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors glow-primary"
        >
          Create Task
        </button>

        {/* User avatar */}
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center ml-1">
          <span className="text-xs font-medium text-secondary-foreground">U</span>
        </div>
      </div>
    </header>
  );
}
