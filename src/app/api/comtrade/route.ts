import { NextRequest, NextResponse } from 'next/server'
import { COMTRADE_COUNTRY_EXPORTS_2024 } from '@/data/comtrade-country-exports'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const industry = searchParams.get('industry')

  if (!industry) {
    return NextResponse.json({ error: 'industry param required' }, { status: 400 })
  }

  // Services industries have no goods data
  const serviceIndustries = new Set(['Tourism & Hospitality', 'Financial Services'])
  if (serviceIndustries.has(industry)) {
    return NextResponse.json({ tradeValues: {}, note: 'services_industry' })
  }

  // Return static 2024 Comtrade data — live API disabled
  const staticData = COMTRADE_COUNTRY_EXPORTS_2024[industry]
  if (staticData) {
    return NextResponse.json({ tradeValues: staticData, period: '2024', source: 'static' })
  }

  return NextResponse.json({ tradeValues: {}, note: 'no_static_data' })
}
