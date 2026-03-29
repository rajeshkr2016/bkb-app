-- Create test users in auth.users (local dev only)
-- Test password is stored in .env.local (not committed to git)
-- The hash below is a bcrypt hash - no plaintext password in this file

insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'alice@test.com', '$2a$06$Rb9bpAJKWcfgwucid4wRu.cxoVR6Kv41IC8KaHoX7W4Jru6ECclIe', now(), now(), now(), 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'bob@test.com', '$2a$06$Rb9bpAJKWcfgwucid4wRu.cxoVR6Kv41IC8KaHoX7W4Jru6ECclIe', now(), now(), now(), 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'charlie@test.com', '$2a$06$Rb9bpAJKWcfgwucid4wRu.cxoVR6Kv41IC8KaHoX7W4Jru6ECclIe', now(), now(), now(), 'authenticated', 'authenticated'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'dana@test.com', '$2a$06$Rb9bpAJKWcfgwucid4wRu.cxoVR6Kv41IC8KaHoX7W4Jru6ECclIe', now(), now(), now(), 'authenticated', 'authenticated'),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'eve@test.com', '$2a$06$Rb9bpAJKWcfgwucid4wRu.cxoVR6Kv41IC8KaHoX7W4Jru6ECclIe', now(), now(), now(), 'authenticated', 'authenticated')
on conflict (id) do nothing;

-- Insert auth identities (required by Supabase auth)
insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'email', '{"sub":"11111111-1111-1111-1111-111111111111","email":"alice@test.com"}', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'email', '{"sub":"22222222-2222-2222-2222-222222222222","email":"bob@test.com"}', now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'email', '{"sub":"33333333-3333-3333-3333-333333333333","email":"charlie@test.com"}', now(), now(), now()),
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'email', '{"sub":"44444444-4444-4444-4444-444444444444","email":"dana@test.com"}', now(), now(), now()),
  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'email', '{"sub":"55555555-5555-5555-5555-555555555555","email":"eve@test.com"}', now(), now(), now())
on conflict do nothing;

-- Create profiles
insert into public.profiles (id, name, date_of_birth, gender, bio, gender_pref) values
  ('11111111-1111-1111-1111-111111111111', 'Alice', '1995-03-15', 'female', 'Love hiking and coffee', 'male'),
  ('22222222-2222-2222-2222-222222222222', 'Bob', '1993-07-22', 'male', 'Software engineer who loves to cook', 'female'),
  ('33333333-3333-3333-3333-333333333333', 'Charlie', '1998-11-08', 'male', 'Music lover and travel enthusiast', 'all'),
  ('44444444-4444-4444-4444-444444444444', 'Dana', '1996-01-30', 'female', 'Yoga instructor and dog mom', 'male'),
  ('55555555-5555-5555-5555-555555555555', 'Eve', '1997-09-12', 'non-binary', 'Artist and photographer', 'all')
on conflict (id) do nothing;
