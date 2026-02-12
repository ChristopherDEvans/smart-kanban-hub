import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Clock,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Board", active: true },
  { icon: Users, label: "Team", active: false },
  { icon: MessageSquare, label: "Messages", active: false },
  { icon: Clock, label: "Activity", active: false },
  { icon: FileText, label: "Files", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export function AppSidebar() {
  return (
    <div className="w-16 shrink-0 bg-card/80 border-r border-border/50 flex flex-col items-center py-5 gap-1">
      {/* Logo */}
      <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center mb-6 glow-primary">
        <LayoutDashboard className="h-5 w-5 text-primary" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
              item.active
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title={item.label}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {/* Tooltip */}
            <span className="absolute left-14 px-2 py-1 rounded-md bg-popover text-popover-foreground text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg border border-border/50 z-50">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <button
        className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Log out"
      >
        <LogOut className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
