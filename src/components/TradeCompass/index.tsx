'use client'

import React, { useState } from 'react'
import {
  INDUSTRIES,
  PROVINCES,
  PROVINCE_CONTEXT,
  TARIFF_RISK,
  MARKET_DATA,
  US_DEPENDENT_SECTORS,
  TRADE_AGREEMENTS,
  type Market,
  type TariffInfo,
} from './data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/utilities/ui'
import { LeadCaptureModal } from '@/components/LeadCaptureModal'
import {
  ExternalLink,
  MapPin,
  AlertTriangle,
  Globe,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const colorClass = score >= 85 ? 'bg-red-600' : score >= 70 ? 'bg-orange-500' : 'bg-yellow-500'
  const textColorClass =
    score >= 85 ? 'text-red-600' : score >= 70 ? 'text-orange-600' : 'text-yellow-600'

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', colorClass)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={cn('text-xs font-bold tabular-nums min-w-[2rem] text-right', textColorClass)}
      >
        {score}
      </span>
    </div>
  )
}

function TariffBadge({ risk }: { risk: TariffInfo }) {
  const styles = {
    HIGH: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400',
    MEDIUM:
      'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400',
    LOW: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400',
  }

  return (
    <div
      className={cn(
        'mt-4 p-3 border rounded-lg flex gap-3 items-start animate-in fade-in slide-in-from-top-1 duration-300',
        styles[risk.level],
      )}
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
          Tariff Risk: {risk.level}
        </span>
        <p className="text-xs leading-relaxed opacity-90 italic">{risk.note}</p>
      </div>
    </div>
  )
}

function ProvinceNote({ province, marketName }: { province: string; marketName: string }) {
  const note = PROVINCE_CONTEXT[province]?.[marketName]
  if (!note) return null

  return (
    <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 rounded-lg flex gap-3 items-start animate-in fade-in slide-in-from-top-1 duration-400">
      <MapPin className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
        <strong className="font-semibold">From {province}:</strong> {note}
      </p>
    </div>
  )
}

function MarketCard({
  market,
  type,
  index,
  industry,
  province,
}: {
  market: Market
  type: string
  index: number
  industry: string
  province: string
}) {
  const ta = type === 'international' ? TRADE_AGREEMENTS[market.name] : null
  const tariff = type === 'international' && industry ? TARIFF_RISK[industry]?.[market.name] : null

  return (
    <Card
      className="overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {market.flag && <span className="text-xl">{market.flag}</span>}
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {market.name}
              </h3>
            </div>
            {market.pop && (
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                Population: {market.pop}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {index === 0 && (
              <span className="px-2 py-0.5 bg-red-600 text-[10px] font-bold text-white rounded-sm tracking-tighter uppercase">
                Top Pick
              </span>
            )}
            {ta && (
              <span
                className="px-2 py-0.5 border text-[10px] font-semibold rounded-sm uppercase tracking-tight"
                style={{ borderColor: ta.color, color: ta.color }}
              >
                {ta.name}
              </span>
            )}
          </div>
        </div>

        <ScoreBar score={market.score} />

        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {market.note}
        </p>

        {province && <ProvinceNote province={province} marketName={market.name} />}
        {tariff && <TariffBadge risk={tariff} />}
      </CardContent>
    </Card>
  )
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────

export default function TradeCompass() {
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [activeTab, setActiveTab] = useState('international')
  const [hideUS, setHideUS] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showCTA, setShowCTA] = useState(false)

  const data = selectedIndustry ? MARKET_DATA[selectedIndustry] : null
  const isUSDependentSector = US_DEPENDENT_SECTORS.includes(selectedIndustry)

  const handleFind = () => {
    if (!selectedIndustry) return
    setHasSearched(true)
    setShowCTA(false)
    setTimeout(() => setShowCTA(true), 1500)

    fetch('/api/search-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry: selectedIndustry, province: selectedProvince, hideUS }),
    }).catch(() => {
      // Non-blocking — logging failure must never interrupt the user experience
    })

    // Scroll results into view
    setTimeout(() => {
      document.getElementById('results-header')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const allMarkets = data ? (activeTab === 'domestic' ? data.domestic : data.international) : []
  const visibleMarkets = allMarkets.filter((m) => !(hideUS && m.usMarket))

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl shadow-lg shadow-red-600/20 mb-2 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Canadian Trade <span className="text-red-600">Compass</span>
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Real-time trade intelligence for Canadian exporters. Identify the best domestic and
              international markets for your specific sector.
            </p>
          </div>
        </header>

        {/* Search Controls */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-both">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Industry / Sector
                </Label>
                <Select
                  value={selectedIndustry}
                  onValueChange={(val) => {
                    setSelectedIndustry(val)
                    setHasSearched(false)
                    setShowCTA(false)
                  }}
                >
                  <SelectTrigger className="h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-red-600">
                    <SelectValue placeholder="Select your industry..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Your Province
                </Label>
                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                  <SelectTrigger className="h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-red-600">
                    <SelectValue placeholder="All Provinces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null_all">All Provinces</SelectItem>
                    {PROVINCES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div
                className="flex items-center space-x-3 group cursor-pointer"
                onClick={() => setHideUS(!hideUS)}
              >
                <Checkbox
                  id="hide-us"
                  checked={hideUS}
                  onCheckedChange={() => setHideUS(!hideUS)}
                  className="w-5 h-5 rounded-md border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />
                <div className="space-y-0.5">
                  <Label
                    htmlFor="hide-us"
                    className={cn(
                      'text-sm font-bold uppercase tracking-tight transition-colors cursor-pointer',
                      hideUS ? 'text-red-600' : 'text-zinc-700 dark:text-zinc-300',
                    )}
                  >
                    {hideUS ? '🚫 US Markets Hidden' : 'Hide US Markets'}
                  </Label>
                  <p className="text-xs text-zinc-500">Focus on non-US diversification</p>
                </div>
              </div>

              <Button
                onClick={handleFind}
                disabled={!selectedIndustry}
                className="w-full sm:w-auto h-12 px-8 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50"
              >
                Find Best Markets <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {hasSearched && data && (
          <div className="space-y-6">
            {/* US Dependency Alert */}
            {isUSDependentSector && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-5 rounded-2xl flex gap-4 animate-in slide-in-from-left-4 duration-500">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-red-900 dark:text-red-200 text-sm uppercase tracking-wider">
                    High US Dependency Warning
                  </h4>
                  <p className="text-sm text-red-800 dark:text-red-300/80 leading-relaxed">
                    <strong>{selectedIndustry}</strong> relies heavily on the US market. Given
                    current trade volatility, we recommend exploring the &ldquo;Hide US
                    Markets&rdquo; pivot options.
                  </p>
                </div>
              </div>
            )}

            {/* Results Header */}
            <div
              id="results-header"
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                    {selectedIndustry}
                  </h2>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Ranked by opportunity score · Trade volume, FTA access & Alignment
                </p>
              </div>

              <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl w-fit">
                {[
                  { key: 'international', label: 'International', icon: Globe },
                  { key: 'domestic', label: 'Domestic', icon: MapPin },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
                      activeTab === key
                        ? 'bg-white dark:bg-zinc-800 text-red-600 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend & Location Badge */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mr-2">
                Agreements:
              </span>
              {[
                {
                  name: 'CUSMA',
                  color:
                    'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900/50',
                },
                {
                  name: 'CPTPP',
                  color:
                    'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900/50',
                },
                {
                  name: 'CETA/CUKTCA',
                  color:
                    'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50',
                },
                {
                  name: 'CKFTA',
                  color:
                    'border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-900/50',
                },
              ].map((ta) => (
                <span
                  key={ta.name}
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-sm border uppercase tracking-tight',
                    ta.color,
                  )}
                >
                  {ta.name}
                </span>
              ))}
              {selectedProvince && selectedProvince !== 'null_all' && (
                <div className="ml-auto px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-blue-600/20">
                  <MapPin className="w-2.5 h-2.5" /> {selectedProvince} Logistics
                </div>
              )}
            </div>

            {/* Results Grid */}
            {visibleMarkets.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-zinc-900/30 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                    No Markets Found
                  </h3>
                  <p className="text-sm text-zinc-500">
                    All opportunities were filtered out. Try disabling the US filter.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleMarkets.map((market, i) => (
                  <MarketCard
                    key={market.name}
                    market={market}
                    type={activeTab}
                    index={i}
                    industry={selectedIndustry}
                    province={selectedProvince === 'null_all' ? '' : selectedProvince}
                  />
                ))}
              </div>
            )}

            {/* CTA Section */}
            {showCTA && (
              <div className="mt-12 overflow-hidden relative bg-zinc-900 dark:bg-black border border-zinc-800 rounded-3xl p-8 md:p-12 animate-in fade-in zoom-in-95 duration-700 fill-both shadow-2xl shadow-red-900/10">
                <div className="absolute top-0 right-0 p-8 opacity-40 rotate-12">
                  <ShieldCheck className="w-64 h-64 text-red-600" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="max-w-xl space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full text-red-500 text-[10px] font-bold uppercase tracking-widest">
                      Inspiria Designs · Specialized Strategy
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                      Scale your business in <span className="text-red-600">new markets</span>
                    </h3>
                    <p className="text-zinc-400 text-base leading-relaxed">
                      We help Canadian exporters build the digital presence and automated systems
                      needed to compete globally. Whether pivoting from the US or scaling
                      domestically, we provide the technical edge.
                    </p>
                    <div className="pt-2">
                      <p className="text-white font-bold flex items-center justify-center md:justify-start gap-2">
                        <ShieldCheck className="w-5 h-5 text-red-600" />
                        Free Trade Readiness Consultation
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full sm:w-auto min-w-[240px]">
                    <LeadCaptureModal
                      triggerLabel="Book Strategy Call"
                      triggerClassName="h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-red-600/20 active:scale-95 transition-all w-full"
                      source="trade-compass"
                    />
                    <Button
                      variant="outline"
                      asChild
                      className="h-14 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-all"
                    >
                      <a href="/" target="_blank" rel="noopener noreferrer">
                        Explore Our Work
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <footer className="mt-12 p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/30">
              <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                <strong className="text-zinc-700 dark:text-zinc-300 not-italic uppercase tracking-tighter mr-1">
                  Trade Intelligence Disclaimer:
                </strong>
                Opportunity scores reflect relative market potential based on early 2025 trade
                volume, FTA access, and demand trends. This is not financial or legal advice.
                Conditions may shift rapidly. Always verify with official sources:
                <a
                  href="https://www.tradecommissioner.gc.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-1 text-red-600 hover:underline inline-flex items-center gap-0.5"
                >
                  Trade Commissioner Service <ExternalLink className="w-2.5 h-2.5" />
                </a>{' '}
                and
                <a
                  href="https://www.international.gc.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-red-600 hover:underline inline-flex items-center gap-0.5"
                >
                  Global Affairs Canada <ExternalLink className="w-2.5 h-2.5" />
                </a>
                .
              </p>
            </footer>
          </div>
        )}

        {/* Empty state */}
        {!hasSearched && (
          <div className="text-center py-24 space-y-6 animate-in fade-in zoom-in-95 duration-1000">
            <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-zinc-200/50 dark:shadow-none flex items-center justify-center mx-auto border border-zinc-100 dark:border-zinc-800">
              <MapPin className="w-10 h-10 text-zinc-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-xs">
                Awaiting Input
              </h3>
              <p className="text-zinc-500 text-sm italic">
                Select your industry above to begin identifying opportunities.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
