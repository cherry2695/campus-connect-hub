import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp, Users, DollarSign, AlertCircle, Calendar, Trophy, Target, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface Props { club: ClubInfo; }

interface EventData {
  id: string;
  event_name: string;
  pricing_type: string;
  amount: number;
  manual_registrations: number;
  total_fund: number;
  status: string;
  start_datetime: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

export default function ClubAnalytics({ club }: Props) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const logo = CLUB_LOGOS[club.email];

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("club_events")
        .select("id, event_name, pricing_type, amount, manual_registrations, total_fund, status, start_datetime")
        .eq("club_id", club.id)
        .order("start_datetime", { ascending: true });
      setEvents(data || []);
      setLoading(false);
    }
    load();
  }, [club.id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  const completed = events.filter(e => e.status === "completed");
  const totalRegs = completed.reduce((s, e) => s + (e.manual_registrations || 0), 0);
  const totalRevenue = completed.reduce((s, e) => s + (e.total_fund || 0), 0);
  const paidEvents = completed.filter(e => e.pricing_type === "paid");
  const freeEvents = completed.filter(e => e.pricing_type === "free");
  const grandSuccess = completed.filter(e => (e.manual_registrations || 0) > 100).length;
  const avgRegs = completed.length ? Math.round(totalRegs / completed.length) : 0;
  const bestEvent = completed.reduce((best, e) => (!best || (e.manual_registrations || 0) > (best.manual_registrations || 0)) ? e : best, null as EventData | null);

  const barData = completed.map(e => ({
    name: e.event_name.length > 10 ? e.event_name.slice(0, 10) + "…" : e.event_name,
    registrations: e.manual_registrations || 0,
    revenue: (e.total_fund || 0) / 1000,
  }));

  const piePerf = [
    { name: "Grand Success", value: completed.filter(e => (e.manual_registrations || 0) > 100).length },
    { name: "Average", value: completed.filter(e => { const r = e.manual_registrations || 0; return r >= 50 && r <= 100; }).length },
    { name: "Needs Improvement", value: completed.filter(e => (e.manual_registrations || 0) < 50).length },
  ].filter(d => d.value > 0);

  const piePricing = [
    { name: "Paid Events", value: paidEvents.length },
    { name: "Free Events", value: freeEvents.length },
  ].filter(d => d.value > 0);

  const trendData = completed.map(e => ({
    name: e.event_name.length > 8 ? e.event_name.slice(0, 8) + "…" : e.event_name,
    registrations: e.manual_registrations || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {logo && <img src={logo} alt={club.club_name} className="h-12 w-12 rounded-xl object-contain bg-muted p-1" loading="lazy" />}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">{club.club_name} Performance Overview</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">{events.length} Total Events</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <SummaryCard icon={<Calendar className="h-5 w-5 text-primary" />} label="Total" value={String(events.length)} />
        <SummaryCard icon={<Target className="h-5 w-5 text-blue-500" />} label="Completed" value={String(completed.length)} />
        <SummaryCard icon={<Users className="h-5 w-5 text-orange-500" />} label="Registrations" value={totalRegs.toLocaleString()} />
        <SummaryCard icon={<DollarSign className="h-5 w-5 text-emerald-500" />} label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
        <SummaryCard icon={<Trophy className="h-5 w-5 text-amber-500" />} label="Grand Success" value={String(grandSuccess)} />
        <SummaryCard icon={<TrendingUp className="h-5 w-5 text-green-500" />} label="Avg/Event" value={String(avgRegs)} />
        <SummaryCard icon={<Award className="h-5 w-5 text-purple-500" />} label="Paid" value={String(paidEvents.length)} />
        <SummaryCard icon={<AlertCircle className="h-5 w-5 text-cyan-500" />} label="Free" value={String(freeEvents.length)} />
      </div>

      {/* Best Event Highlight */}
      {bestEvent && (
        <Card className="bg-gradient-to-r from-primary/5 to-emerald-500/5 border-primary/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100">
              <Trophy className="h-7 w-7 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">🏆 Best Performing Event</p>
              <p className="text-lg font-bold text-foreground">{bestEvent.event_name}</p>
              <p className="text-sm text-muted-foreground">{(bestEvent.manual_registrations || 0).toLocaleString()} registrations • ₹{(bestEvent.total_fund || 0).toLocaleString()} revenue</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {completed.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Registrations & Revenue by Event</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: number, name: string) => name === "revenue" ? [`₹${(val * 1000).toLocaleString()}`, "Revenue"] : [val, "Registrations"]} />
                      <Bar yAxisId="left" dataKey="registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Pie */}
            <Card>
              <CardHeader><CardTitle className="text-base">Event Performance</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={piePerf} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                        {piePerf.map((_, i) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Line */}
            <Card>
              <CardHeader><CardTitle className="text-base">Registration Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <defs>
                        <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="registrations" stroke="hsl(var(--primary))" fill="url(#regGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Pie */}
            <Card>
              <CardHeader><CardTitle className="text-base">Paid vs Free Events</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={piePricing} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={75} label>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Event Summary List */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Event Summary</h2>
          {completed.map((e) => {
            const regs = e.manual_registrations || 0;
            const rev = e.total_fund || 0;
            const perf = regs > 100 ? "Grand Success" : regs >= 50 ? "Average" : "Needs Improvement";
            return (
              <Card key={e.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${perf === "Grand Success" ? "bg-green-100" : perf === "Average" ? "bg-yellow-100" : "bg-red-100"}`}>
                      <Trophy className={`h-5 w-5 ${perf === "Grand Success" ? "text-green-600" : perf === "Average" ? "text-yellow-600" : "text-red-600"}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{e.event_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {regs.toLocaleString()} registrations • ₹{rev.toLocaleString()} revenue
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    perf === "Grand Success" ? "bg-green-100 text-green-700" :
                    perf === "Average" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{perf}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {events.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No events to analyze yet.</p>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
        {icon}
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
