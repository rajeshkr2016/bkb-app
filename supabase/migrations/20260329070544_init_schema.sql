-- Enable PostGIS for location queries
create extension if not exists postgis with schema extensions;

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female', 'non-binary', 'other')),
  bio text default '',
  latitude double precision,
  longitude double precision,
  distance_pref integer default 50,
  age_min integer default 18,
  age_max integer default 50,
  gender_pref text default 'all' check (gender_pref in ('male', 'female', 'non-binary', 'all')),
  created_at timestamptz default now(),
  last_active timestamptz default now()
);

-- Photos
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz default now()
);

-- Interests
create table public.interests (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Profile-Interest junction
create table public.profile_interests (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  primary key (profile_id, interest_id)
);

-- Swipes
create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles(id) on delete cascade,
  swiped_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('like', 'pass')),
  created_at timestamptz default now(),
  unique (swiper_id, swiped_id)
);

-- Matches
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  matched_at timestamptz default now(),
  active boolean default true,
  unique (user_a, user_b)
);

-- Messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  sent_at timestamptz default now(),
  is_read boolean default false
);

-- Reports
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  created_at timestamptz default now()
);

-- Seed some interests
insert into public.interests (name) values
  ('Travel'), ('Music'), ('Fitness'), ('Cooking'), ('Reading'),
  ('Photography'), ('Movies'), ('Gaming'), ('Hiking'), ('Art'),
  ('Dancing'), ('Yoga'), ('Coffee'), ('Dogs'), ('Cats');

-- ============ Row Level Security ============

alter table public.profiles enable row level security;
alter table public.photos enable row level security;
alter table public.interests enable row level security;
alter table public.profile_interests enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "Users can create their own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Photos: anyone can read, only owner can manage
create policy "Photos are viewable by authenticated users"
  on public.photos for select to authenticated using (true);
create policy "Users can upload their own photos"
  on public.photos for insert to authenticated with check (profile_id = auth.uid());
create policy "Users can delete their own photos"
  on public.photos for delete to authenticated using (profile_id = auth.uid());

-- Interests: everyone can read
create policy "Interests are viewable by everyone"
  on public.interests for select to authenticated using (true);

-- Profile interests: anyone can read, owner can manage
create policy "Profile interests are viewable"
  on public.profile_interests for select to authenticated using (true);
create policy "Users can manage their own interests"
  on public.profile_interests for insert to authenticated with check (profile_id = auth.uid());
create policy "Users can remove their own interests"
  on public.profile_interests for delete to authenticated using (profile_id = auth.uid());

-- Swipes: only swiper can create and view their own
create policy "Users can create swipes"
  on public.swipes for insert to authenticated with check (swiper_id = auth.uid());
create policy "Users can view their own swipes"
  on public.swipes for select to authenticated using (swiper_id = auth.uid());

-- Matches: participants can view
create policy "Users can view their matches"
  on public.matches for select to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());

-- Messages: participants can read and send
create policy "Match participants can view messages"
  on public.messages for select to authenticated
  using (
    match_id in (
      select id from public.matches
      where user_a = auth.uid() or user_b = auth.uid()
    )
  );
create policy "Match participants can send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid() and
    match_id in (
      select id from public.matches
      where (user_a = auth.uid() or user_b = auth.uid()) and active = true
    )
  );

-- Reports: users can create their own
create policy "Users can create reports"
  on public.reports for insert to authenticated with check (reporter_id = auth.uid());

-- ============ Functions ============

-- Auto-create match when mutual like detected
create or replace function public.check_mutual_like()
returns trigger as $$
declare
  match_exists boolean;
begin
  if new.action = 'like' then
    select exists(
      select 1 from public.swipes
      where swiper_id = new.swiped_id
        and swiped_id = new.swiper_id
        and action = 'like'
    ) into match_exists;

    if match_exists then
      insert into public.matches (user_a, user_b)
      values (
        least(new.swiper_id, new.swiped_id),
        greatest(new.swiper_id, new.swiped_id)
      )
      on conflict do nothing;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_swipe_check_match
  after insert on public.swipes
  for each row execute function public.check_mutual_like();

-- Get discovery feed: profiles not yet swiped, within preferences
create or replace function public.get_discovery_feed(user_id uuid)
returns setof public.profiles as $$
  select p.* from public.profiles p
  where p.id != user_id
    and p.id not in (
      select swiped_id from public.swipes where swiper_id = user_id
    )
  order by p.last_active desc
  limit 20;
$$ language sql security definer;

-- Enable realtime for messages and matches
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.matches;
