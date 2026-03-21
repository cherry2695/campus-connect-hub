
-- Tighten the registration insert policy to require user_id match
DROP POLICY "Authenticated users can register" ON public.club_registrations;
CREATE POLICY "Authenticated users can register for events"
  ON public.club_registrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
