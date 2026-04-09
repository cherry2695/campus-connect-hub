import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArrowLeft, Calendar, MapPin, Tag, Users, DollarSign, Instagram, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface EventData {
  id: string;
  event_name: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  event_mode: string;
  pricing_type: string;
  amount: number;
  description: string;
  banner_image_url: string;
  venue: string;
  venue_details: string;
  status: string;
  instagram_link: string;
  manual_registrations: number;
  total_fund: number;
  club_id: string;
}

interface Club {
  club_name: string;
  instagram_url: string;
}

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    (async () => {
      const { data } = await supabase.from("club_events").select("*").eq("id", eventId).single();
      if (data) {
        setEvent(data as EventData);
        const { data: clubData } = await supabase.from("clubs").select("club_name, instagram_url").eq("id", data.club_id).single();
        setClub(clubData as Club);
      }
      setLoading(false);
    })();
  }, [eventId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Event not found</p></div>;

  const statusColor = event.status === "upcoming" ? "bg-blue-100 text-blue-700" : event.status === "ongoing" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        {event.banner_image_url && (
          <div className="w-full max-w-md mx-auto aspect-[4/5] rounded-2xl overflow-hidden mb-6 shadow-lg">
            <img src={event.banner_image_url} alt={event.event_name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{event.event_name}</h1>
            {club && <p className="text-lg text-muted-foreground mt-1">by {club.club_name}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className={statusColor}>{event.status}</Badge>
              <Badge variant="outline">{event.event_type}</Badge>
              <Badge variant="outline">{event.event_mode}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium">{format(new Date(event.start_datetime), "MMM dd, yyyy")}</p>
                  {event.end_datetime !== event.start_datetime && (
                    <p className="text-xs text-muted-foreground">to {format(new Date(event.end_datetime), "MMM dd, yyyy")}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-orange-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Registrations</p>
                  <p className="text-sm font-medium">{event.manual_registrations}+</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Entry Fee</p>
                  <p className="text-sm font-medium">{event.pricing_type === "paid" ? `₹${event.amount}` : "Free"}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Tag className="h-5 w-5 text-purple-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Fund</p>
                  <p className="text-sm font-medium">₹{event.total_fund.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {event.venue && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.venue}{event.venue_details ? ` — ${event.venue_details}` : ""}</span>
            </div>
          )}

          {event.description && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">About This Event</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{event.description}</p>
            </div>
          )}

          {event.instagram_link && (
            <a href={event.instagram_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              <Instagram className="h-5 w-5" /> View on Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
