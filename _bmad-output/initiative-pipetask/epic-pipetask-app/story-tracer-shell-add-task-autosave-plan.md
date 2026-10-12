---
title: 'Tracer: shell, add task, autosave'
type: 'feature'
ticket: '1'
created: '2026-10-12'
status: 'built'
baseline_revision: 'NO_VCS' # repo has no commits; pre-change snapshot of src/ and public/ kept in scratchpad baseline/
route: 'full'
route_source: 'auto'
risk: 'low'
review: 'quick'
review_source: 'pinned'
lenses_ran: [quick]
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/initiative-pipetask/spec-pipetask/spec-pipetask.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `src/` is the untouched Vite starter. There is no PipeTask shell, no way to add a task, and nothing persists across reload.

**Approach:** Replace the starter page with a minimal app shell that adds tasks to a pipeline and autosaves to `localStorage` through a project-keyed storage model (one default project for now) that stories 1.2 to 1.7 extend.

## Boundaries & Constraints

**Always:** State is a `Record<projectId, Project>` plus `activeProjectId`, so more projects need no migration. A project holds `pipeline`, `backlog` and `cancelled` task arrays (the latter two unused yet). A task is `{ id, title, state: 'pending' | 'completed' }`. Saving is automatic on every state change. Storage read tolerates missing or corrupt data by falling back to a fresh default state.

**Never:** No project switching UI, edit/delete, completion, drag-and-drop, backlog/cancelled UI or celebration (later stories). No backend. No new dependencies. No deploy or CI work: the "deployed site shows it" part of the ticket's verify is deferred by the user (2026-10-12), local only.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Add task | Type "Write spec", submit | Task appended to the pipeline list as pending; input cleared | No error expected |
| Blank title | Empty or whitespace-only input | Nothing added | Submit ignored |
| Reload | Tasks saved earlier | Same tasks in the same order | No error expected |
| First run | No stored data | Empty pipeline in a default project | No error expected |
| Corrupt storage | Invalid JSON under the key | Fresh default state, app renders | Caught, no crash |

</frozen-after-approval>

## Code Map

- `src/App.tsx` -- starter demo page (counter, logos); replace entirely with the shell. Do not keep any starter content.
- `src/App.css` -- starter styles; replace with shell styles. Layout must leave the bottom-left and bottom-right corners free for later boxes.
- `src/index.css` -- starter global styles (`#root` 1126px centered with border, `#social` rule, h1 sizes); trim to what the shell needs, keep the CSS variables and dark-mode block.
- `src/main.tsx` -- mounts `<App />` in StrictMode; leave unchanged.
- `src/assets/`, `public/icons.svg` -- starter assets; delete only those no longer referenced.
- `package.json` -- `npm run build` (tsc -b + vite) and `npm run lint` (oxlint) are the checks. No test runner exists; do not add one.

## Tasks & Acceptance

**Execution:**
- [ ] `src/storage.ts` -- types (`Task`, `Project`, `AppState`), `defaultState()`, `loadState()` and `saveState()` over one `localStorage` key, with try/catch and shape validation -- project-keyed model later stories build on
- [ ] `src/App.tsx` -- shell: header, add-task form, ordered pipeline list; state initialised from `loadState()`, `useEffect` calls `saveState()` on change -- the tracer path UI to state to persistence
- [ ] `src/App.css`, `src/index.css` -- replace starter styling with the shell layout -- remove demo styles
- [ ] `src/assets/*`, `public/icons.svg` -- delete unreferenced starter assets -- no dead files

**Acceptance Criteria:**
- Given an empty app, when the user adds a task titled "A", then it appears in the pipeline as pending.
- Given tasks were added, when the page is reloaded, then the same tasks show in the same order with no manual save.
- Given corrupt data in storage, when the app loads, then it renders an empty default project without throwing.
- Given the working tree, when `npm run build` and `npm run lint` run, then both pass.

## Implementation Notes

## Plan Change Log

## Review Triage Log

Pass 1 (quick): 0 high, 0 medium, 1 low, 0 false.

- low / patch -- `isAppState` accepts a project whose record key differs from its `id`, so `addTask` (writes under `current.id`) creates a duplicate entry and the task never shows. Real but reachable only through hand-edited storage. Fixed by validating `key === project.id` in `src/storage.ts`.

## Design Notes

```ts
type AppState = { activeProjectId: string; projects: Record<string, Project> }
type Project = { id: string; name: string; pipeline: Task[]; backlog: Task[]; cancelled: Task[] }
```

Task ids via `crypto.randomUUID()`. Under StrictMode the save effect runs twice in dev, which is harmless since it is idempotent.

## Verification

**Commands:**
- `npm run build` -- expected: type-check and bundle succeed
- `npm run lint` -- expected: no errors

**Manual checks (if no CLI):**
- `npm run dev`: add two tasks, reload, both remain in order; set `localStorage` key to `{` and reload, app still renders empty.
