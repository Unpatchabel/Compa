-- Run once in a new Supabase project. Never place elevated keys in browser code.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 24),
  area text not null check (char_length(trim(area)) between 1 and 36),
  primary_interest text not null,
  secondary_interest text not null,
  theme text not null default 'sunny',
  art text not null default 'talk',
  answers jsonb not null default '[]'::jsonb,
  status text not null default 'Prefer not to say',
  created_at timestamptz not null default now(),
  constraint interest_primary_valid check (primary_interest in ('music','gaming','food','books','outdoors','film','fitness','art','tech')),
  constraint interest_secondary_valid check (secondary_interest in ('music','gaming','food','books','outdoors','film','fitness','art','tech') and secondary_interest <> primary_interest),
  constraint theme_valid check (theme in ('sunny','violet','wave','cherry','neon-lime','neon-pink','midnight','black-gold')),
  constraint art_valid check (art in ('talk','orbit','together','mixtape')),
  constraint status_valid check (status in ('Prefer not to say','Single','In a relationship')),
  constraint answers_valid check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers) = 3 and octet_length(answers::text) <= 360)
);

create table public.blocks (
  blocker uuid not null references auth.users(id) on delete cascade,
  blocked uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker,blocked),
  check (blocker <> blocked)
);

create table public.likes (
  sender uuid not null references auth.users(id) on delete cascade,
  target uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('music','gaming','food','books','outdoors','film','fitness','art','tech')),
  opener text not null default '' check (char_length(opener) <= 280),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  primary key (sender,target,category),
  check (sender <> target)
);
create index likes_target_expires_idx on public.likes(target,expires_at);

-- Separate append-only counter: creating a match or withdrawing a like never resets limits.
create table public.hello_events (
  sender uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index hello_events_sender_idx on public.hello_events(sender,created_at);

create table public.passes (
  viewer uuid not null references auth.users(id) on delete cascade,
  target uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (viewer,target),
  check (viewer <> target)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('music','gaming','food','books','outdoors','film','fitness','art','tech')),
  person_a uuid not null references auth.users(id) on delete cascade,
  person_b uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  ended_at timestamptz,
  check (person_a <> person_b)
);
create index matches_a_idx on public.matches(person_a,ended_at);
create index matches_b_idx on public.matches(person_b,ended_at);

-- A partial unique index is the final authority on one active friend per category.
create table public.match_members (
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  active boolean not null default true,
  primary key (match_id,user_id)
);
create unique index one_active_friend_per_category on public.match_members(user_id,category) where active;

create table public.messages (
  id bigint generated always as identity primary key,
  match_id uuid not null references public.matches(id) on delete cascade,
  sender uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index messages_match_history_idx on public.messages(match_id,id);

create table public.reports (
  id bigint generated always as identity primary key,
  reporter uuid not null references auth.users(id) on delete cascade,
  subject uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 10 and 500),
  created_at timestamptz not null default now(),
  check (reporter <> subject)
);

alter table public.profiles enable row level security;
alter table public.blocks enable row level security;
alter table public.likes enable row level security;
alter table public.hello_events enable row level security;
alter table public.passes enable row level security;
alter table public.matches enable row level security;
alter table public.match_members enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

create function public.is_blocked(p_viewer uuid,p_subject uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_viewer = (select auth.uid()) and exists(select 1 from public.blocks where
    (blocker=p_viewer and blocked=p_subject) or (blocker=p_subject and blocked=p_viewer));
$$;

-- Clients can create only their own profile; server functions own all matching writes.
create policy profiles_read on public.profiles for select to authenticated using (
  id = (select auth.uid()) or not public.is_blocked((select auth.uid()),id)
);
create policy profiles_create on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy blocks_read on public.blocks for select to authenticated using (blocker = (select auth.uid()));
create policy likes_read on public.likes for select to authenticated using (sender = (select auth.uid()) or target = (select auth.uid()));
create policy passes_read on public.passes for select to authenticated using (viewer = (select auth.uid()));
create policy matches_read on public.matches for select to authenticated using (person_a = (select auth.uid()) or person_b = (select auth.uid()));
create policy members_read on public.match_members for select to authenticated using (user_id = (select auth.uid()));
create policy messages_read on public.messages for select to authenticated using (
  exists (select 1 from public.matches m where m.id = messages.match_id and (m.person_a = (select auth.uid()) or m.person_b = (select auth.uid())))
);
create policy reports_read on public.reports for select to authenticated using (reporter = (select auth.uid()));

-- Restrict direct table writes, including attempts made outside the UI.
revoke all on public.profiles,public.blocks,public.likes,public.hello_events,public.passes,public.matches,public.match_members,public.messages,public.reports from anon,authenticated;
grant select on public.profiles,public.blocks,public.likes,public.passes,public.matches,public.match_members,public.messages,public.reports to authenticated;
grant insert,update on public.profiles to authenticated;

create function public.end_match(p_match uuid) returns void language plpgsql security definer
set search_path = '' as $$
declare me uuid := (select auth.uid()); cat text;
begin
  if me is null then raise exception 'Sign in required'; end if;
  select category into cat from public.matches where id=p_match and (person_a=me or person_b=me);
  if cat is null then raise exception 'Match not found'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:'||cat));
  update public.matches set ended_at=now()
    where id=p_match and ended_at is null and (person_a=me or person_b=me);
  if not found then raise exception 'Active match not found'; end if;
  update public.match_members set active=false where match_id=p_match;
end; $$;

create function public.send_hello(p_target uuid,p_category text,p_opener text default '') returns uuid
language plpgsql security definer set search_path = '' as $$
declare me uuid := (select auth.uid()); reciprocal public.likes%rowtype; new_match uuid;
begin
  if me is null then raise exception 'Sign in required'; end if;
  if p_target is null or me=p_target or p_category not in ('music','gaming','food','books','outdoors','film','fitness','art','tech')
     or char_length(coalesce(p_opener,''))>280 then raise exception 'Invalid request'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:user:'||me::text));
  -- Serialize match creation by category. The unique index is the final guard.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:'||p_category));
  if not exists(select 1 from public.profiles where id=me)
     or not exists(select 1 from public.profiles where id=p_target and primary_interest=p_category)
        and not exists(select 1 from public.likes where sender=p_target and target=me
          and category=p_category and expires_at>now()) then
    raise exception 'Profile unavailable'; end if;
  if exists(select 1 from public.blocks where (blocker=me and blocked=p_target) or (blocker=p_target and blocked=me)) then
    raise exception 'Connection unavailable'; end if;
  delete from public.hello_events where sender=me and created_at<now()-interval '2 days';
  if (select count(*) from public.hello_events where sender=me and created_at>now()-interval '1 hour') >= 20 then
    raise exception 'Too many hellos. Please try later'; end if;
  if exists(select 1 from public.likes where sender=me and target=p_target and category=p_category and expires_at>now()) then
    raise exception 'Hello already pending'; end if;
  insert into public.likes(sender,target,category,opener,created_at,expires_at)
    values(me,p_target,p_category,trim(coalesce(p_opener,'')),now(),now()+interval '24 hours')
    on conflict(sender,target,category) do update
    set opener=excluded.opener,created_at=now(),expires_at=now()+interval '24 hours';
  insert into public.hello_events(sender) values(me);
  select * into reciprocal from public.likes where sender=p_target and target=me
    and category=p_category and expires_at>now();
  if found and not exists(select 1 from public.match_members where user_id in (me,p_target) and category=p_category and active) then
    insert into public.matches(category,person_a,person_b) values(p_category,me,p_target) returning id into new_match;
    insert into public.match_members(match_id,user_id,category) values(new_match,me,p_category),(new_match,p_target,p_category);
    if trim(coalesce(p_opener,''))<>'' then insert into public.messages(match_id,sender,body) values(new_match,me,trim(p_opener)); end if;
    if reciprocal.opener<>'' then insert into public.messages(match_id,sender,body) values(new_match,p_target,reciprocal.opener); end if;
    delete from public.likes where category=p_category and ((sender=me and target=p_target) or (sender=p_target and target=me));
  end if;
  return new_match;
end; $$;

create function public.accept_mutual(p_target uuid,p_category text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare me uuid := (select auth.uid()); first_like public.likes%rowtype; second_like public.likes%rowtype; new_match uuid;
begin
  if me is null or p_target is null or p_category not in ('music','gaming','food','books','outdoors','film','fitness','art','tech') then raise exception 'Invalid request'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:'||p_category));
  if exists(select 1 from public.blocks where (blocker=me and blocked=p_target) or (blocker=p_target and blocked=me)) then raise exception 'Connection unavailable'; end if;
  select * into first_like from public.likes where sender=me and target=p_target and category=p_category and expires_at>now();
  if not found then raise exception 'Your hello has expired'; end if;
  select * into second_like from public.likes where sender=p_target and target=me and category=p_category and expires_at>now();
  if not found then raise exception 'No mutual hello yet'; end if;
  if exists(select 1 from public.match_members where user_id in (me,p_target) and category=p_category and active) then
    raise exception 'One of you already has a friend in this interest'; end if;
  insert into public.matches(category,person_a,person_b) values(p_category,me,p_target) returning id into new_match;
  insert into public.match_members(match_id,user_id,category) values(new_match,me,p_category),(new_match,p_target,p_category);
  if first_like.opener<>'' then insert into public.messages(match_id,sender,body) values(new_match,me,first_like.opener); end if;
  if second_like.opener<>'' then insert into public.messages(match_id,sender,body) values(new_match,p_target,second_like.opener); end if;
  delete from public.likes where category=p_category and ((sender=me and target=p_target) or (sender=p_target and target=me));
  return new_match;
end; $$;

create function public.withdraw_hello(p_target uuid,p_category text) returns void language plpgsql security definer
set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'Sign in required'; end if;
  delete from public.likes where sender=(select auth.uid()) and target=p_target and category=p_category;
end; $$;

create function public.pass_profile(p_target uuid) returns void language plpgsql security definer
set search_path = '' as $$
begin
  if (select auth.uid()) is null or p_target=(select auth.uid()) then raise exception 'Invalid request'; end if;
  insert into public.passes(viewer,target) values((select auth.uid()),p_target) on conflict do nothing;
end; $$;

create function public.send_message(p_match uuid,p_body text) returns bigint language plpgsql security definer
set search_path = '' as $$
declare me uuid := (select auth.uid()); new_id bigint; cat text;
begin
  if me is null or char_length(trim(coalesce(p_body,''))) not between 1 and 500 then raise exception 'Invalid message'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:user:'||me::text));
  select category into cat from public.matches where id=p_match;
  if cat is null then raise exception 'Chat unavailable'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:'||cat));
  if not exists(select 1 from public.match_members mm join public.matches m on m.id=mm.match_id
       where mm.match_id=p_match and mm.user_id=me and mm.active and m.ended_at is null) then
    raise exception 'Chat unavailable'; end if;
  if (select count(*) from public.messages where sender=me and created_at>now()-interval '1 minute')>=20 then
    raise exception 'Slow down before sending more messages'; end if;
  insert into public.messages(match_id,sender,body) values(p_match,me,trim(p_body)) returning id into new_id;
  return new_id;
end; $$;

create function public.block_user(p_target uuid) returns void language plpgsql security definer
set search_path = '' as $$
declare me uuid := (select auth.uid()); row_match record; cat text;
begin
  if me is null or p_target is null or me=p_target then raise exception 'Invalid request'; end if;
  -- Take category locks in a fixed order to serialize with simultaneous matches.
  foreach cat in array array['music','gaming','food','books','outdoors','film','fitness','art','tech'] loop
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:'||cat));
  end loop;
  insert into public.blocks(blocker,blocked) values(me,p_target) on conflict do nothing;
  delete from public.likes where (sender=me and target=p_target) or (sender=p_target and target=me);
  for row_match in select id from public.matches where ended_at is null and
     ((person_a=me and person_b=p_target) or (person_b=me and person_a=p_target)) loop
    update public.matches set ended_at=now() where id=row_match.id;
    update public.match_members set active=false where match_id=row_match.id;
  end loop;
end; $$;

create function public.report_user(p_target uuid,p_reason text) returns void language plpgsql security definer
set search_path = '' as $$
begin
  if (select auth.uid()) is null or p_target=(select auth.uid()) or char_length(trim(coalesce(p_reason,''))) not between 10 and 500 then raise exception 'Invalid report'; end if;
  if (select count(*) from public.reports where reporter=(select auth.uid()) and created_at>now()-interval '1 day')>=5 then raise exception 'Report limit reached'; end if;
  insert into public.reports(reporter,subject,reason) values((select auth.uid()),p_target,trim(p_reason));
end; $$;

-- PostgreSQL functions default to PUBLIC execute unless explicitly revoked.
revoke all on function public.is_blocked(uuid,uuid),public.end_match(uuid),public.send_hello(uuid,text,text),public.accept_mutual(uuid,text),public.withdraw_hello(uuid,text),public.pass_profile(uuid),public.send_message(uuid,text),public.block_user(uuid),public.report_user(uuid,text) from public,anon;
grant execute on function public.is_blocked(uuid,uuid),public.end_match(uuid),public.send_hello(uuid,text,text),public.accept_mutual(uuid,text),public.withdraw_hello(uuid,text),public.pass_profile(uuid),public.send_message(uuid,text),public.block_user(uuid),public.report_user(uuid,text) to authenticated;

-- Live chat subscriptions; PostgreSQL RLS still gates which messages can be read.
alter publication supabase_realtime add table public.messages;
