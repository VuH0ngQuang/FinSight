import { useState } from 'react'

type CellValue = {
  label: string
  className?: string
}

const watchlist: CellValue[][] = [
  [{ label: 'TCB' }, { label: '32.40' }],
  [{ label: 'VPB' }, { label: '19.85' }],
  [{ label: 'MBB' }, { label: '21.70' }],
  [{ label: 'HDB' }, { label: '28.55' }],
  [{ label: 'LPB' }, { label: '15.20' }],
  [{ label: 'STB' }, { label: '25.10' }],
  [{ label: 'EIB' }, { label: '20.45' }],
  [{ label: 'VIB' }, { label: '27.30' }],
  [{ label: 'SHB' }, { label: '12.95' }],
  [{ label: 'OCB' }, { label: '19.60' }],
  [{ label: 'ABB' }, { label: '10.75' }],
  [{ label: 'NVB' }, { label: '9.85' }],
  [{ label: 'KLB' }, { label: '14.40' }],
  [{ label: 'MSB' }, { label: '17.95' }],
  [{ label: 'PGB' }, { label: '10.20' }],
  [{ label: 'BVB' }, { label: '22.15' }],
  [{ label: 'VAB' }, { label: '12.30' }],
  [{ label: 'SGB' }, { label: '8.95' }],
  [{ label: 'CTG' }, { label: '33.25' }],
  [{ label: 'TPB' }, { label: '26.45' }]
]

const DashBoard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('VNINDEX')

  return (
  // make sure the parent of this has a fixed height, e.g. h-screen on the page container
  <div className="flex h-full flex-row gap-6">
    {/* Left card */}
    <div className="h-full w-9/12 rounded-3xl bg-[#1d1e1f] p-6">
      <div className="flex h-full flex-col gap-4">
        <VietstockQuote />
        <div className="flex-1">
          <VietstockChart symbol={selectedSymbol} />
        </div>
      </div>
    </div>

    {/* Right card as a column so header stays fixed, list scrolls */}
    <div className="flex h-full w-3/12 flex-col rounded-3xl bg-[#1d1e1f] p-6">
      <div>
        <h1 className="mb-4 text-center text-2xl font-semibold tracking-tight">Watchlist</h1>
      </div>

      <div className="flex flex-row justify-between text-base text-slate-400">
        <div className="text-start">Symbol</div>
        <div className="text-end">Match price</div>
      </div>

      {/* Scrollable list area */}
      <div className="mt-2 min-h-0 overflow-y-auto scrollbar-hide text-sm font-semibold text-white">
        <div className="flex flex-col gap-0">
          {watchlist.map((row, index) => {
            const symbol = row[0].label
            const isActive = symbol === selectedSymbol
            return (
              <button
                key={`watch-${index}`}
                type="button"
                onClick={() => setSelectedSymbol(symbol)}
                className={`grid grid-cols-[1fr_auto] gap-4 border-b border-white/5 px-4 py-3 text-left last:border-b-0 ${
                  isActive ? 'bg-white/5' : 'hover:bg-white/10'
                }`}
              >
                <div className="text-start text-slate-200">{symbol}</div>
                <div className="text-end text-emerald-400">{row[1].label}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  </div>
  )
}

export default DashBoard

interface Quote {
  symbol: string
  price: string
  changePercent: string
  changeValue: string
  volume: string
  value: string
  hand: string
  high: string
  low: string
}

const quoteData: Quote[] = [
  {
    symbol: 'VNINDEX',
    price: '1,680.36',
    changePercent: '+1.20%',
    changeValue: '+20.00',
    volume: '794.45 Triệu CP',
    value: '24,853.77 Tỷ',
    hand: '243 (8)',
    high: '48',
    low: '79 (1)'
  },
  {
    symbol: 'VN30',
    price: '1,923.55',
    changePercent: '+0.73%',
    changeValue: '+13.95',
    volume: '348.84 Triệu CP',
    value: '14,123.83 Tỷ',
    hand: '24 (0)',
    high: '1',
    low: '5 (0)'
  }
]

const VietstockQuote = () => (
  <div className="flex flex-wrap gap-3">
    {quoteData.map((quote) => {
      return (
        <div
          key={quote.symbol}
          className={`flex-1 min-w-[210px] rounded-2xl border px-3 py-2 text-sm font-semibold text-white transition ${
            'border-white/10 bg-[#0c0d0f]/70'
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg uppercase tracking-wide leading-none">{quote.symbol}</span>
            <span className="text-emerald-400 text-xl font-bold leading-none">{quote.price}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-emerald-400 leading-none">
            <span>{quote.changePercent}</span>
            <span>{quote.changeValue}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-300 leading-none">
            <span>{quote.volume}</span>
            <span>|</span>
            <span>{quote.value}</span>
            <span>|</span>
            <span>{quote.hand}</span>
            <span>{quote.high}</span>
            <span>{quote.low}</span>
          </div>
        </div>
      )
    })}
  </div>
)

const VietstockChart = ({ symbol = 'VNINDEX' }: { symbol?: string }) => (
  <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d0f]/70">
    <iframe
      title="VNINDEX interactive chart"
      src={`https://ta.vietstock.vn/vds?lang=vi&stockcode=${symbol}`}
      className="h-full w-full border-0"
      loading="lazy"
      allowFullScreen
    />
  </div>
)
