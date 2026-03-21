import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, DollarSign, AlertCircle } from "lucide-react";
import type { ClubInfo } from "@/hooks/useClubAuth";

interface Props {
  club: ClubInfo;
}

interface EventAnalytics {
  id: string;
  event_name: string;
  pricing_type: string;
  amount: number;
  registrations: number;
  revenue: number;
  refunds: number;
  netRevenue: number;
  performance: string;
}

export default function ClubAnalytics({ club }: Props) {
  const [analytics, setAnalytics] = useState<EventAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: events } = await supabase
        .from("club_events")
        .select("id, event_name, pricing_type, amount")
        .eq("club_id", club.id);

      if (!events || events.length === 0) { setLoading(false); return; }

      const results: EventAnalytics[] = [];

      for (const event of events) {
        const { count } = await supabase
          .from("club_registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", event.id);

        const regs = count || 0;
        const revenue = event.pricing_type === "paid" ? regs * (event.amount || 0) : 0;
        const refunds = Math.floor(revenue * 0.02); // mock 2% refund
        const netRevenue = revenue - refunds;

        let performance = "Needs Improvement";
        if (regs > 100) performance = "Grand Success";
        else if (regs >= 50) performance = "Average";

        results.push({
          id: event.id,
          event_name: event.event_name,
          pricing_type: event.pricing_type,
          amount: event.amount,
          registrations: regs,
          revenue,
          refunds,
          netRevenue,
          performance,
        });
      }

      setAnalytics(results);
      setLoading(false);
    }
    load();
  }, [club.id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  const totalRegs = analytics.reduce((s, a) => s + a.registrations, 0);
  const totalRevenue = analytics.reduce((s, a) => s + a.revenue, 0);
  const totalRefunds = analytics.reduce((s, a) => s + a.refunds, 0);
  const totalNet = analytics.reduce((s, a) => s + a.netRevenue, 0);

  const chartData = analytics.map((a) => ({ name: a.event_name.length > 15 ? a.event_name.slice(0, 15) + "…" : a.event_name, registrations: a.registrations, revenue: a.revenue }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Registrations</p>
              <p className="text-xl font-bold">{totalRegs}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Refunds</p>
              <p className="text-xl font-bold">₹{totalRefunds.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Net Revenue</p>
              <p className="text-xl font-bold">₹{totalNet.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Registrations by Event</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {analytics.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Event Summary</h2>
          {analytics.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-foreground">{a.event_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {a.registrations} registrations • ₹{a.revenue.toLocaleString()} revenue • ₹{a.refunds.toLocaleString()} refunds
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  a.performance === "Grand Success" ? "bg-green-100 text-green-700" :
                  a.performance === "Average" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {a.performance}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analytics.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No events to analyze yet.</p>
      )}
    </div>
  );
}
