import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import type { ClubInfo } from "@/hooks/useClubAuth";

interface Props {
  club: ClubInfo;
}

interface Notification {
  id: string;
  event_id: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export default function ClubNotifications({ club }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("admin_notifications")
        .select("*")
        .eq("club_id", club.id)
        .order("created_at", { ascending: false });
      setNotifications((data as Notification[]) || []);
      setLoading(false);

      // Mark as read
      if (data && data.length > 0) {
        const unread = data.filter((n: any) => !n.is_read).map((n: any) => n.id);
        if (unread.length > 0) {
          await supabase.from("admin_notifications").update({ is_read: true }).in("id", unread);
        }
      }
    })();
  }, [club.id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  const getIcon = (type: string) => {
    if (type === "approved") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (type === "rejected") return <XCircle className="h-5 w-5 text-red-500" />;
    return <Clock className="h-5 w-5 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Card key={n.id} className={`${!n.is_read ? "border-l-4 border-l-primary" : ""}`}>
              <CardContent className="p-4 flex items-start gap-3">
                {getIcon(n.notification_type)}
                <div className="flex-1">
                  <p className="text-sm text-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.created_at), "MMM dd, yyyy HH:mm")}</p>
                </div>
                <Badge className={
                  n.notification_type === "approved" ? "bg-green-100 text-green-700" :
                  n.notification_type === "rejected" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }>
                  {n.notification_type.replace("_", " ")}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
