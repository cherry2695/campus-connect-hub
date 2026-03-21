import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Pencil, Trash2, Eye, X, Upload } from "lucide-react";
import { format } from "date-fns";
import type { ClubInfo } from "@/hooks/useClubAuth";

interface Props {
  club: ClubInfo;
}

interface ClubEvent {
  id: string;
  event_name: string;
  short_name: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  event_mode: string;
  pricing_type: string;
  amount: number;
  venue: string;
  venue_details: string;
  description: string;
  keywords: string;
  banner_image_url: string;
  website_url: string;
  status: string;
  instagram_link: string;
}

export default function ManageEvents({ club }: Props) {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("club_events")
      .select("*")
      .eq("club_id", club.id)
      .in("status", ["upcoming", "ongoing"])
      .order("start_datetime", { ascending: false });
    setEvents((data as ClubEvent[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [club.id]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const { error } = await supabase.from("club_events").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Event deleted" }); fetchEvents(); }
  };

  const handleSave = async () => {
    if (!editingEvent) return;
    setSaving(true);

    let banner_image_url = editingEvent.banner_image_url;
    if (bannerFile) {
      const ext = bannerFile.name.split(".").pop();
      const path = `${club.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("event-banners").upload(path, bannerFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("event-banners").getPublicUrl(path);
        banner_image_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("club_events").update({
      event_name: editingEvent.event_name,
      short_name: editingEvent.short_name,
      start_datetime: editingEvent.start_datetime,
      end_datetime: editingEvent.end_datetime,
      event_type: editingEvent.event_type,
      event_mode: editingEvent.event_mode,
      pricing_type: editingEvent.pricing_type,
      amount: editingEvent.pricing_type === "paid" ? editingEvent.amount : 0,
      venue: editingEvent.venue,
      venue_details: editingEvent.venue_details,
      description: editingEvent.description,
      keywords: editingEvent.keywords,
      banner_image_url,
      website_url: editingEvent.website_url,
      status: editingEvent.status,
    }).eq("id", editingEvent.id);

    setSaving(false);
    setBannerFile(null);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Event updated" }); setEditingEvent(null); fetchEvents(); }
  };

  const setField = (key: string, val: string | number) =>
    setEditingEvent((p) => (p ? { ...p, [key]: val } : null));

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Manage Events</h1>

      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Edit Event</h2>
                <button onClick={() => { setEditingEvent(null); setBannerFile(null); }}><X className="h-5 w-5" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Event Name</Label>
                  <Input value={editingEvent.event_name} onChange={(e) => setField("event_name", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Short Name</Label>
                  <Input value={editingEvent.short_name} onChange={(e) => setField("short_name", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Start</Label>
                  <Input type="datetime-local" value={editingEvent.start_datetime?.slice(0, 16)} onChange={(e) => setField("start_datetime", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>End</Label>
                  <Input type="datetime-local" value={editingEvent.end_datetime?.slice(0, 16)} onChange={(e) => setField("end_datetime", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={editingEvent.event_type} onChange={(e) => setField("event_type", e.target.value)}>
                    <option value="workshop">Workshop</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="seminar">Seminar</option>
                    <option value="competition">Competition</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Mode</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={editingEvent.event_mode} onChange={(e) => setField("event_mode", e.target.value)}>
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={editingEvent.status} onChange={(e) => setField("status", e.target.value)}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Pricing</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={editingEvent.pricing_type} onChange={(e) => setField("pricing_type", e.target.value)}>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                {editingEvent.pricing_type === "paid" && (
                  <div className="space-y-1">
                    <Label>Amount (₹)</Label>
                    <Input type="number" min={0} value={editingEvent.amount} onChange={(e) => setField("amount", Number(e.target.value))} />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label>Venue</Label>
                <Input value={editingEvent.venue} onChange={(e) => setField("venue", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea value={editingEvent.description} onChange={(e) => setField("description", e.target.value)} rows={3} />
              </div>
              <div className="space-y-1">
                <Label>Banner</Label>
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-muted text-sm">
                  <Upload className="h-4 w-4" />
                  {bannerFile ? bannerFile.name : "Change banner"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No active events. Create one to get started!</p>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                {event.banner_image_url && (
                  <div className="sm:w-48 h-32 sm:h-auto bg-muted shrink-0">
                    <img src={event.banner_image_url} alt={event.event_name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{event.event_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.start_datetime), "MMM dd, yyyy")} •{" "}
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        event.status === "upcoming" ? "bg-primary/10 text-primary" :
                        event.status === "ongoing" ? "bg-green-100 text-green-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {event.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingEvent(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
