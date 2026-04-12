-- ============================================================
-- SAJDA SaaS — Multi-Mosque Platform Schema
-- Run AFTER the base schema.sql has been executed
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. NEW TABLES
-- ─────────────────────────────────────────────────────────────

-- MOSQUES (replaces singleton mosque_info for multi-tenancy)
create table if not exists mosques (
  id           uuid    default gen_random_uuid() primary key,
  slug         text    unique not null,           -- URL slug e.g. 'masjid-saujana-utama'
  name         text    not null,
  category     text    default 'masjid',          -- 'masjid' | 'surau' | 'musolla'
  address      text,
  state        text,                              -- Malaysian state e.g. 'Selangor'
  phone        text,
  gmaps_url    text,
  logo_url     text,
  description  text,
  has_wudhu             boolean default true,
  has_womens_section    boolean default true,
  has_parking           boolean default true,
  has_accessibility     boolean default false,
  jakim_zone   text    default 'SGR01',
  is_active    boolean default false,             -- true after subscription activated
  created_at   timestamptz default now()
);

-- SUBSCRIPTIONS
create table if not exists subscriptions (
  id                    uuid    default gen_random_uuid() primary key,
  mosque_id             uuid    references mosques(id) on delete cascade,
  plan                  text    not null,         -- 'surau' | 'kariah' | 'komuniti'
  status                text    default 'pending',-- 'pending' | 'active' | 'expired' | 'cancelled'
  billplz_bill_id       text,                     -- Billplz bill reference
  amount_rm             int     not null,         -- 49 | 99 | 199
  billing_cycle         text    default 'monthly',
  starts_at             timestamptz,
  expires_at            timestamptz,
  created_at            timestamptz default now()
);

-- MOSQUE AJK (mosque-scoped roles — replaces global profiles.role = 'ajk')
create table if not exists mosque_ajk (
  id          uuid    default gen_random_uuid() primary key,
  mosque_id   uuid    references mosques(id) on delete cascade,
  user_id     uuid    references profiles(id) on delete cascade,
  role        text    default 'ajk',              -- 'ajk' | 'admin' (mosque owner)
  invited_by  uuid    references profiles(id),
  joined_at   timestamptz default now(),
  unique(mosque_id, user_id)
);

-- MOSQUE FOLLOWS (jemaah follows mosques they care about)
create table if not exists mosque_follows (
  id          uuid    default gen_random_uuid() primary key,
  mosque_id   uuid    references mosques(id) on delete cascade,
  user_id     uuid    references profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(mosque_id, user_id)
);

-- AJK INVITATIONS (email invite flow for onboarding AJK members)
create table if not exists ajk_invitations (
  id          uuid    default gen_random_uuid() primary key,
  mosque_id   uuid    references mosques(id) on delete cascade,
  email       text    not null,
  token       text    unique not null,            -- secure random token in invite link
  role        text    default 'ajk',
  invited_by  uuid    references profiles(id),
  accepted_at timestamptz,
  expires_at  timestamptz default (now() + interval '7 days'),
  created_at  timestamptz default now()
);


-- ─────────────────────────────────────────────────────────────
-- 2. MIGRATE EXISTING TABLES — add mosque_id FK
-- ─────────────────────────────────────────────────────────────

-- Core tables (always exist from schema.sql)
alter table announcements      add column if not exists mosque_id uuid references mosques(id);
alter table programs           add column if not exists mosque_id uuid references mosques(id);
alter table volunteer_signups  add column if not exists mosque_id uuid references mosques(id);
alter table keperluan          add column if not exists mosque_id uuid references mosques(id);
alter table keperluan_helpers  add column if not exists mosque_id uuid references mosques(id);
alter table kelas              add column if not exists mosque_id uuid references mosques(id);
alter table kelas_bookings     add column if not exists mosque_id uuid references mosques(id);
alter table prayer_times       add column if not exists mosque_id uuid references mosques(id);

-- Extended tables (added via separate schema files — run only if table exists)
do $$
begin
  if exists (select from information_schema.tables where table_name = 'janaiz_notices') then
    alter table janaiz_notices add column if not exists mosque_id uuid references mosques(id);
  end if;
  if exists (select from information_schema.tables where table_name = 'halaqah_groups') then
    alter table halaqah_groups add column if not exists mosque_id uuid references mosques(id);
  end if;
  if exists (select from information_schema.tables where table_name = 'bilals') then
    alter table bilals add column if not exists mosque_id uuid references mosques(id);
  end if;
  if exists (select from information_schema.tables where table_name = 'bilal_schedule') then
    alter table bilal_schedule add column if not exists mosque_id uuid references mosques(id);
  end if;
  if exists (select from information_schema.tables where table_name = 'solat_counts') then
    alter table solat_counts add column if not exists mosque_id uuid references mosques(id);
  end if;
  if exists (select from information_schema.tables where table_name = 'live_streams') then
    alter table live_streams add column if not exists mosque_id uuid references mosques(id);
  end if;
  if exists (select from information_schema.tables where table_name = 'program_memories') then
    alter table program_memories add column if not exists mosque_id uuid references mosques(id);
  end if;
  if exists (select from information_schema.tables where table_name = 'push_subscriptions') then
    alter table push_subscriptions add column if not exists mosque_id uuid references mosques(id);
  end if;
  if exists (select from information_schema.tables where table_name = 'derma_accounts') then
    alter table derma_accounts add column if not exists mosque_id uuid references mosques(id);
  end if;
end $$;


-- ─────────────────────────────────────────────────────────────
-- 3. BACKFILL — seed Masjid Saujana Utama as the first mosque
--    and point all existing data to it
-- ─────────────────────────────────────────────────────────────

-- Insert MSU as the first mosque (idempotent via ON CONFLICT)
insert into mosques (
  id, slug, name, category, address, state, phone, gmaps_url,
  has_wudhu, has_womens_section, has_parking, has_accessibility,
  jakim_zone, is_active
) values (
  '00000000-0000-0000-0000-000000000001',
  'masjid-saujana-utama',
  'Masjid Saujana Utama',
  'masjid',
  'Jalan Kemboja 2, Saujana Utama 2, 47000 Sungai Buloh, Selangor',
  'Selangor',
  '012-3384586',
  'https://maps.google.com/?q=Masjid+Saujana+Utama+Sungai+Buloh',
  true, true, true, false,
  'SGR01',
  true  -- already active (existing mosque)
) on conflict (slug) do nothing;

-- Backfill mosque_id on all existing rows (where mosque_id is still null)
do $$
declare
  msu_id uuid := '00000000-0000-0000-0000-000000000001';
begin
  update announcements     set mosque_id = msu_id where mosque_id is null;
  update programs          set mosque_id = msu_id where mosque_id is null;
  update volunteer_signups set mosque_id = msu_id where mosque_id is null;
  update keperluan         set mosque_id = msu_id where mosque_id is null;
  update keperluan_helpers set mosque_id = msu_id where mosque_id is null;
  update kelas             set mosque_id = msu_id where mosque_id is null;
  update kelas_bookings    set mosque_id = msu_id where mosque_id is null;
  update prayer_times      set mosque_id = msu_id where mosque_id is null;

  if exists (select from information_schema.tables where table_name = 'janaiz_notices') then
    execute 'update janaiz_notices set mosque_id = $1 where mosque_id is null' using msu_id;
  end if;
  if exists (select from information_schema.tables where table_name = 'halaqah_groups') then
    execute 'update halaqah_groups set mosque_id = $1 where mosque_id is null' using msu_id;
  end if;
  if exists (select from information_schema.tables where table_name = 'bilals') then
    execute 'update bilals set mosque_id = $1 where mosque_id is null' using msu_id;
  end if;
  if exists (select from information_schema.tables where table_name = 'bilal_schedule') then
    execute 'update bilal_schedule set mosque_id = $1 where mosque_id is null' using msu_id;
  end if;
  if exists (select from information_schema.tables where table_name = 'solat_counts') then
    execute 'update solat_counts set mosque_id = $1 where mosque_id is null' using msu_id;
  end if;
  if exists (select from information_schema.tables where table_name = 'live_streams') then
    execute 'update live_streams set mosque_id = $1 where mosque_id is null' using msu_id;
  end if;
  if exists (select from information_schema.tables where table_name = 'program_memories') then
    execute 'update program_memories set mosque_id = $1 where mosque_id is null' using msu_id;
  end if;
  if exists (select from information_schema.tables where table_name = 'push_subscriptions') then
    execute 'update push_subscriptions set mosque_id = $1 where mosque_id is null' using msu_id;
  end if;
  if exists (select from information_schema.tables where table_name = 'derma_accounts') then
    execute 'update derma_accounts set mosque_id = $1 where mosque_id is null' using msu_id;
  end if;
end $$;

-- Seed MSU active subscription (so existing AJK still have full access)
insert into subscriptions (mosque_id, plan, status, amount_rm, starts_at)
values (
  '00000000-0000-0000-0000-000000000001',
  'komuniti',
  'active',
  199,
  now()
) on conflict do nothing;


-- ─────────────────────────────────────────────────────────────
-- 4. ENABLE RLS ON NEW TABLES
-- ─────────────────────────────────────────────────────────────

alter table mosques          enable row level security;
alter table subscriptions    enable row level security;
alter table mosque_ajk       enable row level security;
alter table mosque_follows   enable row level security;
alter table ajk_invitations  enable row level security;


-- ─────────────────────────────────────────────────────────────
-- 5. RLS POLICIES — NEW TABLES
-- ─────────────────────────────────────────────────────────────

-- MOSQUES: anyone can read active mosques; only superadmin can manage
create policy "Public read active mosques"
  on mosques for select using (is_active = true);

create policy "Superadmin manage mosques"
  on mosques for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
  );

-- SUBSCRIPTIONS: mosque admin can see their own subscription
create policy "Mosque admin read own subscription"
  on subscriptions for select using (
    exists (
      select 1 from mosque_ajk
      where mosque_id = subscriptions.mosque_id
        and user_id = auth.uid()
        and role = 'admin'
    )
    or exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
  );

create policy "Superadmin manage subscriptions"
  on subscriptions for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
  );

-- MOSQUE_AJK: AJK members can see their own mosque's team
create policy "Mosque AJK read own team"
  on mosque_ajk for select using (
    mosque_id in (
      select mosque_id from mosque_ajk where user_id = auth.uid()
    )
    or exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
  );

create policy "Mosque admin manage AJK"
  on mosque_ajk for all using (
    exists (
      select 1 from mosque_ajk ma
      where ma.mosque_id = mosque_ajk.mosque_id
        and ma.user_id = auth.uid()
        and ma.role = 'admin'
    )
    or exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
  );

-- MOSQUE_FOLLOWS: users manage their own follows
create policy "Public read mosque follows"
  on mosque_follows for select using (true);

create policy "Auth users follow mosques"
  on mosque_follows for insert with check (auth.uid() = user_id);

create policy "Auth users unfollow mosques"
  on mosque_follows for delete using (auth.uid() = user_id);

-- AJK_INVITATIONS: invitee can read by token; mosque admin can manage
create policy "Anyone read own invitation by token"
  on ajk_invitations for select using (
    email = (select email from auth.users where id = auth.uid())
    or exists (
      select 1 from mosque_ajk
      where mosque_id = ajk_invitations.mosque_id
        and user_id = auth.uid()
        and role = 'admin'
    )
    or exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
  );

create policy "Mosque admin manage invitations"
  on ajk_invitations for all using (
    exists (
      select 1 from mosque_ajk
      where mosque_id = ajk_invitations.mosque_id
        and user_id = auth.uid()
        and role = 'admin'
    )
    or exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
  );


-- ─────────────────────────────────────────────────────────────
-- 6. HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────

-- Returns the active plan for a mosque ('surau'|'kariah'|'komuniti'|null)
create or replace function get_mosque_plan(p_mosque_id uuid)
returns text
language sql
stable
as $$
  select plan from subscriptions
  where mosque_id = p_mosque_id
    and status = 'active'
    and (expires_at is null or expires_at > now())
  order by created_at desc
  limit 1;
$$;

-- Check if a user is AJK/admin for a mosque
create or replace function is_mosque_ajk(p_mosque_id uuid, p_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from mosque_ajk
    where mosque_id = p_mosque_id and user_id = p_user_id
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- 7. INDEXES
-- ─────────────────────────────────────────────────────────────

create index if not exists idx_mosques_slug         on mosques(slug);
create index if not exists idx_mosques_state        on mosques(state);
create index if not exists idx_subscriptions_mosque on subscriptions(mosque_id, status);
create index if not exists idx_mosque_ajk_user      on mosque_ajk(user_id);
create index if not exists idx_mosque_ajk_mosque    on mosque_ajk(mosque_id);
create index if not exists idx_mosque_follows_user  on mosque_follows(user_id);
create index if not exists idx_mosque_follows_mosque on mosque_follows(mosque_id);
create index if not exists idx_announcements_mosque  on announcements(mosque_id);
create index if not exists idx_programs_mosque       on programs(mosque_id);
create index if not exists idx_prayer_times_mosque   on prayer_times(mosque_id, date);
