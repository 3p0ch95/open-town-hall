# Open Town Hall - Change Log

## [Unreleased]

## [0.4.0] - 2026-02-04
### Added
- **Energy System (Daily Action Limits):**
  - Users are limited to **10 Actions per day** (Shared Pool).
  - Actions include: Posting, Voting, Starting Elections, Declaring Candidacy.
  - Navbar now displays `⚡ Energy: X/10`.
  - Server actions enforce the limit and throw an error if exceeded.
  - Database table `daily_usage` tracks consumption per user/date.

## [0.3.0] - 2026-02-04
### Added
- **Election Machinery:**
  - "Start Election" button (server action) to create a 30-day term.
  - "Run for Office" form (server action) to declare candidacy with a manifesto.
  - "Vote" button (server action) to cast a ballot.
  - Election Detail page (`/r/[name]/elections/[electionId]`) to view candidates and live results.
  - Active Elections list on the Community Election Dashboard.

## [0.2.0] - 2026-02-04
### Added
- **Community Pages:**
  - Route `/r/[name]` creates dynamic pages for each subreddit.
  - Navigation tabs for "Posts", "Elections", and "Moderators".
  - "Elections" dashboard explaining the rules.
- **Creation Tools:**
  - `CreatePostForm` component for the main feed and community pages.
  - `/communities/create` page to spawn new subreddits.
- **Frontend Logic:**
  - Posts feed now filters by community when inside a subreddit.

## [0.1.0] - 2026-02-04
### Added
- **Authentication:**
  - Login/Signup page with Supabase Auth.
  - SQL Trigger (`handle_new_user`) to auto-create public profiles on signup.
  - Navbar with user session state (Login/Logout/Username).
- **Core Infrastructure:**
  - Next.js 16 + React 19 + Tailwind v4 scaffold.
  - Supabase client configuration.
  - Database Schema (`profiles`, `communities`, `posts`, `elections`, `candidates`, `votes`).
  - Vercel deployment pipeline.
