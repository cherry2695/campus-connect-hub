import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import type { ClubInfo } from "@/hooks/useClubAuth";

interface Props {
  club: ClubInfo;
}

export default function CreateEvent({ club }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    event_name: "",
    short_name: "",
    start_datetime: "",
    end_datetime: "",
    event_type: "workshop",
    event_mode: "offline",
    pricing_type: "free",
    amount: 0,
    venue: "",
    venue_details: "",
    description: "",
    keywords: "",
    website_url: "",
  });

  const set = (key: string, val: string | number) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_name || !form.start_datetime || !form.end_datetime) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setLoading(true);

    let banner_image_url = "";
    if (bannerFile) {
      const ext = bannerFile.name.split(".").pop();
      const path = `${club.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("event-banners").upload(path, bannerFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("event-banners").getPublicUrl(path);
        banner_image_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("club_events").insert({
      club_id: club.id,
      event_name: form.event_name,
      short_name: form.short_name,
      start_datetime: form.start_datetime,
      end_datetime: form.end_datetime,
      event_type: form.event_type,
      event_mode: form.event_mode,
      pricing_type: form.pricing_type,
      amount: form.pricing_type === "paid" ? form.amount : 0,
      venue: form.venue,
      venue_details: form.venue_details,
      description: form.description,
      keywords: form.keywords,
      banner_image_url,
      website_url: form.website_url,
      status: "upcoming",
    });

    setLoading(false);
    if (error) {
      toast({ title: "Error creating event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event created successfully!" });
      navigate("/club-portal/manage-events");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Create Event</h1>
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Name *</Label>
                <Input value={form.event_name} onChange={(e) => set("event_name", e.target.value)} placeholder="Enter event name" />
              </div>
              <div className="space-y-2">
                <Label>Short Name</Label>
                <Input value={form.short_name} onChange={(e) => set("short_name", e.target.value)} placeholder="e.g. HACK24" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date & Time *</Label>
                <Input type="datetime-local" value={form.start_datetime} onChange={(e) => set("start_datetime", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date & Time *</Label>
                <Input type="datetime-local" value={form.end_datetime} onChange={(e) => set("end_datetime", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Event Type</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.event_type} onChange={(e) => set("event_type", e.target.value)}>
                  <option value="workshop">Workshop</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="seminar">Seminar</option>
                  <option value="competition">Competition</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Event Mode</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.event_mode} onChange={(e) => set("event_mode", e.target.value)}>
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Pricing</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.pricing_type} onChange={(e) => set("pricing_type", e.target.value)}>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {form.pricing_type === "paid" && (
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" min={0} value={form.amount} onChange={(e) => set("amount", Number(e.target.value))} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Venue</Label>
                <Input value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. Auditorium" />
              </div>
              <div className="space-y-2">
                <Label>Additional Details</Label>
                <Input value={form.venue_details} onChange={(e) => set("venue_details", e.target.value)} placeholder="Room, floor, etc." />
              </div>
            </div>

            <div className="space-y-2">
              <Label>About / Description</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the event..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input value={form.keywords} onChange={(e) => set("keywords", e.target.value)} placeholder="coding, AI, workshop" />
            </div>

            <div className="space-y-2">
              <Label>Banner Image</Label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-muted text-sm hover:bg-muted/80 transition-colors">
                  <Upload className="h-4 w-4" />
                  {bannerFile ? bannerFile.name : "Choose file"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Website</Label>
              <Input value={form.website_url} onChange={(e) => set("website_url", e.target.value)} placeholder="https://..." />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
