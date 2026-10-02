ALTER TABLE public.blocked_dates ADD COLUMN IF NOT EXISTS source_channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE;
ALTER TABLE public.blocked_dates ADD COLUMN IF NOT EXISTS external_uid text;
CREATE INDEX IF NOT EXISTS blocked_dates_source_idx ON public.blocked_dates(source_channel_id);