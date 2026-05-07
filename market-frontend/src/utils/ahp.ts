export const CRITERIA_LABELS = ['DDM', 'DCF', 'RI', 'P/B', 'P/E', 'P/CF', 'P/S']
const N = 7

// ─── Survey types ─────────────────────────────────────────────────────────────

export interface SurveyOption {
  label: string
  familyV: number
  familyM: number
  /** Additive tilts per criterion: [DDM, DCF, RI, P/B, P/E, P/CF, P/S] */
  tilts: number[]
}

export interface SurveyQuestion {
  id: string
  text: string
  options: SurveyOption[]
}

// ─── 6 questions ──────────────────────────────────────────────────────────────

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'horizon',
    text: 'How long do you typically hold a stock?',
    options: [
      { label: 'Less than 6 months (trade momentum)',  familyV: 0, familyM: 2, tilts: [0,0,0,0,1,0,1] },
      { label: '6–24 months (swing trading)',           familyV: 0, familyM: 1, tilts: [0,0,0,0,1,0,0] },
      { label: '2–5 years (growth investing)',          familyV: 1, familyM: 0, tilts: [0,1,0,0,0,1,0] },
      { label: 'More than 5 years (long-term value)',   familyV: 2, familyM: 0, tilts: [1,0,1,1,0,0,0] },
    ],
  },
  {
    id: 'income',
    text: 'Which return matters more to you?',
    options: [
      { label: 'Cash dividends now',                   familyV: 2, familyM: 0, tilts: [2,0,0,0,0,0,0] },
      { label: 'Capital gains from earnings growth',   familyV: 1, familyM: 0, tilts: [0,1,1,0,0,0,0] },
      { label: 'Quick price appreciation',             familyV: 0, familyM: 2, tilts: [0,0,0,0,1,0,1] },
      { label: "It doesn't matter",                    familyV: 0, familyM: 0, tilts: [0,0,0,0,0,0,0] },
    ],
  },
  {
    id: 'sector',
    text: 'Which best describes your typical pick?',
    options: [
      { label: 'Banks / financials / utilities',       familyV: 0, familyM: 0, tilts: [0,0,1,2,0,0,0] },
      { label: 'Mature industrials / consumer staples',familyV: 0, familyM: 0, tilts: [1,0,0,0,1,0,0] },
      { label: 'Tech / growth / SaaS',                 familyV: 0, familyM: 0, tilts: [0,2,0,0,0,0,1] },
      { label: 'Cyclicals / commodities',              familyV: 0, familyM: 0, tilts: [0,0,0,0,1,2,0] },
      { label: 'Mixed / no preference',                familyV: 0, familyM: 0, tilts: [0,0,0,0,0,0,0] },
    ],
  },
  {
    id: 'forecast',
    text: 'Do you trust multi-year cash-flow projections?',
    options: [
      { label: 'Yes — I model them myself',                familyV: 2, familyM: 0, tilts: [0,1,1,0,0,0,0] },
      { label: 'Somewhat — I trust analyst estimates',     familyV: 1, familyM: 0, tilts: [0,0,0,0,0,0,0] },
      { label: 'No — I prefer current reported numbers',   familyV: 0, familyM: 2, tilts: [0,0,0,1,1,0,0] },
    ],
  },
  {
    id: 'risk',
    text: 'If two stocks have the same expected return, you pick…',
    options: [
      { label: 'The one with stronger book value / assets', familyV: 0, familyM: 0, tilts: [0,0,1,2,0,0,0] },
      { label: 'The one with steady dividend history',      familyV: 0, familyM: 0, tilts: [2,0,0,0,0,0,0] },
      { label: 'The one with higher revenue growth',        familyV: 0, familyM: 0, tilts: [0,1,0,0,0,0,2] },
      { label: 'The one with cheapest cash-flow multiple',  familyV: 0, familyM: 0, tilts: [0,0,0,0,0,2,0] },
    ],
  },
  {
    id: 'earnings',
    text: 'How worried are you about accounting / earnings manipulation?',
    options: [
      { label: 'Very — I prefer cash-based metrics',        familyV: 0, familyM: 0, tilts: [0,1,0,0,0,2,0] },
      { label: 'Moderately — I cross-check ratios',         familyV: 0, familyM: 0, tilts: [0,0,0,1,1,0,0] },
      { label: 'Not really — earnings figures are fine',    familyV: 0, familyM: 0, tilts: [1,0,0,0,1,0,0] },
    ],
  },
]

// ─── Survey math ──────────────────────────────────────────────────────────────

/** Derive a raw score vector [DDM,DCF,RI,P/B,P/E,P/CF,P/S] from survey answers.
 *  answers[i] = chosen option index for question i; -1 means skipped. */
export const scoresFromAnswers = (answers: number[]): number[] => {
  const s = [1, 1, 1, 1, 1, 1, 1]
  let totalFamilyV = 0
  let totalFamilyM = 0

  answers.forEach((optIdx, qIdx) => {
    if (optIdx < 0) return
    const opt = SURVEY_QUESTIONS[qIdx]?.options[optIdx]
    if (!opt) return
    opt.tilts.forEach((t, i) => { s[i] += t })
    totalFamilyV += opt.familyV
    totalFamilyM += opt.familyM
  })

  const alpha = 1 + 0.25 * (totalFamilyV - totalFamilyM)
  const vMult = Math.max(alpha, 0.25)
  const mMult = Math.max(2 - alpha, 0.25)
  for (let i = 0; i <= 2; i++) s[i] *= vMult   // V-family: DDM, DCF, RI
  for (let i = 3; i <= 6; i++) s[i] *= mMult   // M-family: P/B, P/E, P/CF, P/S

  return s
}

const SAATY_SCALE = [1/9,1/8,1/7,1/6,1/5,1/4,1/3,1/2, 1, 2,3,4,5,6,7,8,9]

const snapToSaaty = (r: number): number => {
  if (r <= 0) return 1
  const logR = Math.log(r)
  return SAATY_SCALE.reduce((best, v) =>
    Math.abs(logR - Math.log(v)) < Math.abs(logR - Math.log(best)) ? v : best
  )
}

/** Build a Saaty-snapped pairwise matrix from a score vector (a_ij = s_i/s_j, snapped). */
export const matrixFromScores = (scores: number[]): number[][] => {
  const n = scores.length
  const m: number[][] = Array.from({ length: n }, () => Array(n).fill(1))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const snapped = snapToSaaty(scores[i] / scores[j])
      m[i][j] = snapped
      m[j][i] = 1 / snapped
    }
  }
  return m
}

/** Compute priority vector from a 7x7 AHP pairwise matrix via geometric mean method */
export const computeWeightsFromMatrix = (matrix: number[][]): number[] => {
  if (matrix.length !== N || matrix.some((row) => row.length !== N)) {
    return Array(N).fill(1 / N)
  }
  const geoMeans = matrix.map((row) => {
    const product = row.reduce((p, v) => p * (v > 0 ? v : 1), 1)
    return Math.pow(product, 1 / N)
  })
  const total = geoMeans.reduce((s, v) => s + v, 0)
  return geoMeans.map((v) => (total > 0 ? v / total : 1 / N))
}

/** Build a default identity-based matrix (all comparisons = 1) */
export const buildDefaultMatrix = (): number[][] =>
  Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => (i === j ? 1 : 1))
  )

/** Ensure matrix is consistent (mirror lower triangle from upper) */
export const syncMatrix = (matrix: number[][]): number[][] =>
  matrix.map((row, i) =>
    row.map((_, j) => {
      if (i === j) return 1
      if (j > i) return matrix[i][j]
      return matrix[j][i] > 0 ? 1 / matrix[j][i] : 1
    })
  )
