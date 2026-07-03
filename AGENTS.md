# Agent Instructions — Floci Dash

## MANDATORY: Use the Makefile

**Every build, run, stop, and Docker operation MUST use `make` commands.** Never call `docker compose` or `pnpm run` directly for project operations.

| Do | Don't |
|----|-------|
| `make up-bg` | ~~`docker compose up --build -d`~~ |
| `make down` | ~~`docker compose down`~~ |
| `make rebuild` | ~~`docker compose build ... && docker compose up -d`~~ |
| `make logs` | ~~`docker compose logs -f`~~ |
| `make typecheck` (native) | OK for local dev, but `make typecheck-docker` in Docker |
| `make help` | — |

Run `make help` to see all available commands.

## MANDATORY: Update README After Changes

**After implementing any feature, fixing a bug, or making structural changes, the agent MUST update `README.md`** to keep it accurate for open-source users. Specifically:

1. **Supported Services table** — Add new services when fully implemented
2. **Project Structure** — Add new directories/files when created
3. **Features** — Add new user-facing capabilities
4. **Commands** — If new make targets or scripts are added
5. **Environment Variables** — If new env vars are introduced

The README is the first thing users see. Keep it comprehensive, current, and well-formatted.

## MANDATORY: Plan & Tracker

**Every agent MUST follow the implementation plan in `PLAN.md`.**

1. **Read PLAN.md** before starting any work — it contains the full implementation plan with phase-by-phase task breakdown
2. **Check the PROGRESS TRACKER** in PLAN.md to see what's done, in progress, and pending
3. **Update the tracker** when you start a task (Pending -> In Progress) and when you complete it (In Progress -> Done + date)
4. **Never mark a task Done** without running `make typecheck` successfully first
5. **Never skip verification** — each service phase ends with a typecheck + build verification step

The tracker uses these status values: `Done`, `In Progress`, `Pending`, `Blocked`

## MANDATORY: Tests & Codecov Coverage

**Every feature implementation MUST include tests before committing.** No feature is "done" without tests.

### Required steps after implementing any feature:

1. **Write backend route tests** (`src/backend/routes/aws/{service}.test.ts`)
   - Mock the AWS SDK client and all command constructors using the `vi.hoisted` + `createCmd` pattern (see `kms.test.ts` or `ecs.test.ts` for reference)
   - Test every endpoint: happy path, empty results, error/400 validation cases
   - Target: **>90% statement coverage** on new route files

2. **Write frontend hook tests** (`src/frontend/hooks/use{Service}.test.ts`)
   - Mock `api()` from `../lib/client`
   - Test every query hook: correct URL called, `enabled` gate when param is null
   - Test every mutation hook: correct method/URL/body, invalidation on success
   - Target: **100% statement coverage** on new hook files

3. **Write component/page tests** for non-trivial UI components
   - Use happy-dom environment (`// @vitest-environment happy-dom`)
   - Use `createWrapper()` from test helpers for React Query context
   - Test user flows: render, click, fill forms, verify API calls

4. **Run coverage verification before committing:**
   ```bash
   npx vitest run --coverage
   ```
   - Verify new files have **>90% statement coverage**
   - Verify overall coverage **does not decrease** below current thresholds in `vitest.config.ts`
   - If coverage drops, add more tests — do not lower thresholds

5. **Codecov best practices:**
   - `codecov.yml` enforces a **75% patch target** — new code must meet this bar
   - Test both success AND error branches (e.g., empty arrays, missing params → 400)
   - Cover edge cases: URL encoding, optional params, default values
   - Never skip tests to save time — incomplete test coverage is technical debt
   - Prefer many small focused tests over one large test
   - Each test should verify one behavior (`it("does X when Y")`)

### Existing test patterns to follow:

| Pattern | Reference file |
|---------|---------------|
| Backend route mock | `src/backend/routes/aws/kms.test.ts` |
| ECS backend mock (`create()` factory) | `src/backend/routes/aws/ecs.test.ts` |
| Frontend hook test | `src/frontend/hooks/useKMS.test.ts` |
| ServicePage component test | `src/frontend/pages/ServicePage.test.tsx` |

## Project

Floci Dash is a Dockerized, full-stack web app providing an AWS Console-style UI for the Floci local AWS emulator. This project is open source — write code and docs accordingly.

- **Frontend:** React 19 + Tailwind CSS v4 (custom design system, see `components/ui/`) + TanStack Query + React Router (HashRouter)
- **Backend:** Node.js 22 + Hono + @aws-sdk/client-* (all AWS SDK calls go through the backend, never the browser)
- **Infra:** Single Docker container, docker-compose pairs with Floci on port 4566

## Architecture Rules

1. **Zero Floci changes.** Dashboard uses only Floci's existing APIs. Never edit `../floci`.
2. **AWS SDK lives in the backend only.** The browser never imports @aws-sdk/client-*.
3. **Frontend calls /api/* routes on the dashboard backend.** Backend proxies to Floci or uses AWS SDK.
4. **Service-based vertical slices.** Each AWS service (S3, DynamoDB, etc.) gets its own backend route file.
5. **Shared frontend components.** ServicePage.tsx, ResourceTable, CreateModal, DeleteButton are reused across all services.
6. **Consult Floci source first.** Before implementing any service, check `../floci/src/main/java/io/github/hectorvent/floci/services/{service}/` for supported operations.

## Code Structure

```
src/
  frontend/          React SPA (Vite, port 5173 dev)
    components/      Shared UI (AppLayoutShell, ServiceCard, ResourceTable, etc.)
      ui/            Drop-in Tailwind replacement for the old Cloudscape component API
    pages/           Routes (DashboardHome, S3Page, ServicePage, Settings)
    hooks/           TanStack Query hooks (useS3, useDynamoDB, etc.)
    lib/             client.ts (fetch wrapper), utils.ts
    stores/          Zustand stores (settings)
    types/           api.ts, services.ts
  backend/           Node.js + Hono (port 3000)
    clients/         floci.ts (HTTP proxy), aws.ts (SDK factory)
    routes/          system.ts, inspection.ts, active.ts, aws/*.ts
```

## Commands

All commands use `make`. Run `make help` for the full list.

| Make target | Description |
|-------------|-------------|
| `make up` | Start Floci + Dashboard (foreground) |
| `make up-bg` | Start in background |
| `make down` | Stop all containers |
| `make rebuild` | Rebuild Dashboard image after code changes |
| `make logs` | Tail all logs |
| `make typecheck` | TypeScript check (native) |
| `make typecheck-docker` | TypeScript check (Docker) |
| `make dev` | Native dev (needs Node.js 22+) |
| `make build` | Native production build |

## Adding a New Service

1. Consult Floci source: `../floci/src/main/java/io/github/hectorvent/floci/services/{service}/`
2. Create `src/backend/routes/aws/{service}.ts` with List/Create/Delete routes
3. Register in `src/backend/routes/aws/index.ts`
4. Create `src/frontend/hooks/use{Service}.ts` with query/mutation hooks
5. Add service component to `src/frontend/pages/ServicePage.tsx`
6. **Write tests** — backend route tests + frontend hook tests (see MANDATORY section above)
7. Run `make typecheck` to verify
8. Run `npx vitest run --coverage` — verify >90% coverage on new files
9. Update the tracker in PLAN.md
10. **Update README.md** — add the service to the "Fully implemented" table

## UI conventions

### Icons — always use Heroicons
**Never write inline SVG or use `dangerouslySetInnerHTML` for icons.**
Import from `@heroicons/react` — it is already installed:

```tsx
import { MagnifyingGlassIcon, StarIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
```

| Size prefix | When to use |
|---|---|
| `16/solid` | Nav items, toolbar buttons, compact UI (14–16 px rendered) |
| `20/solid` | Medium UI — form labels, table column headers |
| `24/solid` | Large controls, page-level actions |
| `24/outline` | Paired with `16/solid` for toggleable states (starred/unstarred) |

Set rendered size with Tailwind: `className="tw:w-4 tw:h-4"`. Do not set `width`/`height` directly on the icon component.

### Design system
Cloudscape Design System has been fully removed. The entire app (shell + every
service page) uses a single custom Tailwind v4 design system.

- Tailwind v4 is configured with a `tw:` prefix (v4 variant-style syntax, e.g. `tw:flex`, `tw:md:hidden`,
  `tw:group-hover:opacity-100` — the prefix always comes first, before variants). See
  `src/frontend/styles/tailwind.css`.
- `src/frontend/components/ui/` is a drop-in replacement component library that mirrors the
  Cloudscape component API (`Box`, `SpaceBetween`, `Header`, `Container`, `ContentLayout`,
  `BreadcrumbGroup`, `Button`, `Form`, `FormField`, `Input`, `Textarea`, `Select`, `Checkbox`,
  `Toggle`, `FileUpload`, `Modal`, `Table`, `TextFilter`, `Tabs`, `Alert`, `Flashbar`, `Skeleton`,
  `Spinner`, `StatusIndicator`, `Badge`, `Link`, `Icon`) so existing call sites work unchanged —
  import everything from `"../components/ui"` (adjust relative path per file location). Extend
  this kit instead of reaching for a new UI library or writing one-off styled components.
- Custom shell (`AppLayoutShell`) + shared primitives use CSS variables defined on `#app-shell`
  in `src/frontend/styles/dashboard.css` (`--sh-bg`, `--sh-surface`, `--sh-ink`, `--sh-accent`, etc.).
- Dark mode: toggle `.light` class on `#app-shell`. The `awsui-dark-mode` class is still toggled on
  `document.body` for backward compatibility — several `fd-*` utility classes in `dashboard.css`
  (`fd-tag-chip`, `fd-accent-card`, `fd-skeleton`, etc.) still key off it for their dark/light variant.
- Design tokens live in `src/frontend/styles/tailwind.css` (`@theme`) and `src/frontend/styles/dashboard.css`
  (`#app-shell` variables).

## General conventions

- No Floci changes
- Backend routes first, test with curl, then frontend
- Conventional commits only
- Reuse existing components
- Every task in PLAN.md must be tracked and updated
- **Always use `make` commands** for Docker and build operations
- **Always update README.md** after making changes
- **Never push to GitHub unless explicitly instructed** — the agent may commit changes locally (e.g., `git add` + `git commit`) but MUST NOT run `git push` unless the user says "push" or "commit and push"
