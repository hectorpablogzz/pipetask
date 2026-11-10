// Golden-set eval against the real Gemini API. Run manually or via the
// workflow_dispatch job; costs API calls, so it is not run on every PR.
import { readFileSync, appendFileSync } from 'node:fs'
import { assess } from './review-lib.mjs'
import { reviewDiff } from './review-client.mjs'
import { evaluateCase } from './eval-lib.mjs'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('GEMINI_API_KEY is required to run the eval')
  process.exit(1)
}
const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash'
// Comma-separated list, tried in order after the primary model.
const fallbackModels = (process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite,gemini-3.6-flash').split(',').map((m) => m.trim()).filter(Boolean)
const dir = new URL('./golden/', import.meta.url)
const cases = JSON.parse(readFileSync(new URL('cases.json', dir), 'utf8'))
// Free-tier limits can be as low as ~5 requests/minute per model; override with EVAL_DELAY_MS.
const delayMs = Number(process.env.EVAL_DELAY_MS) || 13_000
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const unhealthy = new Set()
const runOnce = async (diff) => {
  await sleep(delayMs) // stay under free-tier requests-per-minute limits
  const { review } = await reviewDiff({ apiKey, model, fallbackModels, unhealthy, diff })
  return assess(review, diff)
}

const rows = []
for (const def of cases) {
  const diff = readFileSync(new URL(def.diff, dir), 'utf8')
  const r = await evaluateCase(def, diff, runOnce)
  rows.push(r)
  console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}: ${r.passed}/${r.runs} runs satisfied (needed ${r.needed})`)
  if (!r.ok) [...new Set(r.failures)].forEach((f) => console.log(`   - ${f}`))
}
const md = ['## LLM golden-set eval', '', `Model: \`${model}\``, '', '| Case | Result | Runs OK |', '|---|---|---|', ...rows.map((r) => `| ${r.name} | ${r.ok ? '✅' : '❌'} | ${r.passed}/${r.runs} (need ${r.needed}) |`)].join('\n')
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n')
process.exit(rows.every((r) => r.ok) ? 0 : 1)
