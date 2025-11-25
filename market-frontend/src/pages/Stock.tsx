const headers = [
  'Symbol',
  'Match Price',
  'P/B ratio',
  'P/CF ratio',
  'P/E ratio',
  'P/S ratio',
  'Overall Score',
]

const multiLineHeaders: Record<string, string[]> = {
  'Overall Score': ['Overall', 'Score'],
}

const renderHeaderLabel = (header: string) => {
  const segments = multiLineHeaders[header] ?? [header]
  return segments.map((segment, index) => (
    <span key={`${header}-${segment}-${index}`} className="block leading-tight">
      {segment}
    </span>
  ))
}

type CellValue = {
  label: string
  className?: string
}

const priceboard: CellValue[][] = [
  [
    { label: 'ACB' },
    { label: '24.60' },
    { label: '1.51' },
    { label: '15.09' },
    { label: '7.52' },
    { label: '3.77' },
    { label: '48', className: 'text-emerald-400' },
  ],
  [
    { label: 'BAB' },
    { label: '12.50' },
    { label: '2.15' },
    { label: '11.30' },
    { label: '12.20' },
    { label: '6' },
    { label: '32', className: 'text-emerald-300' },
  ],
  [
    { label: 'BID' },
    { label: '37.65' },
    { label: '3.25' },
    { label: '9.18' },
    { label: '29.85' },
    { label: '14' },
    { label: '56', className: 'text-emerald-400' },
  ],
  [
    { label: 'CTG' },
    { label: '48.80' },
    { label: '4.20' },
    { label: '12.02' },
    { label: '11.80' },
    { label: '10' },
    { label: '61', className: 'text-emerald-400' },
  ],
  [
    { label: 'EIB' },
    { label: '24.10' },
    { label: '1.22' },
    { label: '8.41' },
    { label: '10.90' },
    { label: '5' },
    { label: '42', className: 'text-emerald-400' },
  ],
  [
    { label: 'HDB' },
    { label: '20.90' },
    { label: '1.72' },
    { label: '9.88' },
    { label: '15.12' },
    { label: '8' },
    { label: '51', className: 'text-emerald-300' },
  ],
  [
    { label: 'LPB' },
    { label: '17.45' },
    { label: '0.95' },
    { label: '7.02' },
    { label: '13.10' },
    { label: '4' },
    { label: '28', className: 'text-emerald-400' },
  ],
  [
    { label: 'MBB' },
    { label: '22.30' },
    { label: '1.88' },
    { label: '10.15' },
    { label: '9.45' },
    { label: '12' },
    { label: '64', className: 'text-emerald-400' },
  ],
  [
    { label: 'MSB' },
    { label: '18.10' },
    { label: '1.03' },
    { label: '8.14' },
    { label: '12.66' },
    { label: '6' },
    { label: '38', className: 'text-emerald-300' },
  ],
  [
    { label: 'NAB' },
    { label: '16.25' },
    { label: '0.88' },
    { label: '6.98' },
    { label: '15.41' },
    { label: '3' },
    { label: '21', className: 'text-emerald-400' },
  ],
  [
    { label: 'OCB' },
    { label: '19.75' },
    { label: '1.16' },
    { label: '9.05' },
    { label: '11.22' },
    { label: '9' },
    { label: '46', className: 'text-emerald-400' },
  ],
  [
    { label: 'PGB' },
    { label: '12.80' },
    { label: '0.67' },
    { label: '5.33' },
    { label: '9.50' },
    { label: '2' },
    { label: '19', className: 'text-emerald-300' },
  ],
  [
    { label: 'SSB' },
    { label: '30.10' },
    { label: '2.90' },
    { label: '11.28' },
    { label: '18.60' },
    { label: '15' },
    { label: '72', className: 'text-emerald-400' },
  ],
  [
    { label: 'TCB' },
    { label: '33.25' },
    { label: '3.10' },
    { label: '12.09' },
    { label: '14.33' },
    { label: '18' },
    { label: '89', className: 'text-emerald-400' },
  ],
  [
    { label: 'TPB' },
    { label: '21.40' },
    { label: '1.44' },
    { label: '9.50' },
    { label: '10.24' },
    { label: '7' },
    { label: '37', className: 'text-emerald-300' },
  ],
  [
    { label: 'VCB' },
    { label: '89.10' },
    { label: '4.40' },
    { label: '16.85' },
    { label: '22.74' },
    { label: '25' },
    { label: '112', className: 'text-emerald-400' },
  ],
  [
    { label: 'VIB' },
    { label: '20.60' },
    { label: '1.69' },
    { label: '10.12' },
    { label: '13.45' },
    { label: '11' },
    { label: '54', className: 'text-emerald-400' },
  ],
  [
    { label: 'VPB' },
    { label: '18.30' },
    { label: '1.08' },
    { label: '7.33' },
    { label: '10.82' },
    { label: '6' },
    { label: '41', className: 'text-emerald-300' },
  ],
  [
    { label: 'ABB' },
    { label: '12.10' },
    { label: '0.55' },
    { label: '4.80' },
    { label: '7.20' },
    { label: '1' },
    { label: '12', className: 'text-emerald-400' },
  ],
  [
    { label: 'SHB' },
    { label: '11.90' },
    { label: '0.43' },
    { label: '4.01' },
    { label: '6.55' },
    { label: '2' },
    { label: '17', className: 'text-emerald-400' },
  ],
  [
    { label: 'KLB' },
    { label: '10.50' },
    { label: '0.39' },
    { label: '3.18' },
    { label: '5.21' },
    { label: '1' },
    { label: '14', className: 'text-emerald-300' },
  ],
  [
    { label: 'VAB' },
    { label: '9.70' },
    { label: '0.25' },
    { label: '3.14' },
    { label: '4.82' },
    { label: '1' },
    { label: '11', className: 'text-emerald-400' },
  ],
  [
    { label: 'NVB' },
    { label: '14.65' },
    { label: '0.80' },
    { label: '5.60' },
    { label: '7.50' },
    { label: '3' },
    { label: '22', className: 'text-emerald-400' },
  ],
  [
    { label: 'PVB' },
    { label: '16.80' },
    { label: '1.05' },
    { label: '6.44' },
    { label: '9.20' },
    { label: '4' },
    { label: '27', className: 'text-emerald-300' },
  ]
]


const Stock = () => {
  return (
    <section className="space-y-6 text-white">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Priceboard</h1>
        </div>
      </header>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#212121] shadow-[0_35px_90px_rgba(0,0,0,0.65)]">
        <div
          className="grid text-[0.75rem] font-semibold uppercase tracking-[0.35em] text-white justify-center items-center"
          style={{
            gridTemplateColumns: `repeat(${headers.length}, minmax(60px, 1fr))`,
          }}
        >
          {headers.map((header) => (
            <div
              key={header}
              className="border-b border-white/5 px-4 py-3 text-center whitespace-normal break-words last:border-r-0 flex flex-col justify-center min-h-[56px]"
            >
              {renderHeaderLabel(header)}
            </div>
          ))}
        </div>

        <div className="bg-[#212121] max-h-[650px] overflow-y-auto">
          {priceboard.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid border-b border-white/5 text-sm font-semibold text-white justify-center items-center`}
              style={{
                gridTemplateColumns: `repeat(${row.length}, minmax(60px, 1fr))`,
              }}
            >
              {row.map((cell) => (
                <div
                  key={`${cell.label}-${cell.className ?? ''}`}
                  className={`px-4 py-3 text-center ${cell.className ?? ''}`}
                >
                  {cell.label}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stock