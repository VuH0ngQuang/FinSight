export type StockYearDataProps = {
  stockId: string
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
    this.stockId = props.stockId
    this.netIncome = props.netIncome
    this.totalEquity = props.totalEquity
    this.intangibles = props.intangibles
    this.operatingCashFlow = props.operatingCashFlow
    this.freeCashFlow = props.freeCashFlow
    this.revenue = props.revenue
    this.dividendPerShare = props.dividendPerShare
    this.sharesOutstanding = props.sharesOutstanding
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

  get dividendYield() {
    return this.priceEndYear ? this.dividendPerShare / this.priceEndYear : 0
  }
}

