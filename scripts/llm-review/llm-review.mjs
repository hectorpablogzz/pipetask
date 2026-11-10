// PR gate: sends the diff to Gemini, validates the structured response, and
// fails the job only if a *verified* high-severity finding exists.
// The diff is untrusted data. Nothing from it or from the model is executed.
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { MAX_DIFF_CHARS, assess, escapeCommandData, escapeCommandProperty, renderMarkdown } from './review-lib.mjs'
import { ReviewUnavailable, reviewDiff } from './review-client.mjs'

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash'
// Comma-separated list, tried in order after the primary model.
const fallbackModels = (process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite,gemini-3.6-flash').split(',').map((m) => m.trim()).filter(Boolean)
const strict = process.env.REVIEW_STRICT === 'true' // fail the job if the review cannot be completed
const { BASE_SHA: base, HEAD_SHA: head, GITHUB_STEP_SUMMARY: summaryFile } = process.env

const summary = (md) => summaryFile && appendFileSync(summaryFile, md + '\n')

function unavailable(msg) {
  console.log(`::${strict ? 'error' : 'warning'}::${escapeCommandData(msg)}`)
  summary(`## LLM review\n\n⚠️ ${msg}${strict ? '\n\nStrict mode: failing.' : '\n\nAdvisory fallback: the gate did not run.'}`)
  process.exit(strict ? 1 : 0)
}

if (!apiKey) unavailable('GEMINI_API_KEY is not available (e.g. PR from a fork or secret not configured). LLM review skipped.')
if (!/^[0-9a-f]{40}$/.test(base ?? '') || !/^[0-9a-f]{40}$/.test(head ?? '')) {
  console.error('BASE_SHA and HEAD_SHA must be full commit SHAs')
  process.exit(1)
}

let diff = execFileSync(
  'git',
  ['diff', '--unified=3', `${base}...${head}`, '--', '.', ':(exclude)package-lock.json', ':(exclude)_bmad-output', ':(exclude)_bmad', ':(exclude).agents', ':(exclude).claude'],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
)
if (!diff.trim()) {
  console.log('No reviewable changes in diff.')
  summary('## LLM review\n\nNo reviewable changes in this diff.')
  process.exit(0)
}
const truncated = diff.length > MAX_DIFF_CHARS
if (truncated) diff = diff.slice(0, MAX_DIFF_CHARS)

let result
try {
  result = await reviewDiff({ apiKey, model, fallbackModels, diff, truncated })
} catch (err) {
  if (err instanceof ReviewUnavailable) unavailable(`LLM review could not be completed: ${err.message}`)
  throw err
}

const a = assess(result.review, diff)
const markdown = renderMarkdown(a, { model: result.model, truncated })

// Model text may contain "::command::" lines; suspend workflow-command parsing while printing it.
const token = randomUUID()
console.log(`::stop-commands::${token}`)
console.log(`\n===== LLM review (${result.model}) =====\n\n${markdown}\n\n===== end of LLM review =====`)
console.log(`::${token}::`)

for (const f of a.blocking) {
  const loc = `file=${escapeCommandProperty(f.file)}${f.line ? `,line=${f.line}` : ''}`
  console.log(`::error ${loc}::${escapeCommandData(`${f.problem} Fix: ${f.fix}`)}`)
}
summary(markdown)

if (a.gateFailed) {
  console.log(`LLM gate FAILED: ${a.blocking.length} verified high-severity finding(s).`)
  process.exit(1)
}
console.log('LLM gate passed.')
