-- ============================================================
-- CareerPath AI — Supabase Schema
-- Paste this entire file into Supabase → SQL Editor → Run
-- ============================================================

-- USERS table — stores account credentials
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz default now(),
  last_login    timestamptz
);

-- PROFILES table — stores user profile + all saved analysis results
-- Each user has one profile row (1-to-1 with users)
create table if not exists profiles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid unique references users(id) on delete cascade,
  name           text,
  email          text,
  target_role    text,
  education      text,
  experience     text,
  skills         jsonb default '[]',      -- array of skill strings
  interests      jsonb default '[]',      -- array of interest strings
  career_result  jsonb,                   -- last career analysis result
  resume_result  jsonb,                   -- last resume analysis result
  job_result     jsonb,                   -- last job match result
  roadmap_result jsonb,                   -- last roadmap result
  salary_result  jsonb,                   -- last salary result
  updated_at     timestamptz default now()
);

-- Index for fast user lookup by email
create index if not exists users_email_idx on users(email);
create index if not exists profiles_user_id_idx on profiles(user_id);

-- Row Level Security — disable for service key access (your backend uses service key)
alter table users    disable row level security;
alter table profiles disable row level security;
