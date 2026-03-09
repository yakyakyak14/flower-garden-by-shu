CREATE TABLE public.daily_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_session_date date,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX daily_streaks_user_id_idx ON public.daily_streaks (user_id);

CREATE POLICY "Users can view own streak" ON public.daily_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON public.daily_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.daily_streaks FOR UPDATE USING (auth.uid() = user_id);