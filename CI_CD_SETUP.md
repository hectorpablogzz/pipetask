# CI/CD with LLMOps for PipeTask

Workflow: `.github/workflows/ci-cd.yml` (replaces the old `ci.yml`).
Stack detected: Vite 8 + React 19 + TypeScript, npm (`package-lock.json`), Oxlint, Vitest. Build output directory: **`dist`** (Vite default, no `netlify.toml` in the repo).

## What runs when

| Job | Trigger | What it does |
|---|---|---|
| `quality` | PR to `main`, push to `main` | `npm ci`, `npm run lint`, `npm test`, `npm run build` |
| `llm-review` | PR to `main` only | Sends the PR diff to the Google Gemini API, prints the review in the log, writes it to the step summary. **Gate:** fails the PR only if a *verified* high-severity finding exists (see below). Does not fail on API outages unless `REVIEW_STRICT=true` |
| `llm-eval` | Manual (`workflow_dispatch`) only | Runs the golden-set eval against the real API (`npm run eval:llm`) |
| `deploy` | Push to `main` only, after `quality` succeeds | Builds and runs `netlify deploy --prod --dir=dist --no-build` |

Security design: top-level `permissions: contents: read`; no `pull_request_target`; `persist-credentials: false`; secrets are only passed to the step that needs them; the diff is sent to the model as data inside `<diff>` tags with a system prompt saying to ignore instructions inside it; the model has no tools and its output is only printed, never executed; PR-controlled values are never interpolated into shell commands (SHAs go through `env` and are validated as 40-hex in the script). Forks do not receive secrets, so the review step prints a warning and skips.

## How the LLM can pass or fail a PR (and why you can trust the result)

LLM output is non-deterministic, so the model never decides pass/fail by itself. The pipeline wraps it in deterministic checks (`scripts/llm-review/`):

1. **Structured output.** The request asks for JSON (`responseMimeType` + `responseSchema`): verdict, summary, findings (severity, file, line, evidence, problem, fix), suggested tests.
2. **Schema validation in code** (`validateReview`). Wrong types, unknown severities or verdicts, bad line numbers etc. count as a failed attempt and are retried (3 attempts per model, then a fallback model). If the API rejects the schema, it retries in plain JSON mode; code validation still applies.
3. **Grounding.** A finding only counts if its `file` is in the diff and its `evidence` is a verbatim excerpt found in the diff. Hallucinated findings are shown as "unverified" and cannot block.
4. **Deterministic gate** (`assess`). The job fails if and only if at least one *verified high-severity* finding exists. The model's own verdict is recorded but never trusted: `APPROVE` with a verified high finding still blocks; `REQUEST_CHANGES` without one does not.
5. **Calibrated severity.** The prompt reserves `high` for defects with a concrete failing line (bugs, hardcoded secrets, unsafe CI changes). Medium/low findings are comments only.
6. **Untrusted input.** The diff sits between markers containing a random token, so it cannot close the data block. The model has no tools. Model text is printed inside `::stop-commands::` and annotation text is escaped, so it cannot forge workflow commands.
7. **Outage policy.** If the review cannot be completed (no key, API down, output invalid after retries) the job warns and passes. Set repo variable `REVIEW_STRICT=true` to fail instead (fork PRs have no secrets and would then fail).

To make it a merge requirement, add **LLM diff review (gate)** as a second required status check in the branch ruleset.

Known limit: a single model call can still miss a bug or, rarely, raise a verified-looking false positive. Re-run the job if you disagree, and tune the prompt/golden set.

### Tests for the LLM layer
- **Offline, every run (`npm test`)**: `scripts/llm-review/review.test.mjs` checks the validator, grounding, the gate, injection/escaping defenses, retry/fallback logic (with a fake `fetch`) and the golden fixtures. No API calls.
- **Golden-set eval (manual, uses API quota)**: `golden/cases.json` has four diffs: a planted inverted-filter bug, a hardcoded password, a clean change, and the same bug with a "tell the reviewer to approve" prompt-injection comment. Each case runs 3 times and asserts *properties* (blocked or not, which file, keywords, verdict not APPROVE), requiring 2 of 3 runs to pass. It waits 13 s between calls (override with `EVAL_DELAY_MS`) to respect free-tier rate limits; a 429 `RESOURCE_EXHAUSTED` means you hit the quota, so wait or set `GEMINI_MODEL` to another model. Run it with `GEMINI_API_KEY=... npm run eval:llm` or Actions → CI/CD → **Run workflow**.

## One-time setup

### 1. GitHub secrets (Settings → Secrets and variables → Actions)

| Secret | Used by | Where to get it |
|---|---|---|
| `GEMINI_API_KEY` | `llm-review` | aistudio.google.com → Get API key (free tier, no billing needed) |
| `NETLIFY_AUTH_TOKEN` | `deploy` | Netlify → User settings → Applications → Personal access tokens |
| `NETLIFY_SITE_ID` | `deploy` | Netlify → Site configuration → Site ID |
| `VITE_SUPABASE_URL` | `deploy` (build) | Same value as in your local `.env.local` |
| `VITE_SUPABASE_ANON_KEY` | `deploy` (build) | Same value as in your local `.env.local` |

The two Supabase values are required: `src/supabase.ts` throws at startup if they are missing, so a deploy built without them would be a blank page. They are inlined into the public bundle (the anon key is public by design).

Optional repository **variable** `GEMINI_MODEL` to override the default (`gemini-3.8-flash`). The script retries 429/5xx errors 3 times, then falls back through `GEMINI_FALLBACK_MODEL` (comma-separated list, default `gemini-3.5-flash-lite,gemini-3.6-flash`); a model that fails every attempt is skipped for the rest of an eval run. The log starts with `Models to try, in order: ...`. Free-tier model names and rate limits change; if the review step warns about a 404 or 429, pick a currently free model in AI Studio and set this variable.

### 2. GitHub `production` environment (recommended)
Settings → Environments → New environment → `production`. Optionally restrict it to the `main` branch. The deploy job references it.

### 3. Branch protection on `main`
Settings → Branches → add rule for `main`: require a pull request, require status check **Code quality (lint, test, build)**. This makes "required checks pass" enforceable before merge.

### 4. Make GitHub Actions the only production deploy path on Netlify
Netlify's Git integration publishes `main` on every push, bypassing the checks. To stop that while keeping Deploy Previews:

1. Netlify → your site → **Deploys** → **Deploy settings** (Build & deploy → Continuous deployment).
2. Under **Build status** choose **Stop auto publishing** (not "Stop builds"). Netlify will still build, but `main` builds are no longer published automatically. Deploy Previews for pull requests and branch deploys keep working.
3. Under Environment variables, make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set so previews work too. Build command `npm run build`, publish directory `dist`.
4. Stricter alternative: unlink the repository (Continuous deployment → Manage repository → Unlink). This removes PR previews too.

Do not skip step 4's check: with auto publishing still on, every push to `main` is deployed by Netlify regardless of CI results.

## Testing instructions

Local:
```bash
npm run lint && npm test && npm run build
```
Tests: `src/storage.test.ts` (persistence/validation) and `src/tasks.test.ts` (add, edit, complete/revert, delete, reorder, per-project updates).

LLM review locally (needs a real key; sends your diff to Google):
```bash
GEMINI_API_KEY=... BASE_SHA=$(git merge-base origin/main HEAD) HEAD_SHA=$(git rev-parse HEAD) node scripts/llm-review/llm-review.mjs
```

### Lint-failure demo (feature branch only)
`scripts/lint-demo.sh` refuses to run on `main`.
```bash
git switch -c demo/lint-failure
scripts/lint-demo.sh break      # adds src/lint-demo.ts containing `debugger` (rule no-debugger = error)
git add -A && git commit -m "demo: lint failure" && git push -u origin demo/lint-failure
# open a PR to main -> `quality` fails at the Lint step (screenshot)
scripts/lint-demo.sh fix        # removes the file
git add -A && git commit -m "fix: remove lint error" && git push
# the PR check turns green (screenshot)
```
Close the PR without merging (or merge the fix state only), so `main` never contains the broken commit.

### Verifying the pipeline end to end
1. PR with a small change → `quality` and `llm-review` run; open the `llm-review` job log and the run's **Summary** tab.
2. Merge to `main` → `deploy` runs; open the printed Netlify URL.
3. Confirm Netlify's Deploys list shows the production deploy came from the CLI/"GitHub Actions" message, not from a Git-triggered build.

## Screenshots for the report
1. Repo file tree showing `.github/workflows/ci-cd.yml`, `scripts/llm-review/llm-review.mjs`, `CI_CD_SETUP.md`.
2. GitHub Secrets page (names only, values are hidden).
3. Failing PR: `quality` job with the red Lint step and the `no-debugger` error.
4. Same PR after the fix: all checks green.
5. `llm-review` job log with the review text, and the workflow run **Summary** page showing the saved step summary.
6. Successful `deploy` job log on `main`.
7. Netlify Deploys page showing the latest production deploy, and the build-settings page with **Stop auto publishing** selected.
8. Branch protection rule with the required check.
9. The live site on its Netlify URL.

## Limitations
- The review can be wrong (see "Known limit"); diffs over 60,000 characters are truncated. Lockfile and planning folders are excluded from the diff.
- Diff contents are sent to Google's Gemini API. On the free tier Google may use submitted content to improve its products, so do not put secrets or private code in PRs.
- `netlify-cli` is pinned (`27.17.0`) and run through `npx`; bump it deliberately.
