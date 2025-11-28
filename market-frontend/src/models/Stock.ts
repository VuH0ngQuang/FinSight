export type StockProps = {
  stockId: string
  stockName: string
  sector: string
  matchPrice: number
  peRatio: number
  pbRatio: number
  pcfRatio: number
  psRatio: number
  industryPeRatio?: number
  industryPbRatio?: number
  industryPcfRatio?: number
  industryPsRatio?: number
  overallScore?: number
  scoreClass?: string
}

export class Stock {
  readonly stockId: string
  readonly stockName: string
  readonly sector: string
  readonly matchPrice: number
  readonly peRatio: number
  readonly pbRatio: number
  readonly pcfRatio: number
  readonly psRatio: number
  readonly industryPeRatio: number
  readonly industryPbRatio: number
  readonly industryPcfRatio: number
  readonly industryPsRatio: number
  readonly overallScore: number
  readonly scoreClass?: string
  readonly symbol: string

  constructor(props: StockProps) {
    this.stockId = props.stockId.toUpperCase()
    this.symbol = this.stockId
    this.stockName = props.stockName
    this.sector = props.sector
    this.matchPrice = props.matchPrice
    this.peRatio = props.peRatio
    this.pbRatio = props.pbRatio
    this.pcfRatio = props.pcfRatio
    this.psRatio = props.psRatio
    this.industryPeRatio = props.industryPeRatio ?? props.peRatio
    this.industryPbRatio = props.industryPbRatio ?? props.pbRatio
    this.industryPcfRatio = props.industryPcfRatio ?? props.pcfRatio
    this.industryPsRatio = props.industryPsRatio ?? props.psRatio
    this.overallScore = props.overallScore ?? 0
    this.scoreClass = props.scoreClass
  }

  get stockNameDisplay() {
    return this.stockName || this.stockId
  }

  get name() {
    return this.stockNameDisplay
  }

  get pb() {
    return this.pbRatio
  }

  get pcf() {
    return this.pcfRatio
  }

  get pe() {
    return this.peRatio
  }

  get ps() {
    return this.psRatio
  }

  get industryAverage() {
    return (
      (this.industryPeRatio +
        this.industryPbRatio +
        this.industryPcfRatio +
        this.industryPsRatio) /
      4
    )
  }

  get valuationGap() {
    return this.overallScore - Math.round(this.industryAverage || 0)
  }
}

