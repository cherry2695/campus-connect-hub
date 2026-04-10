import { useEffect, useState } from "react";
import { Calendar, Users, DollarSign, Activity, Trophy, TrendingUp, Instagram, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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

interface EventRow {
  id: string;
  event_name: string;
  status: string;
  pricing_type: string;
  amount: number;
  manual_registrations: number;
  total_fund: number;
  banner_image_url: string | null;
  instagram_link: string | null;
  start_datetime: string;
}

interface Props { club: ClubInfo; }

export default function ClubDashboardHome({ club }: Props) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("club_events")
        .select("id, event_name, status, pricing_type, amount, manual_registrations, total_fund, banner_image_url, instagram_link, start_datetime")
        .eq("club_id", club.id)
        .order("start_datetime", { ascending: false });
      setEvents(data || []);
      setLoading(false);
    }
    load();
  }, [club.id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  const totalRegs = events.reduce((s, e) => s + (e.manual_registrations || 0), 0);
  const totalRevenue = events.reduce((s, e) => s + (e.total_fund || 0), 0);
  const activeCount = events.filter(e => e.status === "upcoming" || e.status === "ongoing").length;
  const completedEvents = events.filter(e => e.status === "completed");
  const grandSuccessCount = completedEvents.filter(e => (e.manual_registrations || 0) > 100).length;
  const logo = CLUB_LOGOS[club.email];

  const statCards = [
    { label: "Total Events", value: events.length, icon: Calendar, color: "text-primary" },
    { label: "Active Events", value: activeCount, icon: Activity, color: "text-green-500" },
    { label: "Total Registrations", value: totalRegs.toLocaleString(), icon: Users, color: "text-orange-500" },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500" },
    { label: "Grand Success", value: grandSuccessCount, icon: Trophy, color: "text-amber-500" },
    { label: "Avg per Event", value: events.length ? Math.round(totalRegs / events.length) : 0, icon: TrendingUp, color: "text-violet-500" },
  ];

  const recentEvents = events.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header with logo */}
      <div className="flex items-center gap-5">
        {logo && (
          <img src={logo} alt={club.club_name} className="h-16 w-16 rounded-xl object-contain bg-muted p-1" loading="lazy" width={64} height={64} />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{club.club_name} Dashboard</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-muted-foreground">{club.email}</p>
            {club.instagram_url && (
              <a href={club.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 transition-colors">
                <Instagram className="h-3.5 w-3.5" /> Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((c) => (
          <Card key={c.label} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className={`p-2.5 rounded-xl bg-muted ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-xl font-bold text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Event Gallery */}
      {recentEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Events</h2>
            <button onClick={() => navigate("/club-portal/analytics")} className="text-sm text-primary hover:underline">View Analytics →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentEvents.map((ev) => {
              const regs = ev.manual_registrations || 0;
              const perf = regs > 100 ? "Grand Success" : regs >= 50 ? "Average" : "Needs Improvement";
              return (
                <Card key={ev.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/event/${ev.id}`)}>
                  {ev.banner_image_url && (
                    <div className="aspect-[4/5] overflow-hidden bg-muted">
                      <img src={ev.banner_image_url} alt={ev.event_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground text-sm truncate">{ev.event_name}</h3>
                      <Badge variant={ev.status === "completed" ? "secondary" : "default"} className="text-[10px] shrink-0">
                        {ev.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{regs.toLocaleString()} registrations</span>
                      {ev.pricing_type === "paid" && <span>₹{ev.amount}</span>}
                    </div>
                    {ev.status === "completed" && (
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        perf === "Grand Success" ? "bg-green-100 text-green-700" :
                        perf === "Average" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>{perf}</span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No events yet. Create your first event to get started!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
