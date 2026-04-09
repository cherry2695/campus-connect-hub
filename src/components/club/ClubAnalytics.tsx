import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Users, DollarSign, AlertCircle, Calendar, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ClubInfo } from "@/hooks/useClubAuth";

interface Props {
  club: ClubInfo;
}

interface EventAnalytics {
  id: string;
  event_name: string;
  pricing_type: string;
  amount: number;
  manual_registrations: number;
  total_fund: number;
  registrations: number;
  revenue: number;
  refunds: number;
  netRevenue: number;
  performance: string;
  status: string;
}

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ClubAnalytics({ club }: Props) {
  const [analytics, setAnalytics] = useState<EventAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: events } = await supabase
        .from("club_events")
        .select("id, event_name, pricing_type, amount, manual_registrations, total_fund, status")
        .eq("club_id", club.id);

      if (!events || events.length === 0) { setLoading(false); return; }

      const results: EventAnalytics[] = [];

      for (const event of events) {
        const { count } = await supabase
          .from("club_registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", event.id);

        const regs = Math.max(count || 0, event.manual_registrations || 0);
        const computedRevenue = event.pricing_type === "paid" ? regs * (event.amount || 0) : 0;
        const revenue = Math.max(computedRevenue, event.total_fund || 0);
        const refunds = Math.floor(revenue * 0.02);
        const netRevenue = revenue - refunds;

        let performance = "Needs Improvement";
        if (regs > 100) performance = "Grand Success";
        else if (regs >= 50) performance = "Average";

        results.push({
          id: event.id,
          event_name: event.event_name,
          pricing_type: event.pricing_type,
          amount: event.amount,
          manual_registrations: event.manual_registrations || 0,
          total_fund: event.total_fund || 0,
          registrations: regs,
          revenue,
          refunds,
          netRevenue,
          performance,
          status: event.status,
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
  const grandSuccessCount = analytics.filter(a => a.performance === "Grand Success").length;

  const chartData = analytics.map((a) => ({
    name: a.event_name.length > 12 ? a.event_name.slice(0, 12) + "…" : a.event_name,
    registrations: a.registrations,
    revenue: a.revenue / 1000,
  }));

  const pieData = [
    { name: "Grand Success", value: analytics.filter(a => a.performance === "Grand Success").length },
    { name: "Average", value: analytics.filter(a => a.performance === "Average").length },
    { name: "Needs Improvement", value: analytics.filter(a => a.performance === "Needs Improvement").length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <Badge variant="outline" className="text-sm">{analytics.length} Events</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard icon={<Calendar className="h-7 w-7 text-primary" />} label="Total Events" value={String(analytics.length)} />
        <SummaryCard icon={<Users className="h-7 w-7 text-orange-500" />} label="Total Registrations" value={totalRegs.toLocaleString()} />
        <SummaryCard icon={<DollarSign className="h-7 w-7 text-emerald-500" />} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
        <SummaryCard icon={<AlertCircle className="h-7 w-7 text-amber-500" />} label="Refunds" value={`₹${totalRefunds.toLocaleString()}`} />
        <SummaryCard icon={<TrendingUp className="h-7 w-7 text-green-500" />} label="Net Revenue" value={`₹${totalNet.toLocaleString()}`} />
      </div>

      {/* Charts Row */}
      {analytics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Registrations & Revenue by Event</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: number, name: string) => name === "revenue" ? [`₹${(val * 1000).toLocaleString()}`, "Revenue"] : [val, "Registrations"]} />
                    <Bar yAxisId="left" dataKey="registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Event Performance</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "#10b981" : i === 1 ? "#f59e0b" : "#ef4444"} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Summary List */}
      {analytics.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Event Summary</h2>
          {analytics.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${a.performance === "Grand Success" ? "bg-green-100" : a.performance === "Average" ? "bg-yellow-100" : "bg-red-100"}`}>
                    <Trophy className={`h-5 w-5 ${a.performance === "Grand Success" ? "text-green-600" : a.performance === "Average" ? "text-yellow-600" : "text-red-600"}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{a.event_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {a.registrations} registrations • ₹{a.revenue.toLocaleString()} revenue • ₹{a.refunds.toLocaleString()} refunds
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
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

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
