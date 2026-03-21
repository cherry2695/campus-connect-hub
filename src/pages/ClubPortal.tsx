import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useClubAuth } from "@/hooks/useClubAuth";
import ClubSidebar from "@/components/club/ClubSidebar";
import ClubDashboardHome from "@/components/club/ClubDashboardHome";
import CreateEvent from "@/components/club/CreateEvent";
import ManageEvents from "@/components/club/ManageEvents";
import PastEvents from "@/components/club/PastEvents";
import ClubAnalytics from "@/components/club/ClubAnalytics";
import { Loader2 } from "lucide-react";

export default function ClubPortal() {
  const { club, loading, isClubUser, logout } = useClubAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isClubUser) {
      navigate("/login", { replace: true });
    }
  }, [loading, isClubUser, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!club) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <ClubSidebar club={club} onLogout={handleLogout} />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <Routes>
          <Route index element={<ClubDashboardHome club={club} />} />
          <Route path="create-event" element={<CreateEvent club={club} />} />
          <Route path="manage-events" element={<ManageEvents club={club} />} />
          <Route path="past-events" element={<PastEvents club={club} />} />
          <Route path="analytics" element={<ClubAnalytics club={club} />} />
          <Route path="*" element={<Navigate to="/club-portal" replace />} />
        </Routes>
      </main>
    </div>
  );
}
