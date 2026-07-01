// Fetches Miami-Fort Lauderdale-West Palm Beach metro (BLS area code 33100)
// employment series from the BLS Public Data API and reduces them to a
// simple year-over-year percent change per sector.
//
// Requires BLS_API_KEY as a server-side Vercel environment variable — do
// NOT prefix it with VITE_, or it would be bundled into the public client
// JS. Get a free key at https://www.bls.gov/developers/.
const SERIES = [
  { id: 'SMU12331000000000001', label: 'Total Nonfarm Employment' },
  { id: 'SMU12331005000000001', label: 'Information Sector Employment' },
  { id: 'SMU12331006000000001', label: 'Professional & Business Services Employment' }
]

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export default async function handler(req, res) {
  const apiKey = process.env.BLS_API_KEY
  if (!apiKey) {
    res.status(200).json({ available: false, reason: 'BLS_API_KEY not configured', series: [] })
    return
  }

  const currentYear = new Date().getFullYear()

  try {
    const response = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesid: SERIES.map((s) => s.id),
        startyear: String(currentYear - 2),
        endyear: String(currentYear),
        registrationkey: apiKey
      })
    })

    if (!response.ok) {
      res.status(200).json({ available: false, reason: `BLS API returned ${response.status}`, series: [] })
      return
    }

    const data = await response.json()
    const series = (data?.Results?.series || []).map((s) => {
      const meta = SERIES.find((m) => m.id === s.seriesID)
      const points = [...(s.data || [])].sort((a, b) => {
        if (a.year !== b.year) return Number(b.year) - Number(a.year)
        return b.period.localeCompare(a.period)
      })
      const latest = points[0]
      const yearAgo = points.find(
        (p) => latest && Number(p.year) === Number(latest.year) - 1 && p.period === latest.period
      )
      const latestValue = toNumber(latest?.value)
      const yearAgoValue = toNumber(yearAgo?.value)
      const pctChange =
        latestValue != null && yearAgoValue ? ((latestValue - yearAgoValue) / yearAgoValue) * 100 : null

      return {
        id: s.seriesID,
        label: meta?.label ?? s.seriesID,
        latestValue,
        latestPeriod: latest ? `${latest.periodName} ${latest.year}` : null,
        pctChangeYoY: pctChange != null ? Math.round(pctChange * 10) / 10 : null
      }
    })

    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400')
    res.status(200).json({
      available: true,
      updatedAt: Date.now(),
      area: 'Miami-Fort Lauderdale-West Palm Beach, FL',
      series
    })
  } catch {
    res.status(200).json({ available: false, reason: 'fetch failed', series: [] })
  }
}
