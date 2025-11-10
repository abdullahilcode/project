-- Enable row level security
alter table if exists public."User" enable row level security;
alter table if exists public."Memory" enable row level security;
alter table if exists public."MemoryEdge" enable row level security;
alter table if exists public."Tag" enable row level security;
alter table if exists public."MemoryTag" enable row level security;

-- Helper: current user id
create or replace function public.auth_uid() returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    '00000000-0000-0000-0000-000000000000'
  )::uuid;
$$;

-- Mirror auth.users → public.User
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public."User"(id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- USER table policies
drop policy if exists user_select on public."User";
create policy user_select on public."User"
for select using (id = public.auth_uid());

drop policy if exists user_update on public."User";
create policy user_update on public."User"
for update using (id = public.auth_uid());

-- MEMORY policies
drop policy if exists memory_rw on public."Memory";
create policy memory_rw on public."Memory"
for all using ("userId" = public.auth_uid())
with check ("userId" = public.auth_uid());

-- MEMORY EDGE policies
drop policy if exists edge_rw on public."MemoryEdge";
create policy edge_rw on public."MemoryEdge"
for all using ("userId" = public.auth_uid())
with check ("userId" = public.auth_uid());

-- TAG policies
drop policy if exists tag_rw on public."Tag";
create policy tag_rw on public."Tag"
for all using ("userId" = public.auth_uid())
with check ("userId" = public.auth_uid());

-- MEMORY TAG policies
drop policy if exists memorytag_rw on public."MemoryTag";
create policy memorytag_rw on public."MemoryTag"
for all using (
  exists (
    select 1
    from public."Memory" m
    where m.id = "memoryId"
      and m."userId" = public.auth_uid()
  )
  and exists (
    select 1
    from public."Tag" t
    where t.id = "tagId"
      and t."userId" = public.auth_uid()
  )
)
with check (
  exists (
    select 1
    from public."Memory" m
    where m.id = "memoryId"
      and m."userId" = public.auth_uid()
  )
  and exists (
    select 1
    from public."Tag" t
    where t.id = "tagId"
      and t."userId" = public.auth_uid()
  )
);
