// Canada total goods trade — world aggregate
// Source: UN Comtrade, Annual HS, Canada (reporter 124), Partners: World
// Downloaded: March 2026 | Flows: Exports + Imports | All commodities (TOTAL)

export interface CanadaTradeYear {
  year: number
  exports: number
  imports: number
}

export const CANADA_TRADE_TOTALS: CanadaTradeYear[] = [
  { year: 2022, exports: 599941807666, imports: 571773402336 },
  { year: 2023, exports: 567344538003, imports: 558529223348 },
  { year: 2024, exports: 549622267634, imports: 540564723578 },
]

export const LATEST_TRADE_YEAR = CANADA_TRADE_TOTALS[CANADA_TRADE_TOTALS.length - 1]
