import { useState } from 'react'

// --- Types & Data ---

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

// --- Icons (Inline SVG for portability) ---

const SearchIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
)

const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
    </svg>
)

const BarChartIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" x2="12" y1="20" y2="10" />
        <line x1="18" x2="18" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
)

const ArrowUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
    </svg>
)

const ActivityIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
)

// --- Components ---

const MarketOverviewCard = ({ quote }: { quote: Quote }) => {
    const isPositive = quote.changePercent.includes('+')

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-white/10 group">
            {/* Ambient Glow */}
            <div className={`absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full blur-[80px] transition-opacity group-hover:opacity-75 ${isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10'} opacity-20`} />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${isPositive ? 'from-emerald-500/20 to-emerald-500/5 text-emerald-500' : 'from-rose-500/20 to-rose-500/5 text-rose-500'}`}>
                        <ActivityIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-400">{quote.symbol === 'VNINDEX' ? 'VN-INDEX' : quote.symbol}</h3>
                        <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">{isPositive ? 'Bullish Trend' : 'Bearish Trend'}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${isPositive ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                    }`}>
                    {isPositive && <ArrowUpIcon className="h-3 w-3" />}
                    {quote.changePercent}
                </div>
            </div>

            {/* Main Price */}
            <div className="relative z-10 mb-4">
                <div className="text-4xl font-bold text-white tracking-tight">{quote.price}</div>
                <div className={`flex items-center gap-2 mt-1 font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <span>{quote.changeValue} pts</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span className="text-slate-500 text-sm">Real-time</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 relative z-10 border-t border-white/5 pt-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Volume</span>
                    <span className="text-sm font-medium text-slate-300">{quote.volume}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Value</span>
                    <span className="text-sm font-medium text-slate-300">{quote.value}</span>
                </div>
                <div className="flex flex-col mt-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Day Range</span>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="text-rose-400">{quote.low}</span>
                        <div className="h-0.5 flex-1 bg-slate-800 rounded-full relative">
                            <div className="absolute inset-y-0 left-1/2 w-1/3 bg-slate-600 rounded-full" />
                        </div>
                        <span className="text-emerald-400">{quote.high}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end mt-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Adv/Dec/Unch</span>
                    <span className="text-sm font-medium text-amber-400">{quote.hand}</span>
                </div>
            </div>
        </div>
    )
}

const ChartContainer = ({ symbol = 'VNINDEX' }: { symbol?: string }) => (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/5 bg-[#0c0d0f] shadow-2xl group">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pointer-events-none">
            <div className="flex items-center gap-2">
                <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <BarChartIcon className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-300">{symbol} Technical Chart</span>
                </div>
            </div>
        </div>

        <div className="absolute inset-0 z-0 flex items-center justify-center text-slate-800/30">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-4 border-current border-t-transparent animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Loading Chart Data...</span>
            </div>
        </div>

        <iframe
            title="VNINDEX interactive chart"
            src={`https://ta.vietstock.vn/vds?lang=vi&stockcode=${symbol}`}
            className="relative z-10 h-full w-full border-0 opacity-0 transition-opacity duration-700 ease-out"
            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
            allowFullScreen
        />
    </div>
)

// --- Main Page ---

const DashBoard2 = () => {
    const [selectedSymbol, setSelectedSymbol] = useState('VNINDEX')
    const [searchTerm, setSearchTerm] = useState('')

    const filteredWatchlist = watchlist.filter(row =>
        row[0].label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex h-full w-full flex-col gap-6 lg:flex-row font-sans text-slate-100">

            {/* Left Column: Market Overview & Chart */}
            <div className="flex h-full min-w-0 flex-1 flex-col gap-6">

                {/* Header (Optional, if not covered by global nav) */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-white flex gap-2 items-center">
                        Market <span className="text-amber-500">Overview</span>
                    </h1>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Market Open
                    </div>
                </div>

                {/* Top Cards Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                    {quoteData.map((quote) => (
                        <MarketOverviewCard key={quote.symbol} quote={quote} />
                    ))}
                </div>

                {/* Chart Section */}
                <div className="flex-1 min-h-[500px] rounded-3xl p-1 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none" />
                    <ChartContainer symbol={selectedSymbol} />
                </div>
            </div>

            {/* Right Column: Watchlist */}
            <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-slate-900/80 shadow-2xl backdrop-blur-xl lg:w-[320px] xl:w-[380px]">
                {/* Sidebar Header */}
                <div className="flex flex-col gap-5 border-b border-white/5 p-6 bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-500 border border-amber-500/10">
                                <TrendingUpIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white leading-tight">Watchlist</h2>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Live Quotes</p>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-slate-500">{filteredWatchlist.length} Symbols</div>
                    </div>

                    {/* Search Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors">
                            <SearchIcon className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Filter symbols..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:border-amber-500/50 focus:bg-black/40 focus:ring-1 focus:ring-amber-500/20 hover:bg-black/30"
                        />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">
                        <span>Symbol</span>
                        <span>Last Price</span>
                    </div>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700/50 hover:scrollbar-thumb-slate-600/50 p-3">
                    <div className="flex flex-col space-y-1">
                        {filteredWatchlist.map((row, index) => {
                            const symbol = row[0].label
                            const price = row[1].label
                            const isActive = symbol === selectedSymbol

                            return (
                                <button
                                    key={`watch-${index}`}
                                    type="button"
                                    onClick={() => setSelectedSymbol(symbol)}
                                    className={`group relative flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200 border border-transparent ${isActive
                                            ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-amber-500/20 text-white shadow-lg shadow-amber-500/5'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-1.5 w-1.5 rounded-full ring-2 ring-offset-2 ring-offset-slate-900 transition-all ${isActive ? 'bg-amber-400 ring-amber-500/50' : 'bg-slate-600 ring-slate-700 group-hover:bg-slate-400'}`} />
                                        <span className="font-bold tracking-wide">{symbol}</span>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className={`font-mono font-bold ${isActive ? 'text-amber-400' : 'text-slate-300 group-hover:text-emerald-400'
                                            }`}>
                                            {price}
                                        </span>
                                        {isActive && <span className="text-[9px] text-amber-500/70 font-semibold uppercase tracking-wider">Viewing</span>}
                                    </div>
                                </button>
                            )
                        })}

                        {filteredWatchlist.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-500 opacity-50">
                                <SearchIcon className="h-8 w-8 mb-2" />
                                <span className="text-xs">No symbols found</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashBoard2
