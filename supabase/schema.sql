create extension if not exists pgcrypto;

create table if not exists public.staff_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text not null,
  role text not null check (role in ('support', 'admin')),
  password_hash text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  status text not null default 'open',
  handoff_requested boolean not null default false,
  staff_typing boolean not null default false,
  staff_typing_updated_at timestamptz,
  closed_at timestamptz,
  closed_by text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.support_conversations
add column if not exists staff_typing boolean not null default false;

alter table public.support_conversations
add column if not exists staff_typing_updated_at timestamptz;

alter table public.support_conversations
add column if not exists closed_at timestamptz;

alter table public.support_conversations
add column if not exists closed_by text;

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  client_id text,
  role text not null check (role in ('user', 'assistant', 'system', 'support')),
  text text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.support_messages
add column if not exists client_id text;

create table if not exists public.site_content (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reservation_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  reservation_date text not null,
  guests text not null,
  notes text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.reservation_requests
add column if not exists notes text not null default '';

alter table public.reservation_requests
add column if not exists status text not null default 'new';

alter table public.reservation_requests
add column if not exists updated_at timestamptz not null default timezone('utc', now());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view site media'
  ) then
    create policy "Public can view site media"
    on storage.objects
    for select
    to public
    using (bucket_id = 'site-media');
  end if;
end $$;

create index if not exists idx_staff_users_email on public.staff_users(email);
create index if not exists idx_support_conversations_updated_at on public.support_conversations(updated_at desc);
create index if not exists idx_support_messages_conversation_id on public.support_messages(conversation_id, created_at);
create index if not exists idx_reservation_requests_created_at on public.reservation_requests(created_at desc);
create unique index if not exists idx_support_messages_conversation_client_id
on public.support_messages(conversation_id, client_id)
where client_id is not null;

-- Example workflow:
-- 1. Run this schema in the Supabase SQL editor.
-- 2. Generate password hashes locally:
--    npm run hash-password -- YourStrongPassword
-- 3. Insert staff accounts:
--    insert into public.staff_users (email, display_name, role, password_hash)
--    values
--      ('support@your-restaurant.com', 'Support Desk', 'support', 's2:replace-with-generated-hash'),
--      ('admin@your-restaurant.com', 'Admin Desk', 'admin', 's2:replace-with-generated-hash');
--
-- Site content is created automatically on first load in the site_content table.
-- Uploaded images will be stored in the public `site-media` storage bucket.
