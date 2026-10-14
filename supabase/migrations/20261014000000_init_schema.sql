-- Migration: 20261014000000_init_schema.sql
-- Description: Initial schema for Secret Santa Organizer (Profiles, Events, Participants, Restrictions, Assignments, Wishlists, Emails, Payments)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  stripe_subscription_status text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Events
do $$ begin
  create type event_status as enum ('draft', 'drawn', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  budget_amount numeric(10, 2),
  budget_currency varchar(3) default 'USD' not null,
  exchange_date timestamp with time zone,
  location text,
  status event_status default 'draft' not null,
  allow_wishlists boolean default true not null,
  is_premium boolean default false not null,
  drawn_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Participants
create table if not exists public.participants (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  invite_token uuid default uuid_generate_v4() not null unique,
  has_viewed_assignment boolean default false not null,
  viewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, email)
);

-- 4. Pair Restrictions
create table if not exists public.pair_restrictions (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  giver_participant_id uuid references public.participants(id) on delete cascade not null,
  restricted_receiver_participant_id uuid references public.participants(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(giver_participant_id, restricted_receiver_participant_id),
  check (giver_participant_id <> restricted_receiver_participant_id)
);

-- 5. Assignments
create table if not exists public.assignments (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  giver_id uuid references public.participants(id) on delete cascade not null unique,
  receiver_id uuid references public.participants(id) on delete cascade not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (giver_id <> receiver_id)
);

-- 6. Wishlists
create table if not exists public.wishlists (
  id uuid default uuid_generate_v4() primary key,
  participant_id uuid references public.participants(id) on delete cascade not null unique,
  notes text,
  clothing_sizes jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Wishlist Items
create table if not exists public.wishlist_items (
  id uuid default uuid_generate_v4() primary key,
  wishlist_id uuid references public.wishlists(id) on delete cascade not null,
  title text not null,
  url text,
  estimated_price numeric(10, 2),
  priority int default 1 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Email Delivery Logs
do $$ begin
  create type email_type as enum ('assignment_reveal', 'reminder', 'wishlist_updated');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type email_status as enum ('queued', 'sent', 'delivered', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.email_logs (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  participant_id uuid references public.participants(id) on delete cascade not null,
  resend_email_id text,
  type email_type not null,
  status email_status default 'queued' not null,
  error_message text,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Stripe Payments
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete set null,
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  amount_cents int not null,
  currency varchar(3) default 'USD' not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists idx_events_organizer on public.events(organizer_id);
create index if not exists idx_participants_event on public.participants(event_id);
create index if not exists idx_participants_token on public.participants(invite_token);
create index if not exists idx_participants_email on public.participants(email);
create index if not exists idx_assignments_event on public.assignments(event_id);
create index if not exists idx_assignments_giver on public.assignments(giver_id);
create index if not exists idx_assignments_receiver on public.assignments(receiver_id);
create index if not exists idx_pair_restrictions_event on public.pair_restrictions(event_id);
create index if not exists idx_wishlist_items_wishlist on public.wishlist_items(wishlist_id);
create index if not exists idx_email_logs_event on public.email_logs(event_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.participants enable row level security;
alter table public.pair_restrictions enable row level security;
alter table public.assignments enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.email_logs enable row level security;
alter table public.payments enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Organizers can view own events" on public.events for select using (auth.uid() = organizer_id);
create policy "Organizers can insert own events" on public.events for insert with check (auth.uid() = organizer_id);
create policy "Organizers can update own events" on public.events for update using (auth.uid() = organizer_id);
create policy "Organizers can delete own events" on public.events for delete using (auth.uid() = organizer_id);

create policy "Organizers can manage participants" on public.participants for all using (
  exists (select 1 from public.events where events.id = participants.event_id and events.organizer_id = auth.uid())
);
create policy "Public can view participant with valid invite token" on public.participants for select using (true);

create policy "Organizers can manage restrictions" on public.pair_restrictions for all using (
  exists (select 1 from public.events where events.id = pair_restrictions.event_id and events.organizer_id = auth.uid())
);

create policy "No direct public read on all assignments" on public.assignments for select using (false);

create policy "Public can view wishlist by participant" on public.wishlists for select using (true);
create policy "Participants can update own wishlist" on public.wishlists for all using (true);
create policy "Public can view wishlist items" on public.wishlist_items for select using (true);
create policy "Public can manage wishlist items" on public.wishlist_items for all using (true);

create policy "Organizers can view email logs" on public.email_logs for select using (
  exists (select 1 from public.events where events.id = email_logs.event_id and events.organizer_id = auth.uid())
);

create policy "Users can view own payments" on public.payments for select using (auth.uid() = profile_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
