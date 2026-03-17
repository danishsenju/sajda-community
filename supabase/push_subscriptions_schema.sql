-- Push Notification Subscriptions
-- Run this in Supabase SQL Editor

create table if not exists push_subscriptions (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz default now()
);

alter table push_subscriptions enable row level security;

-- Users can only manage their own subscriptions
create policy "Users manage own subscriptions"
  on push_subscriptions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Service role can read all (for server-side push sending)
-- This is automatically allowed via service role key, no extra policy needed.
-- If using anon key on server, uncomment:
-- create policy "Service role read all"
--   on push_subscriptions for select
--   using (true);
