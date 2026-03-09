INSERT INTO storage.buckets (id, name, public) VALUES ('garden-screenshots', 'garden-screenshots', true);

CREATE POLICY "Users can upload own screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'garden-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'garden-screenshots');
CREATE POLICY "Users can delete own screenshots" ON storage.objects FOR DELETE USING (bucket_id = 'garden-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE TABLE public.garden_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid,
  flower_type text NOT NULL,
  flower_count integer NOT NULL,
  screenshot_path text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.garden_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gallery" ON public.garden_gallery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gallery" ON public.garden_gallery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own gallery" ON public.garden_gallery FOR DELETE USING (auth.uid() = user_id);