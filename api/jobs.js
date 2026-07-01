// Aggregates real, publicly-exposed job openings from the Greenhouse,
// Lever, and Ashby applicant-tracking-system APIs for a curated list of
// Miami-connected tech employers. These board endpoints are public by
// design (they power each company's own careers page) and need no API key.
//
// To track another employer: find their public careers page, confirm
// which ATS serves it, then add an entry below. The `id` must match an
// employer id in src/data/employers.js (or src/data/startups.js) so the
// client can attach live openings to the right map node — any id that
// doesn't match an existing node is simply ignored, so it's safe to add
// entries speculatively.
//
//   Greenhouse careers page embeds: boards.greenhouse.io/{token}
//   Lever careers page embeds:      jobs.lever.co/{token}
//   Ashby careers page embeds:      jobs.ashbyhq.com/{token}
const TRACKED_EMPLOYERS = [
  // Verified live at jobs.lever.co/moonpay — Miami-headquartered crypto/fintech.
  { id: 'moonpay', source: 'lever', token: 'moonpay' }
  // Add more here, e.g.:
  // { id: 'some-employer-id', source: 'greenhouse', token: 'someemployer' },
  // { id: 'some-startup-id', source: 'ashby', token: 'somestartup' },
]

const FETCH_TIMEOUT_MS = 6000

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchGreenhouse(token) {
  const data = await fetchWithTimeout(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=false`)
  if (!Array.isArray(data?.jobs)) return null
  return data.jobs.map((j) => ({ title: j.title, location: j.location?.name ?? null, url: j.absolute_url }))
}

async function fetchLever(token) {
  const data = await fetchWithTimeout(`https://api.lever.co/v0/postings/${token}?mode=json`)
  if (!Array.isArray(data)) return null
  return data.map((j) => ({ title: j.text, location: j.categories?.location ?? null, url: j.hostedUrl }))
}

async function fetchAshby(token) {
  const data = await fetchWithTimeout(`https://api.ashbyhq.com/posting-api/job-board/${token}`)
  if (!Array.isArray(data?.jobs)) return null
  return data.jobs.map((j) => ({ title: j.title, location: j.location ?? null, url: j.jobUrl }))
}

const FETCHERS = { greenhouse: fetchGreenhouse, lever: fetchLever, ashby: fetchAshby }

export default async function handler(req, res) {
  const settled = await Promise.allSettled(
    TRACKED_EMPLOYERS.map(async ({ id, source, token }) => {
      const roles = await FETCHERS[source](token)
      if (!roles) return null
      return { id, source, openRoles: roles.length, roles: roles.slice(0, 5) }
    })
  )

  const employers = settled
    .map((r) => (r.status === 'fulfilled' ? r.value : null))
    .filter(Boolean)

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.status(200).json({ updatedAt: Date.now(), employers })
}
