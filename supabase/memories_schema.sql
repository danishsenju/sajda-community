-- Program Memories table
-- Run this in Supabase SQL Editor

create table if not exists program_memories (
  id         uuid default gen_random_uuid() primary key,
  program_id uuid references programs(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  reflection text check (char_length(reflection) <= 300),
  created_at timestamptz default now(),
  unique(program_id, user_id)
);

alter table program_memories enable row level security;

-- Anyone can read reflections
create policy "Public read program_memories" on program_memories
  for select using (true);

-- Authenticated users can add their own memory
create policy "Auth users insert memory" on program_memories
  for insert with check (auth.uid() = user_id);

-- Users can update their own memory
create policy "Users update own memory" on program_memories
  for update using (auth.uid() = user_id);
