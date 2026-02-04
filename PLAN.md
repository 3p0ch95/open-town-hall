# Open Town Hall - Project Plan

## Phase 1: The Skeleton (Current)
- [x] Initialize Next.js app (React 19, Tailwind, TS)
- [ ] Set up basic layout (Header, Sidebar, Main Feed)
- [ ] Create "Create Community" mock UI
- [ ] Create "Election" tab mock UI

## Phase 2: Database & Auth (Supabase)
- [ ] Connect Supabase
- [ ] Define Schema:
    - `profiles` (users)
    - `communities` (subreddits)
    - `posts`
    - `votes` (standard up/down)
    - `elections` (term based)
    - `election_votes`
- [ ] Implement Auth (Google/Email)

## Phase 3: The Logic
- [ ] Implement posting logic
- [ ] Implement standard voting
- [ ] Implement election logic (start date, end date, counting)

## Phase 4: The Bots
- [ ] Create API endpoint for bots
- [ ] Build a "Jester" bot that comments on posts
