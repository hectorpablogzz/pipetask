---
title: 'Edit and delete tasks'
type: 'feature'
ticket: '3'
created: '2026-10-12'
status: 'built'
baseline_revision: '311e2fcfa8be498c5a79fe14b74a5ec2c2759eb9'
route: 'oneshot'
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

**Problem:** Tasks can only be added. CAP-1 also needs modifying a task's text and deleting a task permanently (delete is not cancel).

**Approach:** In `src/App.tsx`, add an inline Edit (text input with Save/Cancel; blank text is rejected) and a Delete button per pipeline task, via one `updatePipeline` helper that `addTask` also uses. Autosave persists the result. Verify: an edited task shows its new text and a deleted task is gone, both after reload.

</frozen-after-approval>

## Implementation Notes

Oneshot: about 60 lines in `src/App.tsx` and `src/App.css`. Local build before platform baseline (user, 2026-10-12).

## Review Triage Log

- low, patched -- switching projects mid-edit left `editingId` set, so the half-edited form reappeared on switching back; the project select now clears it.
- low, rejected -- blank edit gives no feedback; matches `addTask` behaviour.
- low, rejected -- delete has no confirm or undo; spec makes delete permanent, confirmation is not requested.
- low, rejected -- button CSS duplicated across blocks; cosmetic, refactor belongs to story 1.9.
- note -- reload persistence not run in a browser; no test runner.
