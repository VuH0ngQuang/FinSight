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
