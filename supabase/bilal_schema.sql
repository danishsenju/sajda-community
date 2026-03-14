-- BILAL (Muezzin) tables
-- Run this in Supabase SQL Editor

-- Bilal roster
create table if not exists bilals (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  phone      text,
  notes      text,
  is_active  boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Weekly bilal schedule (one bilal per prayer per date)
create table if not exists bilal_schedule (
  id         uuid default gen_random_uuid() primary key,
  date       date not null,
  prayer     text not null,  -- 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
  bilal_id   uuid references bilals(id) on delete set null,
  notes      text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique(date, prayer)
);

-- RLS
alter table bilals enable row level security;
alter table bilal_schedule enable row level security;

-- Public can read
create policy "Public read bilals" on bilals for select using (true);
create policy "Public read bilal_schedule" on bilal_schedule for select using (true);

-- AJK can manage
create policy "AJK manage bilals" on bilals for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "AJK manage bilal_schedule" on bilal_schedule for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
