-- SOLAT COMMUNITY COUNT (anonymous aggregate, no user tracking)
-- Run this in Supabase SQL Editor

create table if not exists solat_counts (
  pray_date  date not null,
  prayer     text not null,  -- 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
  count      int  not null default 0,
  primary key (pray_date, prayer)
);

-- Public can read counts (for community display)
alter table solat_counts enable row level security;
create policy "Public read solat_counts" on solat_counts
  for select using (true);

-- Atomic increment via RPC (prevents direct table manipulation)
-- SECURITY DEFINER so it runs as the function owner, bypassing RLS for write
create or replace function increment_solat_count(p_date date, p_prayer text)
returns void
language plpgsql
security definer
as $$
begin
  insert into solat_counts (pray_date, prayer, count)
  values (p_date, p_prayer, 1)
  on conflict (pray_date, prayer)
  do update set count = solat_counts.count + 1;
end;
$$;
