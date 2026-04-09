
-- Add approval_status to club_events
ALTER TABLE public.club_events ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';

-- Create admin notifications table
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL,
  event_id uuid,
  message text NOT NULL DEFAULT '',
  notification_type text NOT NULL DEFAULT 'approval_request',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admin (mlritclgadmin@mlrit.ac.in) can read all notifications
CREATE POLICY "Admin can read all notifications"
ON public.admin_notifications FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'mlritclgadmin@mlrit.ac.in'
  OR club_id IN (SELECT c.id FROM clubs c WHERE c.email = (auth.jwt() ->> 'email'))
);

-- Admin can insert notifications (approvals/rejections)
CREATE POLICY "Admin can insert notifications"
ON public.admin_notifications FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'email') = 'mlritclgadmin@mlrit.ac.in'
  OR club_id IN (SELECT c.id FROM clubs c WHERE c.email = (auth.jwt() ->> 'email'))
);

-- Admin can update notifications (mark as read)
CREATE POLICY "Admin can update notifications"
ON public.admin_notifications FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'mlritclgadmin@mlrit.ac.in'
  OR club_id IN (SELECT c.id FROM clubs c WHERE c.email = (auth.jwt() ->> 'email'))
);

-- Admin can delete notifications
CREATE POLICY "Admin can delete notifications"
ON public.admin_notifications FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'email') = 'mlritclgadmin@mlrit.ac.in');

-- Allow admin to update club_events (for approval)
CREATE POLICY "Admin can update all events"
ON public.club_events FOR UPDATE TO authenticated
USING ((auth.jwt() ->> 'email') = 'mlritclgadmin@mlrit.ac.in');

-- Allow admin to read all events
CREATE POLICY "Admin can read all events"
ON public.club_events FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'email') = 'mlritclgadmin@mlrit.ac.in');

-- Allow admin to manage faculty_programs (insert, update, delete)
CREATE POLICY "Admin can insert faculty programs"
ON public.faculty_programs FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() ->> 'email') = 'mlritclgadmin@mlrit.ac.in');

CREATE POLICY "Admin can update faculty programs"
ON public.faculty_programs FOR UPDATE TO authenticated
USING ((auth.jwt() ->> 'email') = 'mlritclgadmin@mlrit.ac.in');

CREATE POLICY "Admin can delete faculty programs"
ON public.faculty_programs FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'email') = 'mlritclgadmin@mlrit.ac.in');
