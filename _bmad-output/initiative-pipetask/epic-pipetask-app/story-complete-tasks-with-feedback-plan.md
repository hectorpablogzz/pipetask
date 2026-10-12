---
title: 'Complete tasks with feedback'
type: 'feature'
ticket: '4'
created: '2026-10-12'
status: 'built'
baseline_revision: 'b8d86420ea89cf05feb072e65b55504206aaf903'
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

**Problem:** Tasks are always pending. CAP-3 needs pending and completed states, and CAP-2 needs visible positive feedback when a task is completed. A completed task can revert to pending; tasks need not complete in order.

**Approach:** In `src/App.tsx`, add a Complete/Revert toggle per pipeline task that flips `state` between `pending` and `completed` via `updatePipeline`. Completing (not reverting) shows feedback: a short green pulse on that task plus a brief "Done!" message that clears itself. Feedback form is the builder's choice (epic note); no sound. Verify: completing marks the task completed with feedback, reverting returns it to pending, no third state exists.

</frozen-after-approval>

## Implementation Notes

Oneshot: about 50 lines in `src/App.tsx`, `src/App.css`. Feedback is transient UI state, not persisted. Local build before platform baseline (user, 2026-10-12).

## Review Triage Log

- low, patched -- feedback stayed visible after switching project or deleting the flashed task; message now shows only while the flashed task is in the active pipeline.
- medium, patched -- the message mounted in normal flow and shifted every row for 1.2s, risking misclicks; the line is now always rendered with a fixed min-height.
- low, rejected -- pulse duration and timeout are separate 1.2s constants; no current harm.
- low, rejected -- `<li>` attribute formatting and the extra emoji; cosmetic.
- note -- no browser run; no test runner.
