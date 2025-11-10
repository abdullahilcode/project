-- Enable row level security
alter table if exists "public"."User" enable row level security;
alter table if exists "public"."Memory" enable row level security;
alter table if exists "public"."MemoryEdge" enable row level security;

-- User table policies (mirror auth users table)
drop policy if exists "Users can select their profile" on "public"."User";
create policy "Users can select their profile"
  on "public"."User"
  for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their profile" on "public"."User";
create policy "Users can insert their profile"
  on "public"."User"
  for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their profile" on "public"."User";
create policy "Users can update their profile"
  on "public"."User"
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Memory table policies
drop policy if exists "Users can read their memories" on "public"."Memory";
create policy "Users can read their memories"
  on "public"."Memory"
  for select
  using (auth.uid() = "userId");

drop policy if exists "Users can insert their memories" on "public"."Memory";
create policy "Users can insert their memories"
  on "public"."Memory"
  for insert
  with check (auth.uid() = "userId");

drop policy if exists "Users can update their memories" on "public"."Memory";
create policy "Users can update their memories"
  on "public"."Memory"
  for update
  using (auth.uid() = "userId")
  with check (auth.uid() = "userId");

drop policy if exists "Users can delete their memories" on "public"."Memory";
create policy "Users can delete their memories"
  on "public"."Memory"
  for delete
  using (auth.uid() = "userId");

-- MemoryEdge table policies
drop policy if exists "Users can read their memory edges" on "public"."MemoryEdge";
create policy "Users can read their memory edges"
  on "public"."MemoryEdge"
  for select
  using (auth.uid() = "userId");

drop policy if exists "Users can insert their memory edges" on "public"."MemoryEdge";
create policy "Users can insert their memory edges"
  on "public"."MemoryEdge"
  for insert
  with check (auth.uid() = "userId");

drop policy if exists "Users can update their memory edges" on "public"."MemoryEdge";
create policy "Users can update their memory edges"
  on "public"."MemoryEdge"
  for update
  using (auth.uid() = "userId")
  with check (auth.uid() = "userId");

drop policy if exists "Users can delete their memory edges" on "public"."MemoryEdge";
create policy "Users can delete their memory edges"
  on "public"."MemoryEdge"
  for delete
  using (auth.uid() = "userId");
