-- Apply after the version of Compa that no longer reads or writes profiles.status is live.
-- This removes the old relationship-status answers from existing profiles.
alter table public.profiles drop column if exists status;
