import { LayoutDashboard, PlusCircle, Settings, History, BarChart3, LogOut, Bell, Instagram } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { ClubInfo } from "@/hooks/useClubAuth";

import cieLogo from "@/assets/clubs/cie-logo.png";
import codeLogo from "@/assets/clubs/code-logo.png";
import cameLogo from "@/assets/clubs/came-logo.png";
import apexLogo from "@/assets/clubs/apex-logo.png";

const CLUB_LOGOS: Record<string, string> = {
  "cie@mlrit.ac.in": cieLogo,
  "codeclub@mlrit.ac.in": codeLogo,
  "cameclub@mlrit.ac.in": cameLogo,
  "apex@mlrit.ac.in": apexLogo,
};

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
  { label: "Notifications", icon: Bell, path: "/club-portal/notifications" },
];

export default function ClubSidebar({ club, onLogout }: ClubSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const logo = CLUB_LOGOS[club.email];

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-5 border-b border-border space-y-4">
        <div className="flex items-center gap-3">
          {logo && (
            <img src={logo} alt={club.club_name} className="h-10 w-10 rounded-lg object-contain bg-muted p-0.5" loading="lazy" />
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground truncate">{club.club_name}</h2>
            <p className="text-[10px] text-muted-foreground truncate">{club.email}</p>
          </div>
        </div>

        {club.instagram_url && (
          <a href={club.instagram_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-pink-600 hover:bg-pink-50 transition-colors border border-pink-200">
            <Instagram className="h-3.5 w-3.5" /> Follow on Instagram
          </a>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border border-border"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
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
    </aside>
  );
}
