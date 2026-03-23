ALTER TABLE public.club_events
ADD COLUMN IF NOT EXISTS manual_registrations integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_fund integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.club_events.manual_registrations IS 'Optional manual registrations count for completed/past events used in club analytics.';
COMMENT ON COLUMN public.club_events.total_fund IS 'Optional total funds collected for a completed/past event used in club analytics.';