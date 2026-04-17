'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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

// ─── Shared style constants ────────────────────────────────────────────────────

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '20px',
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const fillColor =
    score >= 85 ? '#dc2626' : score >= 70 ? '#f97316' : '#eab308'
  const textColor =
    score >= 85 ? '#f87171' : score >= 70 ? '#fb923c' : '#facc15'

  return (
    <div className="flex items-center gap-3 w-full">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, background: fillColor }}
        />
      </div>
      <span
        className="text-xs font-bold tabular-nums min-w-[2rem] text-right"
        style={{ color: textColor }}
      >
        {score}
      </span>
    </div>
  )
}

function TariffBadge({ risk }: { risk: TariffInfo }) {
  const styles = {
    HIGH: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', color: '#f87171' },
    MEDIUM: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24' },
    LOW: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', color: '#34d399' },
  }
  const s = styles[risk.level]

  return (
    <div
      className="mt-4 p-3 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-1 duration-300"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: s.color }} />
      <div>
        <span
          className="text-[10px] font-bold uppercase tracking-wider block mb-1"
          style={{ color: s.color }}
        >
          Tariff Risk: {risk.level}
        </span>
        <p className="text-xs leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {risk.note}
        </p>
      </div>
    </div>
  )
}

function ProvinceNote({ province, marketName }: { province: string; marketName: string }) {
  const note = PROVINCE_CONTEXT[province]?.[marketName]
  if (!note) return null

  return (
    <div
      className="mt-3 p-3 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-1 duration-400"
      style={{
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.15)',
      }}
    >
      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#60a5fa' }} />
      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
        <strong className="font-semibold" style={{ color: '#93c5fd' }}>
          From {province}:
        </strong>{' '}
        {note}
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
    <div
      className="overflow-hidden p-5 animate-in fade-in slide-in-from-bottom-4 transition-all duration-500"
      style={{
        ...glass,
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'both',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '1px solid rgba(0,240,255,0.25)'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3), 0 0 20px rgba(0,240,255,0.04)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Header row */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {market.flag && <span className="text-xl">{market.flag}</span>}
            <h3 className="text-lg font-bold tracking-tight text-white">{market.name}</h3>
          </div>
          {market.pop && (
            <p
              className="text-[10px] uppercase tracking-widest font-medium"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
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

      <p className="mt-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {market.note}
      </p>

      {province && <ProvinceNote province={province} marketName={market.name} />}
      {tariff && <TariffBadge risk={tariff} />}
    </div>
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
    }).catch(() => {})

    setTimeout(() => {
      document.getElementById('results-header')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const allMarkets = data ? (activeTab === 'domestic' ? data.domestic : data.international) : []
  const visibleMarkets = allMarkets.filter((m) => !(hideUS && m.usMarket))

  // Input style for selects
  const triggerStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: '12px',
    height: '48px',
  }

  return (
    <div
      className="min-h-screen py-16 px-4 sm:px-6 lg:px-8"
      data-theme="dark"
      style={{ color: '#fff' }}
    >
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Header ── */}
        <header className="text-center space-y-5 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2"
            style={{
              background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.2)',
            }}
          >
            <Globe className="w-7 h-7" style={{ color: '#f87171' }} />
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
            Canadian Trade <span style={{ color: '#f87171' }}>Compass</span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
            Real-time trade intelligence for Canadian exporters. Identify the best domestic and
            international markets for your specific sector.
          </p>
        </header>

        {/* ── Search Controls ── */}
        <div
          className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
          style={{ ...glass, animationFillMode: 'both' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Industry */}
            <div className="space-y-2">
              <Label
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
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
                <SelectTrigger className="border focus:ring-red-600 focus:ring-1 focus:ring-offset-0" style={triggerStyle}>
                  <SelectValue placeholder="Select your industry..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind} className="text-white focus:bg-zinc-800 focus:text-white">
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Province */}
            <div className="space-y-2">
              <Label
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Your Province
              </Label>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="border focus:ring-red-600 focus:ring-1 focus:ring-offset-0" style={triggerStyle}>
                  <SelectValue placeholder="All Provinces" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectItem value="null_all" className="text-white focus:bg-zinc-800 focus:text-white">
                    All Provinces
                  </SelectItem>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p} className="text-white focus:bg-zinc-800 focus:text-white">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Controls row */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Hide US toggle */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setHideUS(!hideUS)}
            >
              <Checkbox
                id="hide-us"
                checked={hideUS}
                onCheckedChange={() => setHideUS(!hideUS)}
                className="w-5 h-5 rounded-md border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 data-[state=checked]:text-white"
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor="hide-us"
                  className={cn(
                    'text-sm font-bold uppercase tracking-tight cursor-pointer',
                    hideUS ? 'text-red-400' : 'text-white/70',
                  )}
                >
                  {hideUS ? '🚫 US Markets Hidden' : 'Hide US Markets'}
                </Label>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Focus on non-US diversification
                </p>
              </div>
            </div>

            {/* Find button */}
            <button
              onClick={handleFind}
              disabled={!selectedIndustry}
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-8 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Find Best Markets <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Results ── */}
        {hasSearched && data && (
          <div className="space-y-6">

            {/* US Dependency Alert */}
            {isUSDependentSector && (
              <div
                className="p-5 rounded-2xl flex gap-4 animate-in slide-in-from-left-4 duration-500"
                style={{
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.1)' }}
                >
                  <AlertTriangle className="w-5 h-5" style={{ color: '#f87171' }} />
                </div>
                <div className="space-y-1">
                  <h4
                    className="font-bold text-sm uppercase tracking-wider"
                    style={{ color: '#fca5a5' }}
                  >
                    High US Dependency Warning
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <strong className="text-white">{selectedIndustry}</strong> relies heavily on
                    the US market. Given current trade volatility, we recommend exploring the
                    &ldquo;Hide US Markets&rdquo; pivot options.
                  </p>
                </div>
              </div>
            )}

            {/* Results header */}
            <div
              id="results-header"
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: '#f87171' }} />
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase">
                    {selectedIndustry}
                  </h2>
                </div>
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  Ranked by opportunity score · Trade volume, FTA access & Alignment
                </p>
              </div>

              {/* Tab switcher */}
              <div
                className="flex p-1 rounded-xl w-fit"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
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
                        ? 'text-red-400'
                        : 'hover:text-white/70',
                    )}
                    style={
                      activeTab === key
                        ? { background: 'rgba(255,255,255,0.07)', color: '#f87171' }
                        : { color: 'rgba(255,255,255,0.35)' }
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div
              className="flex flex-wrap items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-widest mr-2"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Agreements:
              </span>
              {[
                { name: 'CUSMA', color: '#34d399' },
                { name: 'CPTPP', color: '#60a5fa' },
                { name: 'CETA/CUKTCA', color: '#fbbf24' },
                { name: 'CKFTA', color: '#c084fc' },
              ].map((ta) => (
                <span
                  key={ta.name}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-sm border uppercase tracking-tight"
                  style={{ borderColor: `${ta.color}40`, color: ta.color, background: `${ta.color}10` }}
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

            {/* Results grid */}
            {visibleMarkets.length === 0 ? (
              <div
                className="text-center py-20 rounded-3xl space-y-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)' }}
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <AlertTriangle className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                    No Markets Found
                  </h3>
                  <p className="text-sm" style={{ color: '#64748b' }}>
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

            {/* CTA */}
            {showCTA && (
              <div
                className="mt-12 overflow-hidden relative rounded-3xl p-8 md:p-12 animate-in fade-in zoom-in-95 duration-700 fill-both"
                style={{
                  background: 'rgba(3,5,10,0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 0 80px rgba(220,38,38,0.06)',
                }}
              >
                {/* Faint background glyph */}
                <div
                  className="absolute top-0 right-0 p-8 rotate-12 pointer-events-none"
                  style={{ opacity: 0.08 }}
                >
                  <ShieldCheck className="w-64 h-64" style={{ color: '#dc2626' }} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="max-w-xl space-y-4 text-center md:text-left">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                      style={{
                        background: 'rgba(220,38,38,0.08)',
                        border: '1px solid rgba(220,38,38,0.2)',
                        color: '#f87171',
                      }}
                    >
                      Inspiria Designs · Specialized Strategy
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                      Scale your business in{' '}
                      <span style={{ color: '#f87171' }}>new markets</span>
                    </h3>
                    <p className="text-base leading-relaxed" style={{ color: '#94a3b8' }}>
                      We help Canadian exporters build the digital presence and automated systems
                      needed to compete globally. Whether pivoting from the US or scaling
                      domestically, we provide the technical edge.
                    </p>
                    <div className="pt-2">
                      <p className="font-bold flex items-center justify-center md:justify-start gap-2 text-white">
                        <ShieldCheck className="w-5 h-5" style={{ color: '#f87171' }} />
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
                    <Link
                      href="/"
                      className="flex items-center justify-center h-14 font-bold uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-all hover:text-white"
                      style={{
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.color = '#fff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                      }}
                    >
                      Explore Our Work
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <footer
              className="mt-12 p-6 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p
                className="text-[11px] leading-relaxed italic"
                style={{ color: '#64748b' }}
              >
                <strong
                  className="not-italic uppercase tracking-tighter mr-1"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  Trade Intelligence Disclaimer:
                </strong>
                Opportunity scores reflect relative market potential based on early 2025 trade
                volume, FTA access, and demand trends. This is not financial or legal advice.
                Conditions may shift rapidly. Always verify with official sources:
                <a
                  href="https://www.tradecommissioner.gc.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-1 inline-flex items-center gap-0.5 hover:underline"
                  style={{ color: '#f87171' }}
                >
                  Trade Commissioner Service <ExternalLink className="w-2.5 h-2.5" />
                </a>{' '}
                and
                <a
                  href="https://www.international.gc.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-0.5 hover:underline"
                  style={{ color: '#f87171' }}
                >
                  Global Affairs Canada <ExternalLink className="w-2.5 h-2.5" />
                </a>
                .
              </p>
            </footer>
          </div>
        )}

        {/* ── Empty state ── */}
        {!hasSearched && (
          <div className="text-center py-24 space-y-6 animate-in fade-in zoom-in-95 duration-1000">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <MapPin className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div className="space-y-2">
              <h3
                className="font-bold uppercase tracking-[0.3em] text-xs"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Awaiting Input
              </h3>
              <p className="text-sm italic" style={{ color: '#64748b' }}>
                Select your industry above to begin identifying opportunities.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
