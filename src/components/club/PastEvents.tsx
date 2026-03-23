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
  manual_registrations: number;
  total_fund: number;
  status: string;
}

const toEventIsoString = (value: string) => {
  if (!value) return "";
  const normalizedValue = value.includes("T") ? value : `${value}T12:00:00`;
  const parsedDate = new Date(normalizedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Please select a valid event date");
  }
  return parsedDate.toISOString();
};

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
    manual_registrations: "",
    total_fund: "",
  });

  const fetchEvents = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);

    const { data, error } = await supabase
      .from("club_events")
      .select("id, event_name, start_datetime, description, banner_image_url, instagram_link, manual_registrations, total_fund, status")
      .eq("club_id", club.id)
      .eq("status", "completed")
      .order("start_datetime", { ascending: false });

    if (error) {
      toast({ title: "Unable to load past events", description: error.message, variant: "destructive" });
    } else {
      setEvents((data as ClubEvent[]) || []);
    }

    if (showSpinner) setLoading(false);
  };

  useEffect(() => {
    void fetchEvents();
  }, [club.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!form.event_name || !form.start_datetime) {
      toast({ title: "Event name and date are required", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      let banner_image_url = "";

      if (bannerFile) {
        const fileExtension = bannerFile.name.split(".").pop()?.toLowerCase() || "png";
        const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(fileExtension) ? fileExtension : "png";
        const contentType = bannerFile.type || `image/${safeExtension === "jpg" ? "jpeg" : safeExtension}`;
        const path = `${club.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExtension}`;
        const { error: uploadErr } = await supabase.storage.from("event-banners").upload(path, uploadFile, {
          upsert: true,
          contentType,
        });

        if (uploadErr) {
          console.error("Upload error:", uploadErr);
          toast({ title: "Image upload failed", description: uploadErr.message, variant: "destructive" });
          return;
        }

        const { data: urlData } = supabase.storage.from("event-banners").getPublicUrl(path);
        banner_image_url = urlData.publicUrl;
      }

      const startDateIso = toEventIsoString(form.start_datetime);
      const endDateIso = toEventIsoString(form.end_datetime || form.start_datetime);
      const manualRegistrations = Number.parseInt(form.manual_registrations || "0", 10);
      const totalFund = Number.parseInt(form.total_fund || "0", 10);

      const { data: insertedEvent, error } = await supabase
        .from("club_events")
        .insert({
        club_id: club.id,
        event_name: form.event_name,
        short_name: form.event_name.substring(0, 20),
        start_datetime: startDateIso,
        end_datetime: endDateIso,
        description: form.description,
        instagram_link: form.instagram_link,
        banner_image_url,
        manual_registrations: Number.isNaN(manualRegistrations) ? 0 : manualRegistrations,
        total_fund: Number.isNaN(totalFund) ? 0 : totalFund,
        status: "completed",
      })
        .select("id, event_name, start_datetime, description, banner_image_url, instagram_link, manual_registrations, total_fund, status")
        .single();

      if (error) {
        console.error("Insert error:", error);
        toast({ title: "Error adding event", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Past event added!" });
        if (insertedEvent) {
          setEvents((previous) => [insertedEvent as ClubEvent, ...previous]);
        } else {
          void fetchEvents(false);
        }
        setShowForm(false);
        setForm({ event_name: "", start_datetime: "", end_datetime: "", description: "", instagram_link: "", manual_registrations: "", total_fund: "" });
        setBannerFile(null);
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
                  <Label>Event Date *</Label>
                  <Input type="date" min="2023-01-01" max="2026-12-31" value={form.start_datetime} onChange={(e) => setForm((p) => ({ ...p, start_datetime: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" min="2023-01-01" max="2026-12-31" value={form.end_datetime} onChange={(e) => setForm((p) => ({ ...p, end_datetime: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
              </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Registrations Count</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.manual_registrations}
                      onChange={(e) => setForm((p) => ({ ...p, manual_registrations: e.target.value }))}
                      placeholder="Enter total registrations"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Fund (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.total_fund}
                      onChange={(e) => setForm((p) => ({ ...p, total_fund: e.target.value }))}
                      placeholder="Enter total fund"
                    />
                  </div>
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
                    <img src={event.banner_image_url} alt={event.event_name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="p-4 flex-1">
                  <h3 className="font-semibold text-foreground">{event.event_name}</h3>
                  <p className="text-sm text-muted-foreground">{format(new Date(event.start_datetime), "MMM dd, yyyy")}</p>
                  {event.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>}
                   <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                     <span>{event.manual_registrations || 0} registrations</span>
                     <span>₹{(event.total_fund || 0).toLocaleString()} fund</span>
                   </div>
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
