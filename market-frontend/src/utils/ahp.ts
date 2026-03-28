export const CRITERIA_LABELS = ['DDM', 'DCF', 'RI', 'P/B', 'P/E', 'P/CF', 'P/S']
const N = 7

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
