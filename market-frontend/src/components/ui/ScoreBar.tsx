const ScoreBar = ({ score, showLabel = true }: { score: number; showLabel?: boolean }) => {
  const pct = Math.min(Math.max(score, 0), 1) * 100
  const color = score >= 0.7 ? 'bg-emerald-500' : score >= 0.4 ? 'bg-amber-500' : 'bg-red-500'
  const textColor = score >= 0.7 ? 'text-emerald-700' : score >= 0.4 ? 'text-amber-700' : 'text-red-700'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className={`text-xs font-mono font-semibold w-10 text-right ${textColor}`}>
          {score.toFixed(3)}
        </span>
      )}
    </div>
  )
}

export default ScoreBar
