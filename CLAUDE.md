# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — `tsc -b` type-check, then `vite build`
- `npm run lint` — Oxlint (config in `.oxlintrc.json`: react, typescript, oxc plugins)
- `npm run preview` — serve the production build

No test runner is configured yet.

## State of the code

`src/` is still the untouched Vite + React 19 + TypeScript starter (`App.tsx` is the demo page). PipeTask itself — a browser-local task-pipeline app — is specified and planned, not built.

## Planning artifacts (BMad)

Requirements and work breakdown live in `_bmad-output/initiative-pipetask/`, driven by the BMad skills in `.claude/skills/`:

- `spec-pipetask/spec-pipetask.md` is the requirement contract (`CAP-1`..`CAP-9`, constraints, non-goals). It is **derived** from `spec-pipetask/.memlog.md`; change it through the `bmad-spec` skill (append to the memlog, re-derive), not by hand-editing the memlog or reordering it.
- `epic-platform-baseline/` (CI, deploy) and `epic-pipetask-app/` (the app) each hold a `tickets.toml` listing planned stories. Stories are entries, not files, until pulled. Use `bmad-ticket` / `tickets.py status` to see order and readiness, and `bmad-build` to implement.
- Decisions already made are recorded as dated `Decision:` lines in the initiative and epic Notes; check them before asking the user again.

Key product constraints from the spec: persistence is browser-local only (no backend); backlog box fixed bottom-right and cancelled box bottom-left, both per project; task state is only pending/completed; drag-and-drop must work by mouse and touch; app must be deployable; accessibility/reduced-motion is out of scope.
