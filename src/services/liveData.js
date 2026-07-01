// Thin client for the /api/jobs and /api/bls serverless functions. Every
// call is timeout-guarded and swallows its own errors (returns null rather
// than throwing), so a slow or down upstream API never breaks the app —
// the store simply keeps its static seed data.
const REQUEST_TIMEOUT_MS = 8000

async function getJSON(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/** Live job openings for tracked employers (Greenhouse/Lever/Ashby), via /api/jobs. */
export async function fetchLiveJobs() {
  const data = await getJSON('/api/jobs')
  return data?.employers ?? null
}

/** Miami-metro sector employment YoY trend from BLS, via /api/bls. */
export async function fetchEconPulse() {
  const data = await getJSON('/api/bls')
  return data?.available ? data : null
}
