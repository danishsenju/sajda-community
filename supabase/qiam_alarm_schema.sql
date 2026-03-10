-- ── QIAM / TAHAJUD ALARM ────────────────────────────────────────────────────
-- One alarm setting per user. Cron job reads this table every minute.

create table if not exists qiam_alarms (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references profiles(id) on delete cascade not null,
  alarm_time  time        not null default '03:30:00',
  is_active   boolean     default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id)
);

alter table qiam_alarms enable row level security;

-- User can read/write their own alarm
create policy "Users manage own qiam alarm"
  on qiam_alarms for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role (used by cron) can read all active alarms — handled via service key
