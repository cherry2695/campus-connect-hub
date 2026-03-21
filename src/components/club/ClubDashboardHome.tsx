import { useEffect, useState } from "react";
import { Calendar, Users, DollarSign, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { ClubInfo } from "@/hooks/useClubAuth";

interface Props {
  club: ClubInfo;
}

export default function ClubDashboardHome({ club }: Props) {
  const [stats, setStats] = useState({ total: 0, active: 0, registrations: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: events } = await supabase
        .from("club_events")
        .select("id, status, pricing_type, amount")
        .eq("club_id", club.id);

      if (!events) { setLoading(false); return; }

      const eventIds = events.map((e) => e.id);
      let regCount = 0;
      if (eventIds.length > 0) {
        const { count } = await supabase
          .from("club_registrations")
          .select("id", { count: "exact", head: true })
          .in("event_id", eventIds);
        regCount = count || 0;
      }

      const revenue = events.reduce((sum, e) => {
        if (e.pricing_type === "paid") return sum + (e.amount || 0);
        return sum;
      }, 0);

      setStats({
        total: events.length,
        active: events.filter((e) => e.status === "upcoming" || e.status === "ongoing").length,
        registrations: regCount,
        revenue,
      });
      setLoading(false);
    }
    load();
  }, [club.id]);

  const cards = [
    { label: "Total Events", value: stats.total, icon: Calendar, color: "text-primary" },
    { label: "Active Events", value: stats.active, icon: Activity, color: "text-green-500" },
    { label: "Total Registrations", value: stats.registrations, icon: Users, color: "text-orange-500" },
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500" },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-muted ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
