import { NextRequest, NextResponse } from 'next/server'
import { COMTRADE_COUNTRY_EXPORTS_2024 } from '@/data/comtrade-country-exports'

const COMTRADE_BASE = 'https://comtradeapi.un.org/data/v1/get/C/A/HS'
const CANADA_CODE = '124'

// HS 2-digit chapter codes by industry — goods only (services have no HS code)
const INDUSTRY_HS_CODES: Record<string, string[]> = {
  'Agriculture & Food': ['02', '10', '12', '15', '16'],
  'Automotive & Parts': ['87'],
  'Construction & Building Materials': ['44', '72', '73'],
  'Energy & Resources': ['27'],
  'Fashion & Apparel': ['61', '62'],
  'Forestry & Lumber': ['44', '47'],
  'Healthcare & Medical': ['30'],
  'Manufacturing': ['84', '85'],
  'Mining & Metals': ['26', '74', '76'],
  'Software & Technology': ['85'],
  // Services — no HS codes, Comtrade doesn't cover these
  'Tourism & Hospitality': [],
  'Financial Services': [],
}

// UN Comtrade numeric country codes for the markets in our data
export const PARTNER_CODES: Record<string, string> = {
  'United States': '842',
  China: '156',
  Japan: '392',
  Germany: '276',
  'United Kingdom': '826',
  'South Korea': '410',
  Australia: '36',
  India: '356',
  Mexico: '484',
  Singapore: '702',
  France: '251',
  'Saudi Arabia': '682',
  'South Africa': '710',
  Brazil: '76',
}

// Returns the most recent year with a reasonable chance of being available
// Comtrade annual data typically lags ~1 year
function getTargetYear(): string {
  const currentYear = new Date().getFullYear()
  return String(currentYear - 2) // e.g. 2026 → 2023
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const industry = searchParams.get('industry')

  if (!industry) {
    return NextResponse.json({ error: 'industry param required' }, { status: 400 })
  }

  const hsCodes = INDUSTRY_HS_CODES[industry]

  // Services industries — return empty, not an error
  if (!hsCodes || hsCodes.length === 0) {
    return NextResponse.json({ tradeValues: {}, note: 'services_industry' })
  }

  const apiKey = process.env.COMTRADE_API_KEY
  if (!apiKey) {
    const staticData = COMTRADE_COUNTRY_EXPORTS_2024[industry]
    if (staticData) {
      return NextResponse.json({ tradeValues: staticData, period: '2024', source: 'static' })
    }
    return NextResponse.json({ tradeValues: {}, note: 'no_static_data' })
  }

  const partnerCodesStr = Object.values(PARTNER_CODES).join(',')
  const cmdCodesStr = hsCodes.join(',')
  const period = getTargetYear()

  const url = new URL(COMTRADE_BASE)
  url.searchParams.set('reporterCode', CANADA_CODE)
  url.searchParams.set('partnerCode', partnerCodesStr)
  url.searchParams.set('cmdCode', cmdCodesStr)
  url.searchParams.set('flowCode', 'X') // exports
  url.searchParams.set('period', period)
  url.searchParams.set('includeDesc', 'false')

  let res: Response
  try {
    res = await fetch(url.toString(), {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
      next: { revalidate: 86400 }, // cache for 24 hours — data only updates annually
    })
  } catch (err) {
    return NextResponse.json({ error: 'comtrade_fetch_failed' }, { status: 502 })
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return NextResponse.json(
      { error: 'comtrade_api_error', status: res.status, detail: text.slice(0, 200) },
      { status: 502 },
    )
  }

  const json = await res.json()

  // Build a map: countryName → total export value (USD)
  const countryCodeToName: Record<string, string> = Object.fromEntries(
    Object.entries(PARTNER_CODES).map(([name, code]) => [code, name]),
  )

  const tradeValues: Record<string, number> = {}

  for (const row of json.data ?? []) {
    const countryName = countryCodeToName[String(row.partnerCode)]
    if (!countryName) continue
    const value = Number(row.primaryValue ?? row.fobvalue ?? 0)
    tradeValues[countryName] = (tradeValues[countryName] ?? 0) + value
  }

  return NextResponse.json({ tradeValues, period, source: 'live' })
}
