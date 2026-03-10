-- PUSH SUBSCRIPTIONS
-- Run this in Supabase SQL Editor

create table if not exists push_subscriptions (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references profiles(id) on delete cascade not null,
  endpoint   text not null unique,
  p256dh     text not null,
  auth_key   text not null,
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;

-- Users can manage their own subscriptions
create policy "Users insert own subscription" on push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "Users delete own subscription" on push_subscriptions
  for delete using (auth.uid() = user_id);

create policy "Users read own subscription" on push_subscriptions
  for select using (auth.uid() = user_id);

-- AJK/Superadmin can read all (for sending push)
create policy "AJK read all subscriptions" on push_subscriptions
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('ajk', 'superadmin')
    )
  );
