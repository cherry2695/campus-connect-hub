import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Upload, Instagram, X } from "lucide-react";
import { format } from "date-fns";
import type { ClubInfo } from "@/hooks/useClubAuth";

interface Props {
  club: ClubInfo;
}

interface ClubEvent {
  id: string;
  event_name: string;
  start_datetime: string;
  description: string;
  banner_image_url: string;
  instagram_link: string;
  status: string;
}

export default function PastEvents({ club }: Props) {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    event_name: "",
    start_datetime: "",
    end_datetime: "",
    description: "",
    instagram_link: "",
  });

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("club_events")
      .select("id, event_name, start_datetime, description, banner_image_url, instagram_link, status")
      .eq("club_id", club.id)
      .eq("status", "completed")
      .order("start_datetime", { ascending: false });
    setEvents((data as ClubEvent[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [club.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_name || !form.start_datetime) {
      toast({ title: "Event name and date are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    try {
      let banner_image_url = "";
      if (bannerFile) {
        const ext = bannerFile.name.split(".").pop();
        const path = `${club.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("event-banners").upload(path, bannerFile, { upsert: true });
        if (uploadErr) {
          console.error("Upload error:", uploadErr);
          toast({ title: "Image upload failed", description: uploadErr.message, variant: "destructive" });
          setSaving(false);
          return;
        }
        const { data: urlData } = supabase.storage.from("event-banners").getPublicUrl(path);
        banner_image_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("club_events").insert({
        club_id: club.id,
        event_name: form.event_name,
        short_name: form.event_name.substring(0, 20),
        start_datetime: new Date(form.start_datetime).toISOString(),
        end_datetime: form.end_datetime ? new Date(form.end_datetime).toISOString() : new Date(form.start_datetime).toISOString(),
        description: form.description,
        instagram_link: form.instagram_link,
        banner_image_url,
        status: "completed",
      });

      if (error) {
        console.error("Insert error:", error);
        toast({ title: "Error adding event", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Past event added!" });
        setShowForm(false);
        setForm({ event_name: "", start_datetime: "", end_datetime: "", description: "", instagram_link: "" });
        setBannerFile(null);
        fetchEvents();
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast({ title: "Something went wrong", description: err?.message || "Please try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Past Events</h1>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? <><X className="h-4 w-4 mr-1" /> Cancel</> : <><Plus className="h-4 w-4 mr-1" /> Add Past Event</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Event Name *</Label>
                <Input value={form.event_name} onChange={(e) => setForm((p) => ({ ...p, event_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input type="datetime-local" value={form.start_datetime} onChange={(e) => setForm((p) => ({ ...p, start_datetime: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="datetime-local" value={form.end_datetime} onChange={(e) => setForm((p) => ({ ...p, end_datetime: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Upload Images</Label>
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-muted text-sm">
                  <Upload className="h-4 w-4" />
                  {bannerFile ? bannerFile.name : "Choose image"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <div className="space-y-2">
                <Label>Instagram Link (optional)</Label>
                <Input value={form.instagram_link} onChange={(e) => setForm((p) => ({ ...p, instagram_link: e.target.value }))} placeholder="https://instagram.com/p/..." />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</> : "Add Past Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {events.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No past events yet.</p>
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
                <div className="p-4 flex-1">
                  <h3 className="font-semibold text-foreground">{event.event_name}</h3>
                  <p className="text-sm text-muted-foreground">{format(new Date(event.start_datetime), "MMM dd, yyyy")}</p>
                  {event.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>}
                  {event.instagram_link && (
                    <a href={event.instagram_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary mt-2 hover:underline">
                      <Instagram className="h-4 w-4" /> View on Instagram
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
