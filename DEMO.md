# FeatureForge — demo script

A ten-minute run-through of both apps: the **issue tracker** (user → developer → admin)
and the **feature-flag governance** platform (approvals, break-glass, audit, guarded rollback).

## Setup

```sh
# 1. Start Mongo (if not already running), then seed a clean dataset
cd backend
npm run seed

# 2. Start the API (binds 127.0.0.1:5000)
npm start            # logs "Server running on http://127.0.0.1:5000"

# 3. In a second terminal, start the frontend
cd frontend
npm run dev          # Vite serves http://localhost:5173
```

> **Port 5000 note:** macOS AirPlay Receiver also listens on 5000. The API binds
> `127.0.0.1` explicitly so it still works. If the server behaves oddly, clear strays
> with `lsof -ti tcp:5000 | xargs kill -9` and start one fresh `npm start`.

Re-run `npm run seed` any time to reset to the starting state below.

## Logins (password `password123` for everyone)

| Role      | Email               | Lands on      |
| --------- | ------------------- | ------------- |
| User      | `riya@example.com`  | `/user`       |
| Developer | `dana@example.com`  | `/developer`  |
| Admin     | `admin@gmail.com`   | `/dashboard`  |

Each role is fenced to its own portal — signing in as a user and visiting `/dashboard`
redirects back; admin-only APIs return 403 without an admin token.

---

## Act 1 — A user reports a bug (portal: `riya@example.com`)

1. Sign in as **riya@example.com**. You land on the user portal.
2. **Report an issue** (`/user/report`): fill in a title and description, submit.
   It posts to `POST /issues` and the new issue appears under **My Reports**
   (`/user/my-reports`), filtered to Riya by email.
3. Open an existing issue and hit **+1 / me too** to show upvotes bump the report
   count (and dedupe per reporter).

> Priority is computed server-side from the report count: ≥10 critical, ≥5 high,
> ≥2 medium, else low. `ISS-001` (14 reports) is seeded **critical**.

## Act 2 — A developer picks up work (portal: `dana@example.com`)

1. Sign out, sign in as **dana@example.com**.
2. **Available issues** (`/developer/available`) lists open, unassigned issues.
   `ISS-003` is open — click **self-pick** to request it (`POST /issues/:id/self-pick`).
   This creates a pending request for an admin to approve.
3. **My issues** (`/developer/my-issues`): Dana already owns the seeded `ISS-001`
   ("Login page crashes on Safari 17"). Move it **in progress**, then **resolve** it
   (`PATCH /issues/:id/status`). The board reflects the new state immediately.

## Act 3 — The admin governs the queue (portal: `admin@gmail.com`)

1. Sign out, sign in as **admin@gmail.com**.
2. **Issues** (`/issues`): assign an unassigned issue to a developer
   (`POST /issues/:id/assign`) — admin-only.
3. **Approval queue** (`/approval-queue`): Priya's seeded self-pick request on `ISS-003`
   (plus Dana's from Act 2) is waiting. **Approve** one to assign the developer and
   **reject** another to send it back to the pool.

---

## Act 4 — Governed flag change through approval (portal: `admin@gmail.com`)

The governance story: no flag changes in prod without a reviewed, audited change request.

1. **Approvals** (`/approvals`): `CR-416` (raise *onboarding-tour* from 50% → 75%) is
   **pending with 1 of 2** approvals already in (`ada@example.com`).
2. Click **Approve**. Your approval is the second, so the request flips to **approved**
   and applies — and an `approval` entry is written to the audit log
   (`POST /approvals/:id/approve`).
3. Point out `CR-418` (still pending, 0/2) and the already-**rejected** `CR-409`
   (expand *new-nav* — turned down because its metric was degrading). Rejecting applies
   no change and is itself audited.

## Act 5 — The guarded rollback (portal: `admin@gmail.com`)

The one automated-protection moment.

1. **Rollouts** (`/rollouts`): `RO-54` (*new-nav*) is ramping at 10% and flagged
   **degrading** — variant error rate running hot against control.
2. Click **Simulate bad metric** (`POST /rollouts/:id/rollback`). Instantly:
   - the rollout flips to **rolled_back** at 0%,
   - the linked **new-nav** flag is disabled,
   - a `system` **auto_rollback** entry lands in the audit log — no human in the loop.
3. For contrast, `RO-49` (*checkout-redesign*) is already seeded rolled-back from an
   earlier breach, and the **Dashboard** (`/dashboard`) shows the red auto-rollback alert.

## Act 6 — Break-glass and the audit trail (portal: `admin@gmail.com`)

1. **Break-glass** (`/break-glass`): `BG-77` is an **active** emergency session on
   *payments-kill* with a live countdown to expiry. Two past sessions (expired,
   force-revoked) show the history. **Request** a new session (`POST /breakglass`) and
   **Revoke** it (`POST /breakglass/:id/revoke`) — each writes a `break_glass` audit entry.
2. **Audit** (`/audit`): the append-only trail. Filter by actor or action and show the
   distinct entry types produced during the demo — `approval`, `auto_rollback`,
   `break_glass`, `config_change`, `ops_toggle`. There is no edit or delete path: the log
   only ever grows.

---

## The one-line pitch

Every state-changing action in FeatureForge — assigning an issue, approving a flag
change, bypassing review in an incident, or an automatic rollback firing — lands as an
attributable, immutable entry in one audit trail. That is the product.
