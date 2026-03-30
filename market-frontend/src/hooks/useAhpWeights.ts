import { useState, useEffect } from 'react'
import { DEFAULT_WEIGHTS } from '../utils/topsis'
import { getAhpConfig } from '../services/api/ahpConfigApi'

const normalizeWeights = (raw: unknown): number[] | null => {
  if (!Array.isArray(raw) || raw.length !== 7) return null
  const values = raw.map((v) => Number(v))
  if (values.some((v) => !Number.isFinite(v) || v < 0)) return null
  const sum = values.reduce((s, v) => s + v, 0)
  if (sum <= 0) return null
  return values.map((v) => v / sum)
}

/** Loads saved AHP criterion weights for TOPSIS; falls back to equal weights. */
export function useAhpWeights(userId: string | undefined): number[] {
  const [weights, setWeights] = useState<number[]>(DEFAULT_WEIGHTS)

  useEffect(() => {
    if (!userId) {
      setWeights(DEFAULT_WEIGHTS)
      return
    }

    getAhpConfig(userId)
      .then((cfg) => {
        if (!cfg?.weightsJson) {
          setWeights(DEFAULT_WEIGHTS)
          return
        }
        try {
          const parsed = JSON.parse(cfg.weightsJson) as unknown
          setWeights(normalizeWeights(parsed) ?? DEFAULT_WEIGHTS)
        } catch {
          setWeights(DEFAULT_WEIGHTS)
        }
      })
      .catch(() => setWeights(DEFAULT_WEIGHTS))
  }, [userId])

  return weights
}
