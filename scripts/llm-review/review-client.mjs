// Calls the Gemini API and returns a *validated* review, retrying transient
// errors and malformed output. Network functions are injectable for tests.
import { RESPONSE_SCHEMA, SYSTEM_PROMPT, buildUserMessage, parseModelJson, validateReview } from './review-lib.mjs'

export class ReviewUnavailable extends Error {}

class ApiError extends Error {
  constructor(message, { retryable = false, status } = {}) {
    super(message)
    this.retryable = retryable
    this.status = status
  }
}

const RETRYABLE = new Set([429, 500, 502, 503, 504])
const defaultSleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function callGemini({ apiKey, model, user, useSchema, fetchImpl }) {
  // Key goes in a header (not the URL) so it cannot leak into logs or proxies.
  const res = await fetchImpl(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.2,
          responseMimeType: 'application/json',
          ...(useSchema ? { responseSchema: RESPONSE_SCHEMA } : {}),
        },
      }),
      signal: AbortSignal.timeout(120_000),
    },
  )
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(`Gemini API (${model}) returned ${res.status}: ${body?.error?.status ?? 'unknown_error'}`, {
      retryable: RETRYABLE.has(res.status),
      status: res.status,
    })
  }
  const data = await res.json()
  if (data.promptFeedback?.blockReason) throw new ApiError(`Gemini blocked the prompt: ${data.promptFeedback.blockReason}`)
  const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('\n').trim()
  if (!text) throw new ApiError(`Gemini API (${model}) returned no text content`, { retryable: true })
  return text
}

export async function reviewDiff({
  apiKey,
  model,
  fallbackModel,
  diff,
  truncated = false,
  fetchImpl = fetch,
  sleep = defaultSleep,
  log = console.log,
  attemptsPerModel = 3,
  backoffMs = 10_000,
}) {
  const user = buildUserMessage(diff, truncated)
  const models = fallbackModel && fallbackModel !== model ? [model, fallbackModel] : [model]
  let useSchema = true
  let lastErr
  for (const m of models) {
    for (let attempt = 1; attempt <= attemptsPerModel; attempt++) {
      try {
        const text = await callGemini({ apiKey, model: m, user, useSchema, fetchImpl })
        const parsed = parseModelJson(text)
        if (!parsed.ok) throw new ApiError(parsed.error, { retryable: true })
        const checked = validateReview(parsed.value)
        if (!checked.ok) throw new ApiError(`Invalid review JSON: ${checked.errors.slice(0, 3).join('; ')}`, { retryable: true })
        return { review: checked.value, model: m }
      } catch (err) {
        lastErr = err
        log(`Attempt ${attempt}/${attemptsPerModel} with ${m} failed: ${err.message}`)
        if (err.status === 400 && useSchema) {
          useSchema = false // the API may reject the schema subset; fall back to JSON mode + code validation
          log('Retrying without responseSchema (code-side validation still applies).')
          continue
        }
        if (!err.retryable) break
        if (attempt < attemptsPerModel) await sleep(attempt * backoffMs)
      }
    }
  }
  throw new ReviewUnavailable(lastErr?.message ?? 'unknown error')
}
