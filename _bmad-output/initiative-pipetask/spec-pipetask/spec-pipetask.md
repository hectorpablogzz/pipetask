---
id: SPEC-pipetask
companions: []
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# PipeTask

## Why

A vision to realize: a task manager where work is an explicit ordered pipeline the user arranges by hand, with a backlog for unscheduled work, a holding place for cancelled work, and rewarding feedback as tasks complete. Motivation and audience were not stated in the input (see Assumptions, Open Questions).

## Capabilities

- **CAP-1**
  - **intent:** User can add, modify, and delete tasks.
  - **success:** After each action the task list reflects it, including after reload.
- **CAP-2**
  - **intent:** User receives positive feedback when completing a task.
  - **success:** Completing a task produces a visible positive response on that action.
- **CAP-3**
  - **intent:** A pipeline task is either "pending" or "completed".
  - **success:** Every pipeline task shows exactly one of the two states; no other state is reachable.
- **CAP-4**
  - **intent:** User can change the execution order of pipeline tasks by drag-and-drop.
  - **success:** Dragging a task to a new position changes the pipeline order, and the new order persists.
- **CAP-5**
  - **intent:** User receives a celebratory notification when all pipeline tasks are completed.
  - **success:** Completing the last pending task triggers the notification; it does not fire while any task is pending.
- **CAP-6**
  - **intent:** User can park tasks in a backlog box at the bottom right of the screen and drag them into the pipeline.
  - **success:** The box renders bottom-right; dragging a backlog task into the pipeline removes it from the backlog and places it in the pipeline.
- **CAP-7**
  - **intent:** User has a "cancelled tasks" box at the bottom left of the screen.
  - **success:** The box renders bottom-left and lists cancelled tasks.
- **CAP-8**
  - **intent:** User's progress is saved automatically.
  - **success:** Closing and reopening the app restores all tasks, states, order, and boxes without a manual save action.
- **CAP-9**
  - **intent:** User can maintain multiple projects, each with its own pipeline.
  - **success:** Creating a second project yields an independent pipeline; changes in one never alter the other.
- **CAP-10**
  - **intent:** User signs in with GitHub (via Supabase) to use the app, and can sign out.
  - **success:** Signed out, only the login page shows; after GitHub sign-in the app shows the signed-in user and their own tasks; a different user in the same browser sees an empty app.

## Constraints

- Backlog box is fixed at bottom-right and cancelled box at bottom-left of the screen; the layout must reserve both corners.
- Task state is only pending or completed; "cancelled" is a location (the cancelled box), not a third state.
- Saving is automatic; no UI may require a manual save for progress to persist.
- Persistence is browser-local only, kept per signed-in user: no app backend, data tables, or sync. Supabase is used for GitHub authentication only.
- Login is identity and per-user separation in one browser, not data security: stored data is client-side.
- The app must be deployable as a web app, and drag-and-drop must work by touch as well as mouse.
- Backlog and cancelled boxes belong to each project. A task is cancelled by dragging it to the cancelled box and restored by dragging it back out.

## Non-goals

- Task states beyond pending and completed.
- Reduced-motion and accessibility work.
- Manual save or export/import of progress (not requested).
- Server-side storage and cross-device sync.

## Success signal

A user creates a project, adds tasks, drags some from the backlog into the pipeline, reorders them, and completes them one by one with positive feedback each time; completing the last triggers a celebration; reloading the page restores everything, and a second project stays unaffected.

## Assumptions

- Pipeline is a user-ordered list worked top to bottom; "execution order" means that sequence.
- A completed task can revert to pending; tasks need not complete in order; cancelling works from backlog and while completed; the backlog accepts tasks created in it and pipeline tasks dragged in; both boxes can be reordered.
- Deleting (CAP-1) removes a task permanently, unlike cancelling.
- Existing stack (React 19, Vite, TypeScript) is incidental, not mandated by this spec.
- Motivation is a personal sequential task-flow tool; no source states it.

## Open Questions

- Who is the user and what pain does this solve (Why)?
- What form do the positive feedback (CAP-2) and celebration (CAP-5) take?
- Task fields beyond title (description, due date, etc.)?
