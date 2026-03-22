
-- Faculty profiles table
CREATE TABLE public.faculty_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can read own profile" ON public.faculty_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Faculty can insert own profile" ON public.faculty_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Faculty can update own profile" ON public.faculty_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Faculty programs table
CREATE TABLE public.faculty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text DEFAULT '',
  description text DEFAULT '',
  program_type text NOT NULL DEFAULT 'FDP',
  mode text NOT NULL DEFAULT 'offline',
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz NOT NULL,
  venue text DEFAULT '',
  banner_image_url text DEFAULT '',
  status text NOT NULL DEFAULT 'upcoming',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faculty_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read programs" ON public.faculty_programs
  FOR SELECT TO authenticated USING (true);

-- Faculty registrations table
CREATE TABLE public.faculty_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.faculty_programs(id) ON DELETE CASCADE,
  faculty_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  faculty_name text NOT NULL,
  department text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  organization_role text DEFAULT '',
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(program_id, faculty_id)
);

ALTER TABLE public.faculty_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can read own registrations" ON public.faculty_registrations
  FOR SELECT TO authenticated USING (auth.uid() = faculty_id);

CREATE POLICY "Faculty can insert own registrations" ON public.faculty_registrations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = faculty_id);

-- Storage policy for event-banners uploads (fix club portal past events)
CREATE POLICY "Authenticated users can upload event banners"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-banners');

CREATE POLICY "Anyone can read event banners"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'event-banners');

-- Storage policy for avatars uploads
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');
