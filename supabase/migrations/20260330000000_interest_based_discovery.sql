-- Drop old function (return type changed)
drop function if exists public.get_discovery_feed(uuid);

-- Update discovery feed to prioritize profiles with shared interests
create or replace function public.get_discovery_feed(user_id uuid)
returns table (
  id uuid,
  name text,
  date_of_birth date,
  gender text,
  bio text,
  latitude double precision,
  longitude double precision,
  distance_pref integer,
  age_min integer,
  age_max integer,
  gender_pref text,
  created_at timestamptz,
  last_active timestamptz,
  shared_interests bigint
) as $$
  select
    p.id, p.name, p.date_of_birth, p.gender, p.bio,
    p.latitude, p.longitude, p.distance_pref,
    p.age_min, p.age_max, p.gender_pref,
    p.created_at, p.last_active,
    count(mpi.interest_id) as shared_interests
  from public.profiles p
  left join public.profile_interests mpi
    on mpi.profile_id = p.id
    and mpi.interest_id in (
      select interest_id from public.profile_interests where profile_id = user_id
    )
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
  group by p.id
  order by shared_interests desc, p.last_active desc
  limit 20;
$$ language sql security definer;
