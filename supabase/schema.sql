-- ============================================================
-- SAJDA — Mosque Community Platform
-- Supabase Schema + RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================================

-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  unit_blok text,
  role text default 'jemaah', -- 'jemaah' | 'ajk' | 'superadmin'
  avatar_url text,
  created_at timestamptz default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Jemaah'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- MOSQUE INFO (single row)
create table mosque_info (
  id int primary key default 1,
  name text not null default 'Masjid Saujana Utama',
  address text default 'Jalan Kemboja 2, Saujana Utama 2, 47000 Sungai Buloh, Selangor',
  phone text default '012-3384586',
  description text,
  gmaps_url text default 'https://maps.google.com/?q=Masjid+Saujana+Utama+Sungai+Buloh',
  has_wudhu boolean default true,
  has_womens_section boolean default true,
  has_parking boolean default true,
  has_accessibility boolean default false,
  parking_notes text,
  operating_notes text,
  updated_at timestamptz default now()
);

insert into mosque_info (id) values (1) on conflict do nothing;

-- PRAYER TIMES
create table prayer_times (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  fajr time not null,
  syuruk time,
  dhuhr time not null,
  asr time not null,
  maghrib time not null,
  isha time not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ANNOUNCEMENTS
create table announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  category text default 'umum', -- 'umum' | 'kecemasan' | 'ramadan' | 'kewangan'
  is_pinned boolean default false,
  expires_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- KEPERLUAN KOMUNITI
create table keperluan (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  category text not null, -- 'bantuan_fizikal' | 'ilmu_tuisyen' | 'transport' | 'barangan' | 'lain'
  urgency text default 'normal', -- 'normal' | 'urgent'
  status text default 'pending', -- 'pending' | 'open' | 'in_progress' | 'resolved'
  posted_by uuid references profiles(id),
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create table keperluan_helpers (
  id uuid default gen_random_uuid() primary key,
  keperluan_id uuid references keperluan(id) on delete cascade,
  helper_id uuid references profiles(id),
  message text,
  created_at timestamptz default now(),
  unique(keperluan_id, helper_id)
);

-- PROGRAMS (events + volunteer)
create table programs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text default 'umum', -- 'solat' | 'kebajikan' | 'ramadan' | 'gotong_royong' | 'umum'
  program_date date not null,
  start_time time not null,
  end_time time,
  location text,
  needs_volunteers boolean default false,
  volunteer_slots int default 0,
  is_published boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table volunteer_signups (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references programs(id) on delete cascade,
  user_id uuid references profiles(id),
  status text default 'confirmed', -- 'confirmed' | 'cancelled'
  created_at timestamptz default now(),
  unique(program_id, user_id)
);

-- KELAS (classes with booking)
create table kelas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  ustaz_name text,
  category text default 'quran', -- 'quran' | 'fiqh' | 'akhlak' | 'bahasa_arab' | 'lain'
  schedule_day text,
  start_date date,
  end_date date,
  time_start time,
  time_end time,
  location text,
  capacity int,
  is_active boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table kelas_bookings (
  id uuid default gen_random_uuid() primary key,
  kelas_id uuid references kelas(id) on delete cascade,
  user_id uuid references profiles(id),
  status text default 'active', -- 'active' | 'cancelled'
  created_at timestamptz default now(),
  unique(kelas_id, user_id)
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

alter table profiles enable row level security;
alter table mosque_info enable row level security;
alter table prayer_times enable row level security;
alter table announcements enable row level security;
alter table keperluan enable row level security;
alter table keperluan_helpers enable row level security;
alter table programs enable row level security;
alter table volunteer_signups enable row level security;
alter table kelas enable row level security;
alter table kelas_bookings enable row level security;

-- PROFILES
create policy "Public read profiles" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- MOSQUE INFO & PRAYER TIMES
create policy "Public read mosque_info" on mosque_info for select using (true);
create policy "AJK manage mosque_info" on mosque_info for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Public read prayer_times" on prayer_times for select using (true);
create policy "AJK manage prayer_times" on prayer_times for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);

-- ANNOUNCEMENTS
create policy "Public read announcements" on announcements for select using (true);
create policy "AJK manage announcements" on announcements for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);

-- KEPERLUAN
create policy "Read approved keperluan" on keperluan for select using (
  status != 'pending'
  or posted_by = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Auth users post keperluan" on keperluan for insert with check (auth.uid() is not null);
create policy "Owner or AJK update keperluan" on keperluan for update using (
  posted_by = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "AJK delete keperluan" on keperluan for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Public read helpers" on keperluan_helpers for select using (true);
create policy "Auth users offer help" on keperluan_helpers for insert with check (auth.uid() is not null);
create policy "Remove own help offer" on keperluan_helpers for delete using (helper_id = auth.uid());

-- PROGRAMS
create policy "Public read published programs" on programs for select using (is_published = true);
create policy "AJK manage programs" on programs for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Read own or AJK volunteer signups" on volunteer_signups for select using (
  user_id = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Auth users signup volunteer" on volunteer_signups for insert with check (auth.uid() is not null);
create policy "Users cancel own signup" on volunteer_signups for update using (user_id = auth.uid());

-- KELAS
create policy "Public read active kelas" on kelas for select using (is_active = true);
create policy "AJK manage kelas" on kelas for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Read own or AJK bookings" on kelas_bookings for select using (
  user_id = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Auth users book kelas" on kelas_bookings for insert with check (auth.uid() is not null);
create policy "Users cancel own booking" on kelas_bookings for update using (user_id = auth.uid());

-- LOST & FOUND
create table lost_found (
  id uuid default gen_random_uuid() primary key,
  type text not null default 'lost', -- 'lost' | 'found'
  item_name text not null,
  description text,
  location text,
  contact text,
  is_resolved boolean not null default false,
  posted_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table lost_found enable row level security;
create policy "Public read lost_found" on lost_found for select using (true);
create policy "Anyone post lost_found" on lost_found for insert with check (true);
create policy "Owner or AJK update lost_found" on lost_found for update using (
  posted_by = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "AJK delete lost_found" on lost_found for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);

-- DERMA ACCOUNTS
create table derma_accounts (
  id uuid default gen_random_uuid() primary key,
  bank text not null,
  account_name text not null,
  account_no text not null,
  color text not null default '#3DFF8F',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

alter table derma_accounts enable row level security;

create policy "Public read active derma accounts" on derma_accounts
  for select using (is_active = true);

create policy "AJK manage derma accounts" on derma_accounts
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
  );

-- ============================================================
-- After first login, set your account as superadmin:
-- update profiles set role = 'superadmin' where id = 'your-user-id';
-- ============================================================
