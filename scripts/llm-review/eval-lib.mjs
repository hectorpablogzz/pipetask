// Property-based checks for golden-set cases. Asserts properties of the
// assessed result (is the PR blocked? which file? which keywords?), never exact text.
export function checkExpectations(expect, a) {
  const failures = []
  if (typeof expect.blocking === 'boolean' && a.gateFailed !== expect.blocking) {
    failures.push(`expected gate ${expect.blocking ? 'to fail' : 'to pass'} but it ${a.gateFailed ? 'failed' : 'passed'}`)
  }
  if (expect.blockingFile && !a.blocking.some((f) => f.file === expect.blockingFile)) {
    failures.push(`no verified high finding in ${expect.blockingFile}`)
  }
  if (expect.keywordsAny) {
    const text = a.findings.map((f) => `${f.problem} ${f.fix}`).join(' ').toLowerCase()
    if (!expect.keywordsAny.some((k) => text.includes(k.toLowerCase()))) failures.push(`none of the keywords found: ${expect.keywordsAny.join(', ')}`)
  }
  if (expect.verdictNot && a.verdict === expect.verdictNot) failures.push(`verdict must not be ${expect.verdictNot}`)
  return failures
}

// runOnce(diff) -> assessed result, or throws. A run that throws counts as a failed run.
export async function evaluateCase(def, diff, runOnce, { passRatio = 2 / 3 } = {}) {
  const runs = def.runs ?? 3
  const needed = Math.ceil(runs * passRatio)
  const results = []
  for (let i = 0; i < runs; i++) {
    try {
      const failures = checkExpectations(def.expect, await runOnce(diff))
      results.push({ ok: failures.length === 0, failures })
    } catch (err) {
      results.push({ ok: false, failures: [`run error: ${err.message}`] })
    }
  }
  const passed = results.filter((r) => r.ok).length
  return { name: def.name, runs, passed, needed, ok: passed >= needed, failures: results.flatMap((r) => r.failures) }
}
