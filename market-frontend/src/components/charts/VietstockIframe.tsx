import { useState } from 'react'

const VietstockIframe = ({ symbol = 'VNINDEX', height = 500 }: { symbol?: string; height?: number }) => {
  const [loaded, setLoaded] = useState(false)
  const src = `https://ta.vietstock.vn/vds?lang=vi&stockcode=${encodeURIComponent(symbol)}`

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50" style={{ height }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            <p className="text-xs">Loading chart for {symbol}…</p>
          </div>
        </div>
      )}
      <iframe
        src={src}
        title={`Technical chart for ${symbol}`}
        className={`h-full w-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        allow="fullscreen"
      />
    </div>
  )
}

export default VietstockIframe
