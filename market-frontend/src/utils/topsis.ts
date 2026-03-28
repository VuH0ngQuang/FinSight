import type { StockDetailResponse } from '../services/stockDetail'

export const CRITERIA = ['ddm', 'dcf', 'ri', 'pe', 'pbv', 'pcf', 'ps'] as const
export type Criterion = (typeof CRITERIA)[number]
export const DEFAULT_WEIGHTS: number[] = Array(7).fill(1 / 7)

export interface TopsisRow {
  symbol: string
  metrics: Record<Criterion, number>
}

const sanitize = (v?: number | null) =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0

export const buildMetrics = (detail?: StockDetailResponse): Record<Criterion, number> => {
  const price = sanitize(detail?.matchPrice)
  const latestYearData = detail?.yearData
    ? Object.entries(detail.yearData)
        .map(([y, d]) => ({ year: Number(y), d }))
        .filter(({ year }) => Number.isFinite(year))
        .sort((a, b) => b.year - a.year)[0]?.d
    : undefined

  const ddm = sanitize(latestYearData?.ddm)
  const dcf = sanitize(latestYearData?.dcf)
  const ri = sanitize(latestYearData?.ri)

  const peRatio = sanitize(detail?.peRatio)
  const pbRatio = sanitize(detail?.pbRatio)
  const pcfRatio = sanitize(detail?.pcfRatio)
  const psRatio = sanitize(detail?.psRatio)

  const industryPe = sanitize(detail?.industryPeRatio)
  const industryPb = sanitize(detail?.industryPbRatio)
  const industryPcf = sanitize(detail?.industryPcfRatio)
  const industryPs = sanitize(detail?.industryPsRatio)

  return {
    // Match backend TOPSIS transforms:
    // DDM/DCF/RI -> intrinsicValue / currentPrice
    // PE/PB/PCF/PS -> industryRatio / stockRatio
    ddm: price > 0 && ddm > 0 ? ddm / price : 0,
    dcf: price > 0 && dcf > 0 ? dcf / price : 0,
    ri: price > 0 && ri > 0 ? ri / price : 0,
    pe: peRatio > 0 && industryPe > 0 ? industryPe / peRatio : 0,
    pbv: pbRatio > 0 && industryPb > 0 ? industryPb / pbRatio : 0,
    pcf: pcfRatio > 0 && industryPcf > 0 ? industryPcf / pcfRatio : 0,
    ps: psRatio > 0 && industryPs > 0 ? industryPs / psRatio : 0,
  }
}

export const computeTopsis = (
  rows: TopsisRow[],
  weights: number[] = DEFAULT_WEIGHTS,
): Map<string, number> => {
  if (rows.length === 0) return new Map()

  // Match backend eligibility: require at least two populated criteria.
  const eligibleRows = rows.filter((row) =>
    CRITERIA.reduce((count, c) => count + (row.metrics[c] > 0 ? 1 : 0), 0) >= 2,
  )
  if (eligibleRows.length === 0) return new Map()

  const denominators = CRITERIA.reduce((acc, criterion) => {
    const sumSq = eligibleRows.reduce((s, r) => s + r.metrics[criterion] ** 2, 0)
    acc[criterion] = sumSq > 0 ? Math.sqrt(sumSq) : 1
    return acc
  }, {} as Record<Criterion, number>)

  const weighted = eligibleRows.map((row) => {
    const w: Record<Criterion, number> = {} as Record<Criterion, number>
    CRITERIA.forEach((c, i) => {
      w[c] = (row.metrics[c] / denominators[c]) * (weights[i] ?? 1 / 7)
    })
    return { symbol: row.symbol, w }
  })

  const idealBest: Record<Criterion, number> = {} as Record<Criterion, number>
  const idealWorst: Record<Criterion, number> = {} as Record<Criterion, number>
  CRITERIA.forEach((c) => {
    const vals = weighted.map((r) => r.w[c])
    // All criteria are already transformed to benefit-type.
    idealBest[c] = Math.max(...vals)
    idealWorst[c] = Math.min(...vals)
  })

  const scores = new Map<string, number>()
  weighted.forEach(({ symbol, w }) => {
    let dBest = 0, dWorst = 0
    CRITERIA.forEach((c) => {
      dBest += (w[c] - idealBest[c]) ** 2
      dWorst += (w[c] - idealWorst[c]) ** 2
    })
    const sp = Math.sqrt(dBest), sm = Math.sqrt(dWorst)
    const denom = sp + sm
    const rawScore = denom === 0 ? 0 : sm / denom
    const score = Math.round(rawScore * 10000) / 10000
    scores.set(symbol, Number.isFinite(score) ? score : 0)
  })

  return scores
}
