-- Allow all authenticated users to read wyn_koins for leaderboard
CREATE POLICY "Anyone can view balances for leaderboard"
ON public.wyn_koins
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to read profiles for leaderboard display names
CREATE POLICY "Anyone can view profiles for leaderboard"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);