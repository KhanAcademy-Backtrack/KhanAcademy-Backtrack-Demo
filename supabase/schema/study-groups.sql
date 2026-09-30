-- Dedicated free project. Private data is reachable only through the authenticated Edge handler.
create schema if not exists khanpanion;
revoke all on schema khanpanion from public, anon, authenticated;
grant usage on schema khanpanion to service_role;

create table khanpanion.devices (
 token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now()
);
create table khanpanion.groups (
 id uuid primary key default gen_random_uuid(), code text unique not null check (code ~ '^[A-Z0-9]{6}$'),
 name text not null check (length(name) between 1 and 60), goal int not null check (goal between 1 and 7),
 owner_hash text not null references khanpanion.devices(token_hash), created_at timestamptz not null default now()
);
create index groups_owner on khanpanion.groups(owner_hash);
create table khanpanion.members (
 id uuid primary key default gen_random_uuid(), group_id uuid not null references khanpanion.groups(id),
 device_hash text not null references khanpanion.devices(token_hash),
 nickname text not null check (length(nickname) between 1 and 32), active boolean not null default true,
 joined_at timestamptz not null default now(), unique(group_id,device_hash)
);
create index members_device on khanpanion.members(device_hash);
create unique index members_active_nickname on khanpanion.members(group_id,lower(nickname)) where active;
create table khanpanion.checkins (
 member_id uuid not null references khanpanion.members(id), week date not null,
 study_days int check (study_days between 0 and 7), missions int check (missions between 0 and 7),
 mock_correct int check (mock_correct between 0 and 400), mock_total int check (mock_total between 1 and 400),
 posted_at timestamptz not null default now(), primary key(member_id,week),
 check ((mock_correct is null and mock_total is null) or (mock_correct is not null and mock_total is not null and mock_correct<=mock_total))
);
create table khanpanion.rate_limits (key text primary key, since timestamptz not null default now(), hits int not null default 1);
alter table khanpanion.devices enable row level security;
alter table khanpanion.groups enable row level security;
alter table khanpanion.members enable row level security;
alter table khanpanion.checkins enable row level security;
alter table khanpanion.rate_limits enable row level security;
revoke all on all tables in schema khanpanion from public, anon, authenticated;
grant select,insert,update on all tables in schema khanpanion to service_role;

create function public.khanpanion_group_api(p_action text,p_device text,p_ip text,p_payload jsonb default '{}')
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 g khanpanion.groups%rowtype; me khanpanion.members%rowtype; nickname_value text; group_name text;
 wanted_code text; goal_value int; count_value int; limit_value int; rate_key text;
 current_week date := (now() at time zone 'Asia/Manila')::date - (extract(isodow from now() at time zone 'Asia/Manila')::int-1);
 result_members jsonb; sd int; md int; mc int; mt int;
begin
 if p_device !~ '^[a-f0-9]{64}$' or p_ip !~ '^[a-f0-9]{64}$' then return jsonb_build_object('error','Invalid device session.','status',401); end if;
 if p_action not in ('session','create','join','snapshot','checkin','rename','goal','leave') then return jsonb_build_object('error','Unknown group action.','status',400); end if;
 limit_value := case p_action when 'snapshot' then 600 when 'session' then 80 when 'create' then 10 else 120 end;
 rate_key := p_ip||':'||p_action;
 insert into khanpanion.rate_limits(key) values(rate_key) on conflict(key) do update set
  hits=case when khanpanion.rate_limits.since<now()-interval '1 minute' then 1 else khanpanion.rate_limits.hits+1 end,
  since=case when khanpanion.rate_limits.since<now()-interval '1 minute' then now() else khanpanion.rate_limits.since end returning hits into count_value;
 if count_value>limit_value then return jsonb_build_object('error','Too many requests. Try again in a minute.','status',429); end if;
 if p_action='session' then
  insert into khanpanion.devices(token_hash) values(p_device) on conflict do nothing;
  return jsonb_build_object('ok',true);
 end if;
 perform 1 from khanpanion.devices where token_hash=p_device for no key update;
 if not found then return jsonb_build_object('error','This device session could not be opened. Reconnect your device.','status',401); end if;
 rate_key := p_device||':'||case when p_action='snapshot' then 'read' else 'write' end;
 insert into khanpanion.rate_limits(key) values(rate_key) on conflict(key) do update set
  hits=case when khanpanion.rate_limits.since<now()-interval '1 minute' then 1 else khanpanion.rate_limits.hits+1 end,
  since=case when khanpanion.rate_limits.since<now()-interval '1 minute' then now() else khanpanion.rate_limits.since end returning hits into count_value;
 if count_value>(case when p_action='snapshot' then 60 else 20 end) then return jsonb_build_object('error','Too many requests. Try again in a minute.','status',429); end if;
 wanted_code := upper(btrim(coalesce(p_payload->>'code','')));
 if wanted_code !~ '^[A-Z0-9]{6}$' then return jsonb_build_object('error','Enter the six-character group code.','status',400); end if;
 nickname_value := btrim(coalesce(p_payload->>'nickname',''));
 if p_action in ('create','join','rename') and (length(nickname_value)<1 or length(nickname_value)>32) then return jsonb_build_object('error','Choose a nickname of up to 32 characters.','status',400); end if;
 if p_action in ('create','goal') then
  if coalesce(p_payload->>'goal','') !~ '^[1-7]$' then return jsonb_build_object('error','Choose 1 to 7 study days a week.','status',400); end if;
  goal_value := (p_payload->>'goal')::int;
 end if;
 if p_action='create' then
  group_name := btrim(coalesce(p_payload->>'name',''));
  if length(group_name)<1 or length(group_name)>60 then return jsonb_build_object('error','Give your group a name of up to 60 characters.','status',400); end if;
  select * into g from khanpanion.groups where code=wanted_code for update;
  if found then
   if g.owner_hash<>p_device then return jsonb_build_object('error','Please try creating the group again.','status',409); end if;
  else
   if (select count(*) from khanpanion.groups q join khanpanion.members m on m.group_id=q.id and m.device_hash=p_device and m.active where q.owner_hash=p_device)>=5 then return jsonb_build_object('error','This device already leads five groups.','status',400); end if;
   insert into khanpanion.groups(code,name,goal,owner_hash) values(wanted_code,group_name,goal_value,p_device) returning * into g;
  end if;
 else
  select * into g from khanpanion.groups where code=wanted_code for update;
  if not found then return jsonb_build_object('error','No group has that code. Check it with your friend.','status',404); end if;
 end if;
 if p_action in ('create','join') then
  if exists(select 1 from khanpanion.members m where m.group_id=g.id and m.active and lower(m.nickname)=lower(nickname_value) and m.device_hash<>p_device) then return jsonb_build_object('error','That nickname is already in this group. Choose another.','status',400); end if;
  if (select count(*) from khanpanion.members where group_id=g.id and active)>=30 and not exists(select 1 from khanpanion.members where group_id=g.id and device_hash=p_device and active) then return jsonb_build_object('error','This group already has 30 members.','status',400); end if;
  insert into khanpanion.members(group_id,device_hash,nickname) values(g.id,p_device,nickname_value) on conflict(group_id,device_hash) do update set active=true,nickname=excluded.nickname returning * into me;
  if not exists(select 1 from khanpanion.members where group_id=g.id and device_hash=g.owner_hash and active) then update khanpanion.groups set owner_hash=p_device where id=g.id returning * into g; end if;
 else
  select * into me from khanpanion.members where group_id=g.id and device_hash=p_device and active;
  if not found then
   if p_action='leave' and exists(select 1 from khanpanion.members where group_id=g.id and device_hash=p_device) then return jsonb_build_object('ok',true); end if;
   return jsonb_build_object('error','Join this group on your device before opening it.','status',403);
  end if;
 end if;
 if p_action='goal' then
  if g.owner_hash<>p_device then return jsonb_build_object('error','Only the group leader can change the shared goal.','status',403); end if;
  update khanpanion.groups set goal=goal_value where id=g.id returning * into g;
 elsif p_action='rename' then
  if exists(select 1 from khanpanion.members m where m.group_id=g.id and m.active and lower(m.nickname)=lower(nickname_value) and m.device_hash<>p_device) then return jsonb_build_object('error','That nickname is already in this group. Choose another.','status',400); end if;
  update khanpanion.members set nickname=btrim(p_payload->>'nickname') where id=me.id;
 elsif p_action='checkin' then
  sd := (p_payload->>'studyDays')::int; md := (p_payload->>'missions')::int; mc := (p_payload->>'mockCorrect')::int; mt := (p_payload->>'mockTotal')::int;
  if (sd is not null and sd not between 0 and 7) or (md is not null and md not between 0 and 7) or (mc is null)<>(mt is null) or (mc is not null and (mt not between 1 and 400 or mc not between 0 and mt)) then return jsonb_build_object('error','This check-in could not be read.','status',400); end if;
  if sd is null and md is null and mc is null then return jsonb_build_object('error','Choose at least one thing to share.','status',400); end if;
  insert into khanpanion.checkins(member_id,week,study_days,missions,mock_correct,mock_total) values(me.id,current_week,sd,md,mc,mt)
  on conflict(member_id,week) do update set study_days=excluded.study_days,missions=excluded.missions,mock_correct=excluded.mock_correct,mock_total=excluded.mock_total,posted_at=now();
 elsif p_action='leave' then
  update khanpanion.members set active=false where id=me.id;
  if g.owner_hash=p_device then update khanpanion.groups set owner_hash=coalesce((select device_hash from khanpanion.members where group_id=g.id and active order by joined_at limit 1),p_device) where id=g.id; end if;
  return jsonb_build_object('ok',true);
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'nickname',m.nickname,'isMe',m.device_hash=p_device,'isOwner',m.device_hash=g.owner_hash,'joinedAt',m.joined_at,
  'checkin',case when c.member_id is null then null else jsonb_build_object('studyDays',c.study_days,'missions',c.missions,'mockCorrect',c.mock_correct,'mockTotal',c.mock_total,'postedAt',c.posted_at) end) order by m.joined_at),'[]') into result_members
 from khanpanion.members m left join khanpanion.checkins c on c.member_id=m.id and c.week=current_week where m.group_id=g.id and m.active;
 return jsonb_build_object('ok',true,'group',jsonb_build_object('id',g.id,'code',g.code,'name',g.name,'goal',g.goal,'isOwner',g.owner_hash=p_device),'weekStart',current_week,'members',result_members);
end;
$$;
revoke all on function public.khanpanion_group_api(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.khanpanion_group_api(text,text,text,jsonb) to service_role;
