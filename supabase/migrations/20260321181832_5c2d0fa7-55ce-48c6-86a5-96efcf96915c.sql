
-- Create clubs table
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  instagram_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Clubs can be read by authenticated users
CREATE POLICY "Authenticated users can read clubs"
  ON public.clubs FOR SELECT
  TO authenticated
  USING (true);

-- Seed clubs data
INSERT INTO public.clubs (club_name, email, instagram_url) VALUES
  ('CIE Club', 'cie@mlrit.ac.in', 'https://www.instagram.com/mlritcie/'),
  ('Code Club', 'codeclub@mlrit.ac.in', 'https://www.instagram.com/codeclub_mlrit/'),
  ('CAME Club', 'cameclub@mlrit.ac.in', 'https://www.instagram.com/cameclub_mlrit/'),
  ('SCOPE Club', 'scopeclub@mlrit.ac.in', 'https://www.instagram.com/mlrit_scope/'),
  ('Club Literati', 'clubliterati@mlrit.ac.in', 'https://www.instagram.com/mlrclubliterati/'),
  ('APEX Club', 'apex@mlrit.ac.in', 'https://www.instagram.com/apexmlrit/');

-- Create club_events table
CREATE TABLE public.club_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  event_name TEXT NOT NULL,
  short_name TEXT DEFAULT '',
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'workshop',
  event_mode TEXT NOT NULL DEFAULT 'offline',
  pricing_type TEXT NOT NULL DEFAULT 'free',
  amount INTEGER NOT NULL DEFAULT 0,
  venue TEXT DEFAULT '',
  venue_details TEXT DEFAULT '',
  description TEXT DEFAULT '',
  keywords TEXT DEFAULT '',
  banner_image_url TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'upcoming',
  instagram_link TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read events
CREATE POLICY "Authenticated users can read club_events"
  ON public.club_events FOR SELECT
  TO authenticated
  USING (true);

-- Club can insert own events (match club_id to user's club)
CREATE POLICY "Club can insert own events"
  ON public.club_events FOR INSERT
  TO authenticated
  WITH CHECK (
    club_id IN (
      SELECT c.id FROM public.clubs c
      WHERE c.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Club can update own events
CREATE POLICY "Club can update own events"
  ON public.club_events FOR UPDATE
  TO authenticated
  USING (
    club_id IN (
      SELECT c.id FROM public.clubs c
      WHERE c.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Club can delete own events
CREATE POLICY "Club can delete own events"
  ON public.club_events FOR DELETE
  TO authenticated
  USING (
    club_id IN (
      SELECT c.id FROM public.clubs c
      WHERE c.email = (SELECT auth.jwt()->>'email')
    )
  );

-- Create club_registrations table
CREATE TABLE public.club_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.club_events(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT DEFAULT '',
  team_name TEXT DEFAULT '',
  roll_no TEXT DEFAULT '',
  department TEXT DEFAULT '',
  year TEXT DEFAULT '',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.club_registrations ENABLE ROW LEVEL SECURITY;

-- Club can read registrations for their events
CREATE POLICY "Club can read registrations for own events"
  ON public.club_registrations FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT ce.id FROM public.club_events ce
      JOIN public.clubs c ON ce.club_id = c.id
      WHERE c.email = (SELECT auth.jwt()->>'email')
    )
    OR user_id = auth.uid()
  );

-- Authenticated users can register
CREATE POLICY "Authenticated users can register"
  ON public.club_registrations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Storage bucket for event banners
INSERT INTO storage.buckets (id, name, public) VALUES ('event-banners', 'event-banners', true);

CREATE POLICY "Club can upload event banners"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-banners');

CREATE POLICY "Anyone can view event banners"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'event-banners');

CREATE POLICY "Club can update event banners"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-banners');

CREATE POLICY "Club can delete event banners"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-banners');
