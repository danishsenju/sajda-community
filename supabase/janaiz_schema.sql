-- JANAIZ NOTICES (Notis Kematian & Takziah)
-- Run in Supabase SQL Editor

create table if not exists janaiz_notices (
  id            uuid default gen_random_uuid() primary key,
  deceased_name text not null,
  age           int,
  death_date    date not null,
  jenazah_time  text,          -- e.g. "9:00 AM", flexible text
  jenazah_location text,       -- e.g. "Masjid Saujana Utama"
  burial_location_text text,   -- human readable address
  burial_lat    numeric(10, 7),
  burial_lng    numeric(10, 7),
  notes         text,          -- additional info, doa, etc.
  posted_by     uuid references profiles(id),
  is_verified   boolean default false,
  verified_by   uuid references profiles(id),
  verified_at   timestamptz,
  created_at    timestamptz default now()
);

-- Enable RLS
alter table janaiz_notices enable row level security;

-- Public can read all notices (verified and recent unverified for urgency)
create policy "Public read janaiz" on janaiz_notices
  for select using (true);

-- Authenticated users can post
create policy "Auth users post janaiz" on janaiz_notices
  for insert with check (auth.uid() is not null);

-- Poster or AJK can update
create policy "Poster or AJK update janaiz" on janaiz_notices
  for update using (
    posted_by = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role in ('ajk', 'superadmin'))
  );

-- AJK can delete
create policy "AJK delete janaiz" on janaiz_notices
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role in ('ajk', 'superadmin'))
  );
