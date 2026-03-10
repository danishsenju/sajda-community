-- ============================================================
-- HALAQAH KOMUNITI — Schema + RLS
-- Run this in Supabase SQL Editor
-- ============================================================

-- HALAQAH GROUPS
create table halaqah_groups (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,
  description   text,
  type          text not null default 'tadarus', -- 'tadarus' | 'hafazan' | 'tafsir' | 'tahsin'
  weekly_target int  not null default 1,         -- juzuk per week target
  max_members   int  not null default 10,
  is_open       boolean not null default true,
  created_by    uuid references profiles(id) on delete set null,
  created_at    timestamptz default now()
);

-- HALAQAH MEMBERS
create table halaqah_members (
  id         uuid default gen_random_uuid() primary key,
  group_id   uuid references halaqah_groups(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  role       text not null default 'ahli',       -- 'ketua' | 'ahli'
  joined_at  timestamptz default now(),
  unique(group_id, user_id)
);

-- HALAQAH PROGRESS (juzuk completion per user per group)
create table halaqah_progress (
  id         uuid default gen_random_uuid() primary key,
  group_id   uuid references halaqah_groups(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  juzuk      int  not null check (juzuk between 1 and 30),
  created_at timestamptz default now(),
  unique(group_id, user_id, juzuk)             -- one entry per juzuk per user per group
);

-- ── INDEXES ──────────────────────────────────────────────────
create index on halaqah_members(group_id);
create index on halaqah_members(user_id);
create index on halaqah_progress(group_id);
create index on halaqah_progress(user_id);

-- ── ENABLE RLS ───────────────────────────────────────────────
alter table halaqah_groups   enable row level security;
alter table halaqah_members  enable row level security;
alter table halaqah_progress enable row level security;

-- ── RLS POLICIES ─────────────────────────────────────────────

-- GROUPS: anyone can read; auth users can create; only creator can update/delete
create policy "Public read halaqah_groups"
  on halaqah_groups for select using (true);

create policy "Auth users create halaqah"
  on halaqah_groups for insert
  with check (auth.uid() is not null);

create policy "Creator or AJK update halaqah"
  on halaqah_groups for update
  using (
    created_by = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
  );

create policy "Creator or AJK delete halaqah"
  on halaqah_groups for delete
  using (
    created_by = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
  );

-- MEMBERS: anyone can read; auth users can join; only self or ketua can leave/remove
create policy "Public read halaqah_members"
  on halaqah_members for select using (true);

create policy "Auth users join halaqah"
  on halaqah_members for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "Member leaves own group"
  on halaqah_members for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from halaqah_members hm
      where hm.group_id = halaqah_members.group_id
        and hm.user_id = auth.uid()
        and hm.role = 'ketua'
    )
    or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
  );

-- PROGRESS: anyone can read; members can insert/delete own progress
create policy "Public read halaqah_progress"
  on halaqah_progress for select using (true);

create policy "Member records own progress"
  on halaqah_progress for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from halaqah_members
      where group_id = halaqah_progress.group_id and user_id = auth.uid()
    )
  );

create policy "Member removes own progress"
  on halaqah_progress for delete
  using (user_id = auth.uid());
