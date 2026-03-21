import { LayoutDashboard, PlusCircle, Settings, History, BarChart3, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { ClubInfo } from "@/hooks/useClubAuth";

interface ClubSidebarProps {
  club: ClubInfo;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/club-portal" },
  { label: "Create Event", icon: PlusCircle, path: "/club-portal/create-event" },
  { label: "Manage Events", icon: Settings, path: "/club-portal/manage-events" },
  { label: "Past Events", icon: History, path: "/club-portal/past-events" },
  { label: "Analytics", icon: BarChart3, path: "/club-portal/analytics" },
];

export default function ClubSidebar({ club, onLogout }: ClubSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-foreground truncate">{club.club_name}</h2>
        <p className="text-xs text-muted-foreground truncate">{club.email}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
