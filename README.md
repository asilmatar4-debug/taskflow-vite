# TaskFlow — Project & Task Management

A React + Vite + Firebase assessment project. Built with straightforward components, React hooks, React Router and Cloud Firestore. The UI is responsive and uses plain CSS.

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and enter the **Firebase Web SDK configuration** (Vite uses `VITE_` prefixes, not `NEXT_PUBLIC_`). **Never add Firebase Admin service-account keys.**
4. Firebase Console: enable Authentication → Email/Password, create Cloud Firestore, and publish the contents of `firestore.rules` using the Firestore Rules editor.
5. Run `npm run dev` and open the local URL Vite prints.
6. Run `npm run lint` and `npm run build` before deployment.

## Architecture

- `src/pages`: routed screens and simple page-specific state.
- `src/components`: layout and reusable task forms/cards/filters.
- `src/services`: Firebase CRUD operations; forms don't call Firestore directly.
- `src/context`: shared Firebase Auth state.
- `src/firebase.js`: one Firebase client initialization.
- `firestore.rules`: server-enforced permissions; never rely on hidden buttons alone.

## Features

- Email/password authentication; profile records; protected routes; session persistence.
- Projects: create, list, read and edit; owner/member access.
- Invite-free membership: owner looks up existing registered users by their exact email, adds or removes them. Removing an assigned member unassigns their tasks in a batch.
- Nested project tasks: create/edit/delete; assignment, status, priority, deadline and timestamps.
- Search title; filter status including overdue, priority and assignee; dashboard totals and personal task list.
- Loading, empty, denied and error states; desktop/mobile responsive design.

## Firestore collections

- `users/{uid}` → `displayName, email, createdAt`
- `userLookup/{lowercaseEmail}` → `uid, displayName, email, createdAt` (exact-document lookup only; no collection listing)
- `projects/{projectId}` → `name, description, ownerId, memberIds, memberNames, createdAt, updatedAt`
- `projects/{projectId}/tasks/{taskId}` → `title, description, status, priority, assigneeId, createdBy, dueDate, createdAt, updatedAt`

## Limitations and important notes

- **Project deletion is deliberately restricted** at both service and security rules. Firestore subcollections are not automatically deleted. The assessment allows a documented deletion restriction for the 7-day MVP. A server-side recursive cleanup operation is needed before enabling project deletion.
- For large projects, batched membership removal is capped at 400 task docs; this MVP does not implement pagination.
- Older Next.js projects missing `memberNames` can be upgraded by their owner with **Upgrade old project** in Project Settings. Do this before editing the project or its membership. User profiles created by the previous Next.js version will receive a `userLookup` record when they sign in through the Vite app; creating a profile from the new Register page also writes it.
- Date-only deadlines use local midday timestamps; overdue compares local calendar dates. Deploy and test in the evaluator's timezone.
- If a Firestore write succeeds but the subsequent refresh fails, the UI shows a warning and a reload reveals persisted data.
- No payments, uploads, email invitations, notifications or realtime chat (out of scope).
- Responsive layout should be checked at 375px, 768px, 1280px.
- Deployment should use Vercel or Firebase Hosting with SPA fallback to `index.html`. Add Vite env vars to the hosting provider, not just local `.env.local`.
- **Important:** This replaces the Next.js app; don't copy these files over its `src/`. Create a fresh repository/branch and preserve the original project as backup.

## Test plan (manual)

1. Register owner and member accounts; verify Auth and user profile docs.
2. Sign in, reload, sign out, and try protected URLs unauthenticated.
3. Create and edit a project; reload and verify Firestore persistence.
4. Add registered member by email; reject unknown/duplicate email.
5. As member, open shared project, create task; as owner, assign task.
6. Validate empty title, high-priority filtering, text search and overdue filter.
7. Change task status and reload; test delete confirmations.
8. Owner-only settings should be denied to member, even via URL.
9. Sign in with a third account and try a foreign project URL; must deny.
10. Use Firestore Rules Playground / Emulator to verify denied direct writes and cross-user reads.
11. Remove member: their future project access must be revoked and assignments cleared.
12. Test on mobile, network failure, slow loading and unassigned tasks.

## Demo (5 minutes)

Login → Dashboard stats → New Project → Add existing member → Create/assign task → Filters → Task progress → Show second account cannot edit project → GitHub / rules explanation.

## Hosting on Vercel

Import GitHub repo, set Framework Preset = Vite, build command `npm run build`, output directory `dist`, configure six `VITE_FIREBASE_*` variables; use SPA rewrite. `vercel.json` is included.
