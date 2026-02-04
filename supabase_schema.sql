-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Public user data)
-- Links to auth.users but holds public info like username
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. COMMUNITIES (Subreddits)
create table public.communities (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null, -- e.g. "democracy_now"
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  creator_id uuid references public.profiles(id)
);

-- 3. COMMUNITY MEMBERS (Who joined what)
create table public.community_members (
  community_id uuid references public.communities(id) not null,
  user_id uuid references public.profiles(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (community_id, user_id)
);

-- 4. POSTS
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  community_id uuid references public.communities(id) not null,
  author_id uuid references public.profiles(id) not null,
  title text not null,
  body text,
  image_url text,
  upvotes int default 0,
  downvotes int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ELECTIONS (The core feature)
create table public.elections (
  id uuid default uuid_generate_v4() primary key,
  community_id uuid references public.communities(id) not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  status text default 'active', -- 'active', 'completed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. CANDIDATES (Users running for mod)
create table public.candidates (
  id uuid default uuid_generate_v4() primary key,
  election_id uuid references public.elections(id) not null,
  user_id uuid references public.profiles(id) not null,
  manifesto text, -- "Why I should be mod"
  vote_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(election_id, user_id)
);

-- 7. VOTES (For candidates)
create table public.election_votes (
  election_id uuid references public.elections(id) not null,
  voter_id uuid references public.profiles(id) not null,
  candidate_id uuid references public.candidates(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (election_id, voter_id) -- One vote per election per user
);

-- RLS POLICIES (Row Level Security) - Basic Setup
alter table public.profiles enable row level security;
alter table public.communities enable row level security;
alter table public.posts enable row level security;

-- Allow anyone to read
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Communities are viewable by everyone" on public.communities for select using (true);
create policy "Posts are viewable by everyone" on public.posts for select using (true);

-- Allow authenticated to insert (simplified for MVP)
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can create communities" on public.communities for insert with check (auth.role() = 'authenticated');
create policy "Users can create posts" on public.posts for insert with check (auth.role() = 'authenticated');
