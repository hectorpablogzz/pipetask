---
type: epic
title: "PipeTask builds and deploys"
parent: initiative-pipetask
covers: []
after: []
assignee: ""
risk: low
---

# PipeTask builds and deploys

## Description

The platform baseline: checks run automatically on every change and the static web app is deployed to a public URL. The Vite + React starter already provides the scaffold.

## Outcome

The developer pushes a change and gets lint and build results, and the latest main branch is live at a URL; the signal is a deployed page matching the repo's main branch.

## Requirements

- Source: initiative decision (user, 2026-10-04): the app must be deployable. No spec ids; covers is empty.
- B1: Lint and build run automatically on every push.
- B2: The production build is deployed to a public URL from the main branch.

## Done when

1. A push triggers lint and build, and a failure is visible.
2. The built app is served at a public URL.
3. A change merged to main is live at that URL without manual steps.

## Boundaries

Pipeline and hosting only. Not app features, backend, or monitoring.

## References

- parent — _bmad-output/initiative-pipetask/initiative-pipetask.md, Notes

## Notes

- Decision: the product must be deployable, so a platform baseline epic comes first (user, 2026-10-04).
- Unknown: CI service and hosting target are not chosen; entries 1 and 2 wait on them.
