-- Additive hardening; apply after all earlier migrations. Do not edit applied history.
begin;
-- Prevent clients creating objects that could shadow trusted database objects.
revoke create on schema public from public, anon, authenticated;
-- Only allow client-controlled profile columns; timestamps and ownership are immutable.
revoke insert, update on public.profiles from authenticated;
grant insert(id,name,area,primary_interest,secondary_interest,academic_category,answers,theme,art),
 update(name,area,primary_interest,secondary_interest,academic_category,answers,theme,art)
 on public.profiles to authenticated;

create function public.valid_profile_answers(value jsonb) returns boolean
language sql immutable set search_path = '' as $$
 select case when jsonb_typeof(value) <> 'array' then false
 else jsonb_array_length(value)=3 and not exists (
 select 1 from jsonb_array_elements(value) a where jsonb_typeof(a)<>'string'
 or char_length(btrim(a #>> '{}')) not between 1 and 80) end;
$$;
revoke all on function public.valid_profile_answers(jsonb) from public,anon;
grant execute on function public.valid_profile_answers(jsonb) to authenticated;
-- NOT VALID preserves existing rows but enforces all future inserts/updates.
-- Validate after the operator has repaired any legacy malformed answers.
alter table public.profiles add constraint profile_answer_strings
 check (public.valid_profile_answers(answers)) not valid;
-- The old byte cap rejects valid 3x80-character Unicode answers. Retain a bounded cap.
alter table public.profiles drop constraint answers_valid;
alter table public.profiles add constraint answers_valid check (
 jsonb_typeof(answers)='array' and jsonb_array_length(answers)=3 and octet_length(answers::text)<=2048);

-- Blocking revokes server-side history reads as well as future contact.
alter policy messages_read on public.messages using (
 exists(select 1 from public.matches m where m.id=messages.match_id
 and (m.person_a=(select auth.uid()) or m.person_b=(select auth.uid()))
 and not public.is_blocked((select auth.uid()),
 case when m.person_a=(select auth.uid()) then m.person_b else m.person_a end)));
create index messages_sender_created_idx on public.messages(sender,created_at);
create index reports_reporter_created_idx on public.reports(reporter,created_at);
create index blocks_blocked_idx on public.blocks(blocked,blocker);

create or replace function public.send_hello(p_target uuid,p_category text,p_opener text default '') returns uuid
language plpgsql security definer set search_path = '' as $$
declare me uuid := (select auth.uid()); reciprocal public.likes%rowtype; new_match uuid;
begin
  if me is null then raise exception 'Sign in required'; end if;
  if p_target is null or me=p_target or p_category is null or p_category not in ('music','gaming','food','books','outdoors','film','fitness','art','tech','acad_year1_ai','acad_year1_ds','acad_year1_acc','acad_year1_cs','acad_year1_bus','acad_year1_cyber','acad_year2_ai','acad_year2_ds','acad_year2_acc','acad_year2_cs','acad_year2_bus','acad_year2_cyber','acad_year3_ai','acad_year3_ds','acad_year3_acc','acad_year3_cs','acad_year3_bus','acad_year3_cyber','acad_masters_mai','acad_masters_mcyber','acad_masters_mba')
     or char_length(coalesce(p_opener,''))>280 then raise exception 'Invalid request'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:user:'||me::text));
  -- Serialize match creation by category. The unique index is the final guard.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:'||p_category));
  if not exists(select 1 from public.profiles where id=me)
     or not exists(select 1 from public.profiles where id=p_target and (primary_interest=p_category or academic_category=p_category))
        and not exists(select 1 from public.likes where sender=p_target and target=me
          and category=p_category and expires_at>now()) then
    raise exception 'Profile unavailable'; end if;
  if p_category like 'acad_%' and (select count(*) from public.profiles where id in (me,p_target) and academic_category=p_category)<>2 then raise exception 'Both profiles must list this programme and year'; end if;
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

create or replace function public.accept_mutual(p_target uuid,p_category text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare me uuid := (select auth.uid()); first_like public.likes%rowtype; second_like public.likes%rowtype; new_match uuid;
begin
  if me is null or p_target is null or p_category is null or p_category not in ('music','gaming','food','books','outdoors','film','fitness','art','tech','acad_year1_ai','acad_year1_ds','acad_year1_acc','acad_year1_cs','acad_year1_bus','acad_year1_cyber','acad_year2_ai','acad_year2_ds','acad_year2_acc','acad_year2_cs','acad_year2_bus','acad_year2_cyber','acad_year3_ai','acad_year3_ds','acad_year3_acc','acad_year3_cs','acad_year3_bus','acad_year3_cyber','acad_masters_mai','acad_masters_mcyber','acad_masters_mba') then raise exception 'Invalid request'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:'||p_category));
  if exists(select 1 from public.blocks where (blocker=me and blocked=p_target) or (blocker=p_target and blocked=me)) then raise exception 'Connection unavailable'; end if;
  if p_category like 'acad_%' and (select count(*) from public.profiles where id in (me,p_target) and academic_category=p_category)<>2 then raise exception 'Both profiles must list this programme and year'; end if;
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

create or replace function public.send_message(p_match uuid,p_body text) returns bigint language plpgsql security definer
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
  if exists(select 1 from public.matches m join public.blocks b on
 ((b.blocker=m.person_a and b.blocked=m.person_b) or (b.blocker=m.person_b and b.blocked=m.person_a)) where m.id=p_match) then raise exception 'Chat unavailable'; end if;
  if (select count(*) from public.messages where sender=me and created_at>now()-interval '1 minute')>=20 then
    raise exception 'Slow down before sending more messages'; end if;
  insert into public.messages(match_id,sender,body) values(p_match,me,trim(p_body)) returning id into new_id;
  return new_id;
end; $$;

create or replace function public.report_user(p_target uuid,p_reason text) returns void language plpgsql security definer
set search_path = '' as $$
begin
  if (select auth.uid()) is null or p_target is null or p_target=(select auth.uid()) or char_length(trim(coalesce(p_reason,''))) not between 10 and 500 then raise exception 'Invalid report'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:report:'||(select auth.uid())::text));
  if (select count(*) from public.reports where reporter=(select auth.uid()) and created_at>now()-interval '1 day')>=5 then raise exception 'Report limit reached'; end if;
  insert into public.reports(reporter,subject,reason) values((select auth.uid()),p_target,trim(p_reason));
end; $$;

create or replace function public.pass_profile(p_target uuid) returns void language plpgsql security definer
set search_path = '' as $$
begin
  if (select auth.uid()) is null or p_target is null or p_target=(select auth.uid()) then raise exception 'Invalid request'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:pass:'||(select auth.uid())::text));
  if (select count(*) from public.passes where viewer=(select auth.uid()))>=5000 then raise exception 'Pass limit reached'; end if;
  insert into public.passes(viewer,target) values((select auth.uid()),p_target) on conflict do nothing;
end; $$;

-- Self-only deletion, serialized against matching and blocking in the same lock order.
-- Does not claim to erase backups or existing JWTs; profiles are required to send hellos.
create function public.delete_my_account() returns void language plpgsql security definer
set search_path = '' as $$
declare me uuid := (select auth.uid()); cat text;
begin
 if me is null then raise exception 'Sign in required'; end if;
 foreach cat in array array['music','gaming','food','books','outdoors','film','fitness','art','tech','acad_year1_ai','acad_year1_ds','acad_year1_acc','acad_year1_cs','acad_year1_bus','acad_year1_cyber','acad_year2_ai','acad_year2_ds','acad_year2_acc','acad_year2_cs','acad_year2_bus','acad_year2_cyber','acad_year3_ai','acad_year3_ds','acad_year3_acc','acad_year3_cs','acad_year3_bus','acad_year3_cyber','acad_masters_mai','acad_masters_mcyber','acad_masters_mba'] loop
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:'||cat));
 end loop;
 delete from auth.users where id=me;
end; $$;
revoke all on function public.delete_my_account() from public,anon;
grant execute on function public.delete_my_account() to authenticated;
commit;
