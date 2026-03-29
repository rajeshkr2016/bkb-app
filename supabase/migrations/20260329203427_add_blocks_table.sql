-- Blocks table
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (blocker_id, blocked_id)
);

alter table public.blocks enable row level security;

create policy "Users can block others"
  on public.blocks for insert to authenticated with check (blocker_id = auth.uid());
create policy "Users can view their own blocks"
  on public.blocks for select to authenticated using (blocker_id = auth.uid());
create policy "Users can unblock"
  on public.blocks for delete to authenticated using (blocker_id = auth.uid());

-- Exclude blocked users from discovery feed
create or replace function public.get_discovery_feed(user_id uuid)
returns setof public.profiles as $$
  select p.* from public.profiles p
  where p.id != user_id
    and p.id not in (
      select swiped_id from public.swipes where swiper_id = user_id
    )
    and p.id not in (
      select blocked_id from public.blocks where blocker_id = user_id
    )
    and p.id not in (
      select blocker_id from public.blocks where blocked_id = user_id
    )
  order by p.last_active desc
  limit 20;
$$ language sql security definer;
