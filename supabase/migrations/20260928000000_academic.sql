-- Academic discovery is opt-in. Existing personal profiles remain valid.
alter table public.profiles add column academic_category text;
alter table public.profiles add constraint academic_category_valid check (academic_category is null or academic_category in ('acad_year1_ai','acad_year1_ds','acad_year1_acc','acad_year1_cs','acad_year1_bus','acad_year1_cyber','acad_year2_ai','acad_year2_ds','acad_year2_acc','acad_year2_cs','acad_year2_bus','acad_year2_cyber','acad_year3_ai','acad_year3_ds','acad_year3_acc','acad_year3_cs','acad_year3_bus','acad_year3_cyber','acad_masters_mai','acad_masters_mcyber','acad_masters_mba'));
alter table public.likes drop constraint likes_category_check;
alter table public.likes add constraint likes_category_check check (category in ('music','gaming','food','books','outdoors','film','fitness','art','tech','acad_year1_ai','acad_year1_ds','acad_year1_acc','acad_year1_cs','acad_year1_bus','acad_year1_cyber','acad_year2_ai','acad_year2_ds','acad_year2_acc','acad_year2_cs','acad_year2_bus','acad_year2_cyber','acad_year3_ai','acad_year3_ds','acad_year3_acc','acad_year3_cs','acad_year3_bus','acad_year3_cyber','acad_masters_mai','acad_masters_mcyber','acad_masters_mba'));
alter table public.matches drop constraint matches_category_check;
alter table public.matches add constraint matches_category_check check (category in ('music','gaming','food','books','outdoors','film','fitness','art','tech','acad_year1_ai','acad_year1_ds','acad_year1_acc','acad_year1_cs','acad_year1_bus','acad_year1_cyber','acad_year2_ai','acad_year2_ds','acad_year2_acc','acad_year2_cs','acad_year2_bus','acad_year2_cyber','acad_year3_ai','acad_year3_ds','acad_year3_acc','acad_year3_cs','acad_year3_bus','acad_year3_cyber','acad_masters_mai','acad_masters_mcyber','acad_masters_mba'));

create or replace function public.send_hello(p_target uuid,p_category text,p_opener text default '') returns uuid
language plpgsql security definer set search_path = '' as $$
declare me uuid := (select auth.uid()); reciprocal public.likes%rowtype; new_match uuid;
begin
  if me is null then raise exception 'Sign in required'; end if;
  if p_target is null or me=p_target or p_category not in ('music','gaming','food','books','outdoors','film','fitness','art','tech','acad_year1_ai','acad_year1_ds','acad_year1_acc','acad_year1_cs','acad_year1_bus','acad_year1_cyber','acad_year2_ai','acad_year2_ds','acad_year2_acc','acad_year2_cs','acad_year2_bus','acad_year2_cyber','acad_year3_ai','acad_year3_ds','acad_year3_acc','acad_year3_cs','acad_year3_bus','acad_year3_cyber','acad_masters_mai','acad_masters_mcyber','acad_masters_mba')
     or char_length(coalesce(p_opener,''))>280 then raise exception 'Invalid request'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:user:'||me::text));
  -- Serialize match creation by category. The unique index is the final guard.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('compa:'||p_category));
  if not exists(select 1 from public.profiles where id=me)
     or not exists(select 1 from public.profiles where id=p_target and (primary_interest=p_category or academic_category=p_category))
        and not exists(select 1 from public.likes where sender=p_target and target=me
          and category=p_category and expires_at>now()) then
    raise exception 'Profile unavailable'; end if;
  if p_category like 'acad_%' and not exists(select 1 from public.profiles where id=me and academic_category=p_category) then raise exception 'Set this programme and year in your profile first'; end if;
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
  if me is null or p_target is null or p_category not in ('music','gaming','food','books','outdoors','film','fitness','art','tech','acad_year1_ai','acad_year1_ds','acad_year1_acc','acad_year1_cs','acad_year1_bus','acad_year1_cyber','acad_year2_ai','acad_year2_ds','acad_year2_acc','acad_year2_cs','acad_year2_bus','acad_year2_cyber','acad_year3_ai','acad_year3_ds','acad_year3_acc','acad_year3_cs','acad_year3_bus','acad_year3_cyber','acad_masters_mai','acad_masters_mcyber','acad_masters_mba') then raise exception 'Invalid request'; end if;
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


create or replace function public.block_user(p_target uuid) returns void language plpgsql security definer
set search_path = '' as $$
declare me uuid := (select auth.uid()); row_match record; cat text;
begin
  if me is null or p_target is null or me=p_target then raise exception 'Invalid request'; end if;
  -- Take category locks in a fixed order to serialize with simultaneous matches.
  foreach cat in array array['music','gaming','food','books','outdoors','film','fitness','art','tech','acad_year1_ai','acad_year1_ds','acad_year1_acc','acad_year1_cs','acad_year1_bus','acad_year1_cyber','acad_year2_ai','acad_year2_ds','acad_year2_acc','acad_year2_cs','acad_year2_bus','acad_year2_cyber','acad_year3_ai','acad_year3_ds','acad_year3_acc','acad_year3_cs','acad_year3_bus','acad_year3_cyber','acad_masters_mai','acad_masters_mcyber','acad_masters_mba'] loop
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

