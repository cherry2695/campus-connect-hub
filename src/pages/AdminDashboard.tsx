import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Loader2, LogOut, Bell, CheckCircle2, XCircle, Clock, Calendar,
  Users, Search, Plus, Trash2, Eye, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import mlritLogo from "@/assets/mlrit-logo.png";

const ADMIN_EMAIL = "mlritclgadmin@mlrit.ac.in";

interface ClubEvent {
  id: string;
  club_id: string;
  event_name: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  event_mode: string;
  pricing_type: string;
  amount: number;
  description: string;
  banner_image_url: string;
  status: string;
  approval_status: string;
  manual_registrations: number;
  total_fund: number;
}

interface Club {
  id: string;
  club_name: string;
  email: string;
}

interface Notification {
  id: string;
  club_id: string;
  event_id: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

interface FacultyProgram {
  id: string;
  title: string;
  short_description: string;
  description: string;
  program_type: string;
  mode: string;
  start_datetime: string;
  end_datetime: string;
  venue: string;
  banner_image_url: string;
  status: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [programs, setPrograms] = useState<FacultyProgram[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterApproval, setFilterApproval] = useState("all");
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [savingProgram, setSavingProgram] = useState(false);
  const [programForm, setProgramForm] = useState({
    title: "", short_description: "", description: "", program_type: "FDP",
    mode: "offline", start_datetime: "", end_datetime: "", venue: "", status: "upcoming"
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email?.toLowerCase();
    if (email !== ADMIN_EMAIL) {
      navigate("/login", { replace: true });
      return;
    }
    setIsAdmin(true);
    setLoading(false);
    fetchAll();
  };

  const fetchAll = async () => {
    const [eventsRes, clubsRes, notifsRes, progsRes] = await Promise.all([
      supabase.from("club_events").select("*").order("created_at", { ascending: false }),
      supabase.from("clubs").select("*"),
      supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }),
      supabase.from("faculty_programs").select("*").order("start_datetime", { ascending: false }),
    ]);
    setEvents((eventsRes.data as ClubEvent[]) || []);
    setClubs((clubsRes.data as Club[]) || []);
    setNotifications((notifsRes.data as Notification[]) || []);
    setPrograms((progsRes.data as FacultyProgram[]) || []);
  };

  const getClubName = (clubId: string) => clubs.find(c => c.id === clubId)?.club_name || "Unknown Club";

  const handleApproval = async (event: ClubEvent, status: "approved" | "rejected") => {
    const { error } = await supabase.from("club_events")
      .update({ approval_status: status })
      .eq("id", event.id);

    if (error) {
      toast({ title: "Error updating status", variant: "destructive" });
      return;
    }

    await supabase.from("admin_notifications").insert({
      club_id: event.club_id,
      event_id: event.id,
      message: `Your event "${event.event_name}" has been ${status} by admin.`,
      notification_type: status,
    });

    toast({ title: `Event ${status}!` });
    setSelectedEvent(null);
    fetchAll();
  };

  const handleCreateProgram = async () => {
    if (!programForm.title || !programForm.start_datetime || !programForm.end_datetime) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setSavingProgram(true);
    const { error } = await supabase.from("faculty_programs").insert({
      title: programForm.title,
      short_description: programForm.short_description,
      description: programForm.description,
      program_type: programForm.program_type,
      mode: programForm.mode,
      start_datetime: programForm.start_datetime,
      end_datetime: programForm.end_datetime,
      venue: programForm.venue,
      status: programForm.status,
    });
    setSavingProgram(false);
    if (error) {
      toast({ title: "Error creating program", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Faculty program created!" });
      setShowCreateProgram(false);
      setProgramForm({ title: "", short_description: "", description: "", program_type: "FDP", mode: "offline", start_datetime: "", end_datetime: "", venue: "", status: "upcoming" });
      fetchAll();
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm("Delete this program?")) return;
    await supabase.from("faculty_programs").delete().eq("id", id);
    toast({ title: "Program deleted" });
    fetchAll();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter(e => {
      if (filterApproval !== "all" && e.approval_status !== filterApproval) return false;
      if (q && !e.event_name.toLowerCase().includes(q) && !getClubName(e.club_id).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [events, searchQuery, filterApproval, clubs]);

  const pendingCount = events.filter(e => e.approval_status === "pending").length;
  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={mlritLogo} alt="MLRIT" className="h-8 w-auto object-contain" />
            <span className="font-bold text-lg text-gray-900">Admin Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-gray-600">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users className="h-6 w-6 text-blue-600" />} label="Total Clubs" value={clubs.length} />
          <StatCard icon={<Calendar className="h-6 w-6 text-emerald-600" />} label="Total Events" value={events.length} />
          <StatCard icon={<Clock className="h-6 w-6 text-amber-600" />} label="Pending Approvals" value={pendingCount} />
          <StatCard icon={<Bell className="h-6 w-6 text-purple-600" />} label="Notifications" value={notifications.length} />
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="events">Event Approvals {pendingCount > 0 && <Badge className="ml-2 bg-red-100 text-red-700">{pendingCount}</Badge>}</TabsTrigger>
            <TabsTrigger value="programs">Faculty Programs</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Event Approvals Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search events or clubs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-white" />
              </div>
              <Select value={filterApproval} onValueChange={setFilterApproval}>
                <SelectTrigger className="w-44 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No events found.</p></div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map(event => (
                  <Card key={event.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-4 flex-1">
                        {event.banner_image_url && (
                          <img src={event.banner_image_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.event_name}</h3>
                          <p className="text-sm text-gray-500">{getClubName(event.club_id)} • {format(new Date(event.start_datetime), "MMM dd, yyyy")}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge className={event.approval_status === "approved" ? "bg-green-100 text-green-700" : event.approval_status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                              {event.approval_status}
                            </Badge>
                            <Badge variant="outline">{event.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)}>
                          <Eye className="h-4 w-4 mr-1" /> Review
                        </Button>
                        {event.approval_status === "pending" && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproval(event, "approved")}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleApproval(event, "rejected")}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Faculty Programs Tab */}
          <TabsContent value="programs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Faculty Programs</h2>
              <Button onClick={() => setShowCreateProgram(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-1" /> Create Program
              </Button>
            </div>

            {programs.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><p>No programs yet.</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map(p => (
                  <Card key={p.id} className="bg-white border-gray-200">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{p.title}</h3>
                        <Button size="sm" variant="ghost" className="text-red-500 shrink-0" onClick={() => handleDeleteProgram(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">{format(new Date(p.start_datetime), "MMM dd, yyyy")} • {p.program_type}</p>
                      <Badge className={p.status === "upcoming" ? "bg-blue-100 text-blue-700" : p.status === "ongoing" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}>
                        {p.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><Bell className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No notifications yet.</p></div>
            ) : (
              notifications.map(n => (
                <Card key={n.id} className={`bg-white border-gray-200 ${!n.is_read ? "border-l-4 border-l-blue-500" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-900">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{getClubName(n.club_id)} • {format(new Date(n.created_at), "MMM dd, yyyy HH:mm")}</p>
                      </div>
                      <Badge className={n.notification_type === "approved" ? "bg-green-100 text-green-700" : n.notification_type === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                        {n.notification_type.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Event Review Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Review</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.banner_image_url && (
                <img src={selectedEvent.banner_image_url} alt="" className="w-full aspect-[4/5] object-cover rounded-lg" />
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedEvent.event_name}</h3>
                <p className="text-sm text-gray-500">{getClubName(selectedEvent.club_id)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Date:</span><br />{format(new Date(selectedEvent.start_datetime), "MMM dd, yyyy")}</div>
                <div><span className="text-gray-500">Type:</span><br />{selectedEvent.event_type}</div>
                <div><span className="text-gray-500">Mode:</span><br />{selectedEvent.event_mode}</div>
                <div><span className="text-gray-500">Pricing:</span><br />{selectedEvent.pricing_type === "paid" ? `₹${selectedEvent.amount}` : "Free"}</div>
                <div><span className="text-gray-500">Registrations:</span><br />{selectedEvent.manual_registrations}</div>
                <div><span className="text-gray-500">Total Fund:</span><br />₹{selectedEvent.total_fund.toLocaleString()}</div>
              </div>
              {selectedEvent.description && <p className="text-sm text-gray-600">{selectedEvent.description}</p>}
              <div className="flex gap-2">
                <Badge className={selectedEvent.approval_status === "approved" ? "bg-green-100 text-green-700" : selectedEvent.approval_status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                  {selectedEvent.approval_status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedEvent?.approval_status === "pending" && (
              <>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproval(selectedEvent!, "approved")}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => handleApproval(selectedEvent!, "rejected")}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Faculty Program Modal */}
      <Dialog open={showCreateProgram} onOpenChange={setShowCreateProgram}>
        <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Faculty Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={programForm.title} onChange={e => setProgramForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Short Description</Label>
              <Input value={programForm.short_description} onChange={e => setProgramForm(p => ({ ...p, short_description: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={programForm.description} onChange={e => setProgramForm(p => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Program Type</Label>
                <Select value={programForm.program_type} onValueChange={v => setProgramForm(p => ({ ...p, program_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FDP">FDP</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Startup Program">Startup Program</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Mode</Label>
                <Select value={programForm.mode} onValueChange={v => setProgramForm(p => ({ ...p, mode: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start Date *</Label>
                <Input type="datetime-local" value={programForm.start_datetime} onChange={e => setProgramForm(p => ({ ...p, start_datetime: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>End Date *</Label>
                <Input type="datetime-local" value={programForm.end_datetime} onChange={e => setProgramForm(p => ({ ...p, end_datetime: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Venue</Label>
              <Input value={programForm.venue} onChange={e => setProgramForm(p => ({ ...p, venue: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={programForm.status} onValueChange={v => setProgramForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateProgram(false)}>Cancel</Button>
            <Button onClick={handleCreateProgram} disabled={savingProgram} className="bg-blue-600 hover:bg-blue-700 text-white">
              {savingProgram ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500 mt-8">
        © 2026 MLRIT Campus Connect — Admin Portal
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-5 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gray-100">{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
