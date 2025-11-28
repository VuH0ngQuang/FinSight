export type StockYearDataProps = {
  stockId: string
  year: number
  netIncome: number
  totalEquity: number
  intangibles: number
  operatingCashFlow: number
  freeCashFlow: number
  revenue: number
  dividendPerShare: number
  sharesOutstanding: number
  priceEndYear: number
  costOfEquity: number
  wacc: number
  dividendGrowthRate: number
  ddm: number
  dcf: number
  ri: number
  pe: number
  pbv: number
  pcf: number
  ps: number
}

export class StockYearData {
  readonly stockId: string
  readonly netIncome: number
  readonly totalEquity: number
  readonly intangibles: number
  readonly operatingCashFlow: number
  readonly freeCashFlow: number
  readonly revenue: number
  readonly dividendPerShare: number
  readonly sharesOutstanding: number
  readonly year: number
  readonly priceEndYear: number
  readonly costOfEquity: number
  readonly wacc: number
  readonly dividendGrowthRate: number
  readonly ddm: number
  readonly dcf: number
  readonly ri: number
  readonly pe: number
  readonly pbv: number
  readonly pcf: number
  readonly ps: number

  constructor(props: StockYearDataProps) {
    this.stockId = props.stockId.toUpperCase()
    this.netIncome = props.netIncome
    this.totalEquity = props.totalEquity
    this.intangibles = props.intangibles
    this.operatingCashFlow = props.operatingCashFlow
    this.freeCashFlow = props.freeCashFlow
    this.revenue = props.revenue
    this.dividendPerShare = props.dividendPerShare
    this.sharesOutstanding = props.sharesOutstanding
    this.year = props.year
    this.priceEndYear = props.priceEndYear
    this.costOfEquity = props.costOfEquity
    this.wacc = props.wacc
    this.dividendGrowthRate = props.dividendGrowthRate
    this.ddm = props.ddm
    this.dcf = props.dcf
    this.ri = props.ri
    this.pe = props.pe
    this.pbv = props.pbv
    this.pcf = props.pcf
    this.ps = props.ps
  }

  get earningsPerShare() {
    return this.sharesOutstanding ? this.netIncome / this.sharesOutstanding : 0
  }

  get bookValuePerShare() {
    return this.sharesOutstanding ? (this.totalEquity - this.intangibles) / this.sharesOutstanding : 0
  }

  get dividendYield() {
    return this.priceEndYear > 0 ? this.dividendPerShare / this.priceEndYear : 0
  }

  get priceToBook() {
    const bookValue = this.bookValuePerShare
    return bookValue > 0 ? this.priceEndYear / bookValue : 0
  }

  get cashFlowPerShare() {
    return this.sharesOutstanding ? this.operatingCashFlow / this.sharesOutstanding : 0
  }

  get freeCashFlowPerShare() {
    return this.sharesOutstanding ? this.freeCashFlow / this.sharesOutstanding : 0
  }

  get valuationSignal() {
    return Math.min(Math.max(this.priceEndYear / (this.ddm || 1), 0), 100)
  }
}

const createStockYearHistory = (entries: StockYearDataProps[]) => entries.map((props) => new StockYearData(props))

const acbHistory = createStockYearHistory([
  {
    stockId: 'ACB',
    year: 2024,
    netIncome: 16500,
    totalEquity: 180000,
    intangibles: 520,
    operatingCashFlow: 28000,
    freeCashFlow: 23000,
    revenue: 65000,
    dividendPerShare: 0.8,
    sharesOutstanding: 1200,
    priceEndYear: 28.5,
    costOfEquity: 0.13,
    wacc: 0.11,
    dividendGrowthRate: 0.06,
    ddm: 26,
    dcf: 29,
    ri: 33,
    pe: 9.1,
    pbv: 1.9,
    pcf: 6,
    ps: 2.4
  },
  {
    stockId: 'ACB',
    year: 2023,
    netIncome: 15200,
    totalEquity: 170000,
    intangibles: 500,
    operatingCashFlow: 26500,
    freeCashFlow: 21000,
    revenue: 62000,
    dividendPerShare: 0.65,
    sharesOutstanding: 1180,
    priceEndYear: 26.2,
    costOfEquity: 0.125,
    wacc: 0.105,
    dividendGrowthRate: 0.055,
    ddm: 24.5,
    dcf: 27.5,
    ri: 31,
    pe: 8.8,
    pbv: 1.85,
    pcf: 5.6,
    ps: 2.3
  },
  {
    stockId: 'ACB',
    year: 2022,
    netIncome: 13800,
    totalEquity: 161000,
    intangibles: 470,
    operatingCashFlow: 24000,
    freeCashFlow: 19000,
    revenue: 59000,
    dividendPerShare: 0.55,
    sharesOutstanding: 1160,
    priceEndYear: 24,
    costOfEquity: 0.12,
    wacc: 0.103,
    dividendGrowthRate: 0.05,
    ddm: 23,
    dcf: 26,
    ri: 30,
    pe: 8.5,
    pbv: 1.7,
    pcf: 5.1,
    ps: 2.2
  },
  {
    stockId: 'ACB',
    year: 2021,
    netIncome: 12200,
    totalEquity: 150500,
    intangibles: 440,
    operatingCashFlow: 22000,
    freeCashFlow: 17500,
    revenue: 56000,
    dividendPerShare: 0.44,
    sharesOutstanding: 1150,
    priceEndYear: 21.6,
    costOfEquity: 0.118,
    wacc: 0.1,
    dividendGrowthRate: 0.045,
    ddm: 21,
    dcf: 24,
    ri: 28,
    pe: 8.2,
    pbv: 1.6,
    pcf: 4.8,
    ps: 2.1
  }
])

const stockYearDataBySymbol: Record<string, StockYearData[]> = {
  ACB: acbHistory
}

export const getStockYearDataForSymbol = (symbol?: string) => {
  if (!symbol) {
    return []
  }

  return stockYearDataBySymbol[symbol.toUpperCase()] ?? []
}

export const getAvailableYearsForSymbol = (symbol?: string) =>
  getStockYearDataForSymbol(symbol).map((entry) => entry.year)

