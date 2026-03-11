-- Add snoozed_until column to qiam_alarms
-- Run this in Supabase SQL Editor

alter table qiam_alarms
  add column if not exists snoozed_until timestamptz;
