'use client'

import { useState } from 'react'
import { cn } from '@/utilities/ui'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Agriculture & Food',
  'Automotive & Parts',
  'Construction & Building Materials',
  'Energy & Resources',
  'Fashion & Apparel',
  'Financial Services',
  'Forestry & Lumber',
  'Healthcare & Medical',
  'Manufacturing',
  'Mining & Metals',
  'Software & Technology',
  'Tourism & Hospitality',
]

const PROVINCES = [
  'Ontario',
  'Quebec',
  'British Columbia',
  'Alberta',
  'Saskatchewan',
  'Manitoba',
  'Nova Scotia',
  'New Brunswick',
  'Newfoundland & Labrador',
  'Prince Edward Island',
]

const PROVINCE_CONTEXT: Record<string, Record<string, string>> = {
  'British Columbia': {
    Japan: 'Direct Pacific port access (Vancouver/Prince Rupert) — lowest shipping cost from BC.',
    China:
      "Vancouver is Canada's closest port to China; BC exporters have a natural logistics edge.",
    'South Korea':
      'Trans-Pacific shipping from BC ports is faster and cheaper than from Central Canada.',
    Australia: 'Pacific routes favour BC for shipping cost and transit times.',
    'United States':
      'Lower Mainland borders Washington State — road and rail access is seamless.',
  },
  Ontario: {
    'United States':
      'Windsor-Detroit and Niagara crossings are the busiest bilateral trade corridor in the world.',
    Germany: "Pearson Airport is Canada's largest air cargo hub for transatlantic freight.",
    'United Kingdom':
      'Strong air freight links; Toronto has the deepest UK business ties in Canada.',
    Mexico: 'Land corridors through the US make Ontario-Mexico trade well-established.',
  },
  Quebec: {
    'United Kingdom':
      'Montreal-London cargo routes well-established; Quebec aerospace supply chain is deeply connected.',
    Germany: 'Montreal Airbus/Bombardier connections create strong EU industrial ties.',
    'United States': 'Multiple border crossings via I-87/I-91 into New England and New York.',
    France: 'Cultural and language alignment; strong brand recognition for Quebec products.',
  },
  Alberta: {
    'United States': 'I-15 corridor to Montana/Idaho; pipeline and rail to Pacific and Gulf coasts.',
    Japan: 'Pacific rail to Vancouver then ship; well-established for energy and ag commodities.',
    'South Korea': 'Pacific corridor; strong Calgary-based energy sector relationships.',
    China: 'Rail to Vancouver then trans-Pacific; ag and energy both use this corridor heavily.',
  },
  Saskatchewan: {
    'United States':
      'Road and rail south through North Dakota and Montana; grain corridor well established.',
    China: 'Rail to Vancouver then ship; dominant route for potash and canola.',
    Japan: 'Pacific corridor via Vancouver; canola and uranium shipped this way.',
    India: 'Growing pulse and lentil trade via Pacific ports.',
  },
}

interface TariffInfo {
  level: 'HIGH' | 'MEDIUM' | 'LOW'
  note: string
}

const TARIFF_RISK: Record<string, Record<string, TariffInfo>> = {
  'Agriculture & Food': {
    'United States': {
      level: 'HIGH',
      note: 'Active tariffs on multiple ag categories; retaliatory measures in place',
    },
    China: {
      level: 'MEDIUM',
      note: 'Canola restrictions have been applied; political volatility adds uncertainty',
    },
    Japan: { level: 'LOW', note: 'CPTPP progressively eliminating ag tariffs' },
    'United Kingdom': {
      level: 'LOW',
      note: 'CETA-successor framework provides stable market access',
    },
    Mexico: { level: 'LOW', note: 'CUSMA protects most ag categories' },
    'South Korea': { level: 'LOW', note: 'CKFTA provides stable preferential access' },
  },
  'Forestry & Lumber': {
    'United States': {
      level: 'HIGH',
      note: 'Softwood lumber duties have persisted for decades; currently ~14%',
    },
    China: {
      level: 'MEDIUM',
      note: 'Trade tensions can affect access; diversification recommended',
    },
    Japan: { level: 'LOW', note: 'CPTPP provides strong tariff-free framework' },
    'South Korea': { level: 'LOW', note: 'CKFTA access is stable' },
    'United Kingdom': { level: 'LOW', note: 'Post-Brexit agreement maintains favourable access' },
    India: { level: 'MEDIUM', note: 'Higher base tariffs; no FTA in place' },
  },
  Manufacturing: {
    'United States': {
      level: 'HIGH',
      note: 'Section 232 metals tariffs active; CUSMA under renewed pressure',
    },
    Mexico: {
      level: 'LOW',
      note: 'CUSMA protects most manufactured goods if rules of origin are met',
    },
    Germany: { level: 'LOW', note: 'CETA provides tariff elimination on most industrial goods' },
    'United Kingdom': { level: 'LOW', note: 'Successor agreement preserves most CETA benefits' },
    Japan: { level: 'LOW', note: 'CPTPP progressively reducing tariffs' },
    China: { level: 'MEDIUM', note: 'No FTA; some sectors face significant Chinese tariffs' },
  },
  'Automotive & Parts': {
    'United States': {
      level: 'HIGH',
      note: 'Section 232 auto tariffs threatened; CUSMA rules of origin complex and contested',
    },
    Mexico: {
      level: 'MEDIUM',
      note: 'CUSMA rules of origin require high North American content; compliance risk',
    },
    Germany: {
      level: 'LOW',
      note: 'CETA provides access; EU auto standards require certification',
    },
    'South Korea': {
      level: 'LOW',
      note: 'CKFTA provides access; local content preferences exist',
    },
    Japan: {
      level: 'LOW',
      note: 'CPTPP covers automotive; Japan supply chain integration is strong',
    },
    'United Kingdom': {
      level: 'LOW',
      note: 'Post-Brexit framework in place; origin rules are manageable',
    },
  },
  'Energy & Resources': {
    'United States': {
      level: 'MEDIUM',
      note: 'Pipeline politics and regulatory uncertainty; energy itself often exempt but infrastructure is contested',
    },
    China: {
      level: 'MEDIUM',
      note: 'Political risk is real; LNG sales possible but relationships are complex',
    },
    Germany: { level: 'LOW', note: 'Urgent demand post-Russia; regulatory alignment improving' },
    Japan: { level: 'LOW', note: 'Long-term LNG contracts reduce risk; CPTPP supports trade' },
    'South Korea': {
      level: 'LOW',
      note: 'CKFTA and strong energy partnership create stable framework',
    },
    India: { level: 'LOW', note: 'No FTA but no active tariff disputes; growing relationship' },
  },
  'Mining & Metals': {
    'United States': {
      level: 'HIGH',
      note: 'Section 232 steel/aluminum tariffs active; critical mineral carveouts are limited',
    },
    China: {
      level: 'MEDIUM',
      note: 'Top buyer but geopolitical risk is high; export control scrutiny from Ottawa',
    },
    Japan: { level: 'LOW', note: 'CPTPP, strong relationships, no active disputes' },
    'South Korea': {
      level: 'LOW',
      note: 'CKFTA and battery supply chain partnerships are stable',
    },
    Germany: {
      level: 'LOW',
      note: 'CETA covers metals; EU critical mineral partnerships deepening',
    },
    India: { level: 'LOW', note: 'No active tariff disputes; emerging relationship' },
  },
  'Software & Technology': {
    'United States': {
      level: 'LOW',
      note: 'Services largely exempt from tariffs; data localization rules are the main risk',
    },
    'United Kingdom': {
      level: 'LOW',
      note: 'Digital trade chapter in successor agreement; regulatory alignment strong',
    },
    Germany: {
      level: 'LOW',
      note: 'GDPR compliance required; no tariff barriers on software',
    },
    Australia: { level: 'LOW', note: 'Strong digital trade alignment under CPTPP' },
    Japan: { level: 'LOW', note: 'CPTPP digital trade chapter provides strong framework' },
    India: {
      level: 'MEDIUM',
      note: 'Data localization laws and tech nationalism add uncertainty',
    },
  },
  'Healthcare & Medical': {
    'United States': {
      level: 'LOW',
      note: 'FDA pathway required but no active tariff barriers',
    },
    'United Kingdom': {
      level: 'LOW',
      note: 'MHRA certification required; trade access is stable',
    },
    Germany: {
      level: 'LOW',
      note: 'EU MDR compliance required; CETA provides tariff-free access',
    },
    Australia: { level: 'LOW', note: 'TGA regulatory pathway; CPTPP trade access is stable' },
    Japan: { level: 'LOW', note: 'PMDA approval required; CPTPP reduces most tariffs' },
    'Saudi Arabia': {
      level: 'MEDIUM',
      note: 'SFDA approval required; government procurement preference for local suppliers',
    },
  },
  'Construction & Building Materials': {
    'United States': {
      level: 'HIGH',
      note: 'Lumber ~14%, steel 25%, aluminum 10% tariffs all active — margins severely compressed',
    },
    'United Kingdom': {
      level: 'LOW',
      note: 'CETA successor provides stable access; CE marking may be required',
    },
    Australia: { level: 'LOW', note: 'CPTPP framework; Australian standards compliance needed' },
    Germany: {
      level: 'LOW',
      note: 'EU standards (CE) required; CETA tariff framework in place',
    },
    Japan: { level: 'LOW', note: 'JIS standards required; CPTPP reduces most tariffs' },
    'Saudi Arabia': {
      level: 'LOW',
      note: 'No FTA but no active disputes; SASO certification required',
    },
  },
  'Fashion & Apparel': {
    'United States': {
      level: 'MEDIUM',
      note: 'CUSMA rules of origin require yarn-forward criteria; unmet categories face tariffs',
    },
    'United Kingdom': {
      level: 'LOW',
      note: 'Successor agreement maintains CETA tariff preferences',
    },
    Australia: { level: 'LOW', note: 'CPTPP covers textiles; rules of origin are manageable' },
    Japan: {
      level: 'LOW',
      note: 'CPTPP provides framework; Japanese consumer standards are high',
    },
    Germany: { level: 'LOW', note: 'CETA covers most apparel; REACH chemical compliance required' },
    'South Korea': { level: 'LOW', note: 'CKFTA access; local distribution networks needed' },
  },
  'Financial Services': {
    'United States': {
      level: 'LOW',
      note: 'Heavy regulatory compliance required (SEC, FINRA); no tariffs on services',
    },
    'United Kingdom': {
      level: 'LOW',
      note: 'FCA authorization required; strong regulatory alignment with Canada',
    },
    Singapore: {
      level: 'LOW',
      note: 'MAS licensing required; CPTPP investment chapter provides framework',
    },
    Australia: { level: 'LOW', note: 'ASIC requirements; CPTPP financial services chapter' },
    Germany: { level: 'LOW', note: 'BaFin authorization for EU access; CETA investment provisions' },
    Japan: { level: 'LOW', note: 'FSA licensing; CPTPP financial services chapter' },
  },
  'Tourism & Hospitality': {
    'United States': {
      level: 'LOW',
      note: 'No tariffs on tourism services; visa requirements minimal',
    },
    'United Kingdom': {
      level: 'LOW',
      note: 'eTA requirement but no barriers; strong bilateral tourism',
    },
    Germany: { level: 'LOW', note: 'No barriers; Schengen-area travellers visit Canada easily' },
    Australia: { level: 'LOW', note: 'eTA required; no bilateral tourism barriers' },
    Japan: { level: 'LOW', note: 'eTA required; CPTPP includes tourism investment provisions' },
    China: {
      level: 'MEDIUM',
      note: 'Visa and political environment can shift quickly; group tour approvals needed',
    },
  },
}

const US_DEPENDENT_SECTORS = [
  'Automotive & Parts',
  'Manufacturing',
  'Forestry & Lumber',
  'Agriculture & Food',
  'Construction & Building Materials',
  'Mining & Metals',
]

const TRADE_AGREEMENTS: Record<string, { name: string; color: string }> = {
  'United States': { name: 'CUSMA', color: '#16a34a' },
  Mexico: { name: 'CUSMA', color: '#16a34a' },
  Japan: { name: 'CPTPP', color: '#2563eb' },
  Australia: { name: 'CPTPP', color: '#2563eb' },
  Singapore: { name: 'CPTPP', color: '#2563eb' },
  'South Korea': { name: 'CKFTA', color: '#7c3aed' },
  'United Kingdom': { name: 'CETA/CUKTCA', color: '#d97706' },
  Germany: { name: 'CETA (EU)', color: '#d97706' },
  France: { name: 'CETA (EU)', color: '#d97706' },
  India: { name: 'Negotiations ongoing', color: '#6b7280' },
  China: { name: 'No FTA', color: '#6b7280' },
  'Saudi Arabia': { name: 'No FTA', color: '#6b7280' },
}

interface Market {
  name: string
  score: number
  note: string
  flag?: string
  pop?: string
  usMarket?: boolean
}

interface IndustryData {
  domestic: Market[]
  international: Market[]
}

const MARKET_DATA: Record<string, IndustryData> = {
  'Agriculture & Food': {
    domestic: [
      {
        name: 'Ontario',
        score: 95,
        pop: '15.1M',
        note: 'Largest consumer market, strong food retail & food service sector',
      },
      {
        name: 'Quebec',
        score: 88,
        pop: '9.0M',
        note: 'Strong local food culture, preference for Quebec-certified products',
      },
      {
        name: 'British Columbia',
        score: 82,
        pop: '5.5M',
        note: 'Health-conscious buyers, premium organic demand',
      },
      {
        name: 'Alberta',
        score: 74,
        pop: '4.7M',
        note: 'High disposable income, beef & grain hub',
      },
    ],
    international: [
      {
        name: 'United States',
        score: 91,
        flag: '🇺🇸',
        note: 'Largest export partner, CUSMA access, $25B+ annual ag trade',
        usMarket: true,
      },
      {
        name: 'China',
        score: 84,
        flag: '🇨🇳',
        note: 'Top canola/pork buyer, growing middle class demand for safe food',
      },
      {
        name: 'Japan',
        score: 78,
        flag: '🇯🇵',
        note: 'CPTPP access, premium quality market, strong wheat/beef imports',
      },
      {
        name: 'United Kingdom',
        score: 74,
        flag: '🇬🇧',
        note: 'CETA/CUKFTA successor, growing Canadian food brand recognition',
      },
      {
        name: 'Mexico',
        score: 68,
        flag: '🇲🇽',
        note: 'CUSMA partner, growing consumer market for Canadian grains',
        usMarket: true,
      },
      {
        name: 'South Korea',
        score: 65,
        flag: '🇰🇷',
        note: 'CKFTA access, strong seafood and pork demand',
      },
    ],
  },
  'Software & Technology': {
    domestic: [
      {
        name: 'Ontario',
        score: 97,
        pop: '15.1M',
        note: 'Toronto-Waterloo tech corridor, largest enterprise buyer base',
      },
      {
        name: 'British Columbia',
        score: 90,
        pop: '5.5M',
        note: 'Vancouver tech scene, gaming & fintech clusters',
      },
      {
        name: 'Quebec',
        score: 82,
        pop: '9.0M',
        note: 'Montreal AI hub, strong government procurement',
      },
      {
        name: 'Alberta',
        score: 70,
        pop: '4.7M',
        note: 'Energy sector digitization, growing startup ecosystem',
      },
    ],
    international: [
      {
        name: 'United States',
        score: 95,
        flag: '🇺🇸',
        note: "World's largest software market, deep cultural/language alignment",
        usMarket: true,
      },
      {
        name: 'United Kingdom',
        score: 82,
        flag: '🇬🇧',
        note: 'Strong fintech/healthtech demand, English-language advantage',
      },
      {
        name: 'Germany',
        score: 76,
        flag: '🇩🇪',
        note: 'EU market gateway, industrial software demand (Industrie 4.0)',
      },
      {
        name: 'Australia',
        score: 73,
        flag: '🇦🇺',
        note: 'Cultural similarity, growing SaaS market, Five Eyes alignment',
      },
      {
        name: 'Japan',
        score: 68,
        flag: '🇯🇵',
        note: 'Enterprise software demand, CPTPP access, digital transformation push',
      },
      {
        name: 'India',
        score: 65,
        flag: '🇮🇳',
        note: 'Massive developer talent pool, growing domestic SaaS market',
      },
    ],
  },
  'Energy & Resources': {
    domestic: [
      {
        name: 'Alberta',
        score: 98,
        pop: '4.7M',
        note: 'Oil sands capital, energy service hub, regulatory expertise',
      },
      {
        name: 'British Columbia',
        score: 85,
        pop: '5.5M',
        note: 'LNG corridor, hydroelectric power, green energy transition',
      },
      {
        name: 'Saskatchewan',
        score: 80,
        pop: '1.2M',
        note: 'Potash, uranium, oil — commodity extraction powerhouse',
      },
      {
        name: 'Ontario',
        score: 72,
        pop: '15.1M',
        note: 'Nuclear energy, large industrial energy consumers',
      },
    ],
    international: [
      {
        name: 'Japan',
        score: 90,
        flag: '🇯🇵',
        note: 'LNG importer, uranium buyer, energy security priority post-Fukushima',
      },
      {
        name: 'South Korea',
        score: 85,
        flag: '🇰🇷',
        note: 'Major LNG importer, CKFTA access, strong energy partnership',
      },
      {
        name: 'Germany',
        score: 80,
        flag: '🇩🇪',
        note: 'Post-Russia pivot, urgent LNG/hydrogen demand',
      },
      {
        name: 'United Kingdom',
        score: 75,
        flag: '🇬🇧',
        note: 'North Sea decline driving imports, strong regulatory alignment',
      },
      {
        name: 'United States',
        score: 70,
        flag: '🇺🇸',
        note: 'Pipeline politics complicate access; regulatory uncertainty ongoing',
        usMarket: true,
      },
      {
        name: 'India',
        score: 65,
        flag: '🇮🇳',
        note: 'Rapid energy demand growth, uranium and clean tech opportunity',
      },
    ],
  },
  'Forestry & Lumber': {
    domestic: [
      {
        name: 'British Columbia',
        score: 95,
        pop: '5.5M',
        note: 'Forestry heartland, processing infrastructure, port access',
      },
      {
        name: 'Ontario',
        score: 80,
        pop: '15.1M',
        note: 'Large construction market, biggest lumber consumer',
      },
      {
        name: 'Quebec',
        score: 78,
        pop: '9.0M',
        note: 'Softwood production, strong residential construction',
      },
      {
        name: 'Alberta',
        score: 72,
        pop: '4.7M',
        note: 'Booming housing market driving lumber demand',
      },
    ],
    international: [
      {
        name: 'Japan',
        score: 85,
        flag: '🇯🇵',
        note: 'Canadian Douglas Fir preferred, CPTPP access, strong construction market',
      },
      {
        name: 'China',
        score: 80,
        flag: '🇨🇳',
        note: 'High volume buyer, accepts lower grades, large construction base',
      },
      {
        name: 'United States',
        score: 72,
        flag: '🇺🇸',
        note: 'Demand remains high but ~14% softwood tariffs significantly cut margins',
        usMarket: true,
      },
      {
        name: 'South Korea',
        score: 70,
        flag: '🇰🇷',
        note: 'Growing housing demand, CKFTA access',
      },
      {
        name: 'United Kingdom',
        score: 65,
        flag: '🇬🇧',
        note: 'Post-Brexit supply realignment, strong housing shortage',
      },
      {
        name: 'India',
        score: 55,
        flag: '🇮🇳',
        note: 'Emerging market, infrastructure boom creating long-term demand',
      },
    ],
  },
  Manufacturing: {
    domestic: [
      {
        name: 'Ontario',
        score: 96,
        pop: '15.1M',
        note: 'Manufacturing belt (Windsor-Oshawa), largest industrial supply chain',
      },
      {
        name: 'Quebec',
        score: 85,
        pop: '9.0M',
        note: 'Aerospace, aluminum, chemical manufacturing clusters',
      },
      {
        name: 'Alberta',
        score: 72,
        pop: '4.7M',
        note: 'Petrochemical & industrial equipment demand',
      },
      {
        name: 'British Columbia',
        score: 68,
        pop: '5.5M',
        note: 'Port access for export, food processing, tech hardware',
      },
    ],
    international: [
      {
        name: 'United States',
        score: 80,
        flag: '🇺🇸',
        note: 'Deep supply chain ties but Section 232 tariffs on metals add real cost pressure',
        usMarket: true,
      },
      {
        name: 'Mexico',
        score: 75,
        flag: '🇲🇽',
        note: 'CUSMA partner, growing manufacturing complement market',
        usMarket: true,
      },
      {
        name: 'Germany',
        score: 72,
        flag: '🇩🇪',
        note: 'Precision manufacturing partner, Mittelstand supply chain opportunities',
      },
      {
        name: 'United Kingdom',
        score: 68,
        flag: '🇬🇧',
        note: 'Aerospace/defence procurement, CETA successor agreement',
      },
      {
        name: 'Japan',
        score: 65,
        flag: '🇯🇵',
        note: 'Automotive supply chain, CPTPP, high quality standards alignment',
      },
      {
        name: 'Australia',
        score: 60,
        flag: '🇦🇺',
        note: 'Mining equipment, defence procurement, CPTPP access',
      },
    ],
  },
  'Automotive & Parts': {
    domestic: [
      {
        name: 'Ontario',
        score: 98,
        pop: '15.1M',
        note: "Windsor-Oshawa corridor — Canada's auto manufacturing heart",
      },
      {
        name: 'Quebec',
        score: 70,
        pop: '9.0M',
        note: 'EV supply chain emerging, auto parts manufacturing',
      },
      {
        name: 'British Columbia',
        score: 60,
        pop: '5.5M',
        note: 'Highest EV adoption rate in Canada, parts import hub',
      },
      {
        name: 'Alberta',
        score: 58,
        pop: '4.7M',
        note: 'Large fleet market (trucks/SUVs), oil patch vehicle demand',
      },
    ],
    international: [
      {
        name: 'United States',
        score: 78,
        flag: '🇺🇸',
        note: 'Deeply integrated but Section 232 auto tariffs remain a live threat; CUSMA rules of origin contested',
        usMarket: true,
      },
      {
        name: 'Mexico',
        score: 70,
        flag: '🇲🇽',
        note: 'CUSMA auto rules of origin, massive assembly base',
        usMarket: true,
      },
      {
        name: 'Germany',
        score: 68,
        flag: '🇩🇪',
        note: 'Premium OEM supplier relationships, EV component demand',
      },
      {
        name: 'South Korea',
        score: 62,
        flag: '🇰🇷',
        note: 'Hyundai/Kia supply chain, CKFTA access',
      },
      {
        name: 'Japan',
        score: 60,
        flag: '🇯🇵',
        note: 'Toyota/Honda supplier network, CPTPP access',
      },
      {
        name: 'United Kingdom',
        score: 55,
        flag: '🇬🇧',
        note: 'Jaguar Land Rover/Mini supply chain, post-Brexit opportunity',
      },
    ],
  },
  'Mining & Metals': {
    domestic: [
      {
        name: 'Ontario',
        score: 90,
        pop: '15.1M',
        note: 'Sudbury nickel/copper, Ring of Fire development, smelting capacity',
      },
      {
        name: 'British Columbia',
        score: 88,
        pop: '5.5M',
        note: 'Copper, gold, coal — major mining province with port access',
      },
      {
        name: 'Quebec',
        score: 85,
        pop: '9.0M',
        note: 'Iron ore, lithium, gold — Abitibi is world-class mining region',
      },
      {
        name: 'Saskatchewan',
        score: 80,
        pop: '1.2M',
        note: 'Potash world leader, uranium (Athabasca Basin), gold',
      },
    ],
    international: [
      {
        name: 'China',
        score: 88,
        flag: '🇨🇳',
        note: 'Top consumer of copper, nickel, iron ore and critical minerals',
      },
      {
        name: 'United States',
        score: 80,
        flag: '🇺🇸',
        note: 'Critical mineral agreements exist but Section 232 steel/aluminum tariffs remain active',
        usMarket: true,
      },
      {
        name: 'Japan',
        score: 78,
        flag: '🇯🇵',
        note: 'Critical minerals for EVs/electronics, CPTPP access',
      },
      {
        name: 'South Korea',
        score: 75,
        flag: '🇰🇷',
        note: 'Battery supply chain metals (lithium, nickel, cobalt), CKFTA',
      },
      {
        name: 'Germany',
        score: 70,
        flag: '🇩🇪',
        note: 'EV transition creating strong critical mineral demand',
      },
      {
        name: 'India',
        score: 60,
        flag: '🇮🇳',
        note: 'Infrastructure boom driving steel/metals demand',
      },
    ],
  },
  'Healthcare & Medical': {
    domestic: [
      {
        name: 'Ontario',
        score: 96,
        pop: '15.1M',
        note: 'Largest hospital network, major pharma procurement, research hospitals',
      },
      {
        name: 'Quebec',
        score: 88,
        pop: '9.0M',
        note: 'Strong life sciences sector, government procurement',
      },
      {
        name: 'British Columbia',
        score: 80,
        pop: '5.5M',
        note: 'Aging population, strong private clinic market',
      },
      {
        name: 'Alberta',
        score: 75,
        pop: '4.7M',
        note: 'Growing population, expanding health infrastructure',
      },
    ],
    international: [
      {
        name: 'United States',
        score: 85,
        flag: '🇺🇸',
        note: 'Massive private market, regulatory alignment, clinical trial partnerships',
        usMarket: true,
      },
      {
        name: 'United Kingdom',
        score: 78,
        flag: '🇬🇧',
        note: 'NHS procurement, strong research collaboration history',
      },
      {
        name: 'Germany',
        score: 74,
        flag: '🇩🇪',
        note: 'EU market gateway, world-class medtech demand',
      },
      {
        name: 'Australia',
        score: 70,
        flag: '🇦🇺',
        note: 'Similar regulatory environment, aging population, CPTPP',
      },
      {
        name: 'Japan',
        score: 68,
        flag: '🇯🇵',
        note: "World's oldest population, massive medtech procurement",
      },
      {
        name: 'Saudi Arabia',
        score: 62,
        flag: '🇸🇦',
        note: 'Vision 2030 healthcare expansion, government procurement',
      },
    ],
  },
  'Construction & Building Materials': {
    domestic: [
      {
        name: 'Ontario',
        score: 95,
        pop: '15.1M',
        note: 'Housing crisis driving massive construction demand',
      },
      {
        name: 'British Columbia',
        score: 90,
        pop: '5.5M',
        note: 'Vancouver/Victoria supply crunch, strong condo pipeline',
      },
      {
        name: 'Alberta',
        score: 85,
        pop: '4.7M',
        note: 'Population boom, Calgary/Edmonton infill and new development',
      },
      {
        name: 'Quebec',
        score: 78,
        pop: '9.0M',
        note: 'Infrastructure renewal, housing targets, industrial parks',
      },
    ],
    international: [
      {
        name: 'United Kingdom',
        score: 72,
        flag: '🇬🇧',
        note: 'Housing shortage crisis creating sustained building materials demand',
      },
      {
        name: 'Australia',
        score: 68,
        flag: '🇦🇺',
        note: 'Population growth, infrastructure projects, material imports',
      },
      {
        name: 'United States',
        score: 65,
        flag: '🇺🇸',
        note: 'Lumber ~14%, steel 25%, aluminum 10% tariffs active — margins are severely compressed',
        usMarket: true,
      },
      {
        name: 'Germany',
        score: 62,
        flag: '🇩🇪',
        note: 'Renovation and efficiency retrofit market (Energiewende)',
      },
      {
        name: 'Japan',
        score: 58,
        flag: '🇯🇵',
        note: 'Disaster-resilient construction demand, CPTPP access',
      },
      {
        name: 'Saudi Arabia',
        score: 55,
        flag: '🇸🇦',
        note: 'NEOM and Vision 2030 mega-projects, massive materials demand',
      },
    ],
  },
  'Fashion & Apparel': {
    domestic: [
      {
        name: 'Ontario',
        score: 93,
        pop: '15.1M',
        note: 'Largest retail market, Toronto fashion hub, wholesale district',
      },
      {
        name: 'British Columbia',
        score: 82,
        pop: '5.5M',
        note: 'Outdoor/athleisure culture, Vancouver streetwear scene',
      },
      {
        name: 'Quebec',
        score: 80,
        pop: '9.0M',
        note: 'Montreal fashion week, strong design identity, retail clusters',
      },
      {
        name: 'Alberta',
        score: 70,
        pop: '4.7M',
        note: 'High income consumers, western wear + urban mix',
      },
    ],
    international: [
      {
        name: 'United States',
        score: 88,
        flag: '🇺🇸',
        note: 'Shared culture, CUSMA, massive retail market for Canadian brands',
        usMarket: true,
      },
      {
        name: 'United Kingdom',
        score: 75,
        flag: '🇬🇧',
        note: 'Strong Canadian brand recognition, premium market appetite',
      },
      {
        name: 'Australia',
        score: 70,
        flag: '🇦🇺',
        note: 'Cultural similarity, outdoor/lifestyle alignment, CPTPP',
      },
      {
        name: 'Japan',
        score: 65,
        flag: '🇯🇵',
        note: 'Premium brand appreciation, Canadiana/outdoor aesthetic appeal',
      },
      {
        name: 'Germany',
        score: 60,
        flag: '🇩🇪',
        note: 'Strong sustainable fashion demand, outdoor/technical apparel',
      },
      {
        name: 'South Korea',
        score: 58,
        flag: '🇰🇷',
        note: 'Fast-growing fashion market, K-culture driving global trends',
      },
    ],
  },
  'Financial Services': {
    domestic: [
      {
        name: 'Ontario',
        score: 98,
        pop: '15.1M',
        note: "Toronto is Canada's financial capital — Bay Street, Big 6 banks, TSX",
      },
      {
        name: 'British Columbia',
        score: 83,
        pop: '5.5M',
        note: 'Fintech growth, wealth management, Pacific Rim gateway',
      },
      {
        name: 'Quebec',
        score: 78,
        pop: '9.0M',
        note: 'Caisse de dépôt, strong insurance and pension market',
      },
      {
        name: 'Alberta',
        score: 72,
        pop: '4.7M',
        note: 'Energy finance, wealth management, growing tech finance',
      },
    ],
    international: [
      {
        name: 'United States',
        score: 85,
        flag: '🇺🇸',
        note: 'Deep capital market integration, major VC/PE cross-border activity',
        usMarket: true,
      },
      {
        name: 'United Kingdom',
        score: 80,
        flag: '🇬🇧',
        note: 'London financial centre alignment, strong regulatory recognition',
      },
      {
        name: 'Singapore',
        score: 75,
        flag: '🇸🇬',
        note: 'Asia Pacific hub, CPTPP, strong fintech corridor',
      },
      {
        name: 'Australia',
        score: 70,
        flag: '🇦🇺',
        note: 'Commonwealth financial alignment, super fund investment opportunities',
      },
      {
        name: 'Germany',
        score: 62,
        flag: '🇩🇪',
        note: 'EU market gateway, strong institutional investor base',
      },
      {
        name: 'Japan',
        score: 60,
        flag: '🇯🇵',
        note: 'CPTPP, pension fund partnerships, insurance market',
      },
    ],
  },
  'Tourism & Hospitality': {
    domestic: [
      {
        name: 'British Columbia',
        score: 96,
        pop: '5.5M',
        note: 'Whistler, Vancouver Island, Rockies — top destination province',
      },
      {
        name: 'Ontario',
        score: 90,
        pop: '15.1M',
        note: 'Niagara Falls, Toronto, cottage country — highest visitor volume',
      },
      {
        name: 'Quebec',
        score: 88,
        pop: '9.0M',
        note: 'Montreal, Quebec City, unique cultural tourism draw',
      },
      {
        name: 'Alberta',
        score: 85,
        pop: '4.7M',
        note: "Banff/Jasper — among Canada's most iconic destinations",
      },
    ],
    international: [
      {
        name: 'United States',
        score: 90,
        flag: '🇺🇸',
        note: 'Largest source of inbound tourists, border convenience, currency advantage',
        usMarket: true,
      },
      {
        name: 'United Kingdom',
        score: 78,
        flag: '🇬🇧',
        note: 'Strong heritage tourism interest, no language barrier',
      },
      {
        name: 'Germany',
        score: 72,
        flag: '🇩🇪',
        note: 'Top European source, outdoor/adventure tourism appetite',
      },
      {
        name: 'Australia',
        score: 68,
        flag: '🇦🇺',
        note: 'Cultural similarity, long-haul adventure travellers, CPTPP',
      },
      {
        name: 'Japan',
        score: 65,
        flag: '🇯🇵',
        note: 'Strong Canadian Rockies brand in Japan, growing luxury tourism',
      },
      {
        name: 'China',
        score: 62,
        flag: '🇨🇳',
        note: 'Pre-pandemic top source, recovery in progress, high-spend travellers',
      },
    ],
  },
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const barColor =
    score >= 85 ? '#0b5ed7' : score >= 70 ? '#3b82f6' : '#93c5fd'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${score}%`, background: barColor }}
        />
      </div>
      <span
        className="font-mono text-xs font-bold tabular-nums w-8 text-right"
        style={{ color: barColor }}
      >
        {score}
      </span>
    </div>
  )
}

function TariffBadge({ risk }: { risk: TariffInfo }) {
  const styles: Record<TariffInfo['level'], string> = {
    HIGH: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400',
    MEDIUM:
      'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400',
    LOW: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400',
  }
  return (
    <div
      className={cn(
        'mt-3 px-3 py-2 border rounded-lg flex items-start gap-2 text-xs',
        styles[risk.level],
      )}
    >
      <span className="mt-0.5 shrink-0">⚠️</span>
      <div>
        <span className="font-bold uppercase tracking-wide">Tariff Risk: {risk.level} — </span>
        <span className="leading-relaxed">{risk.note}</span>
      </div>
    </div>
  )
}

function ProvinceNote({ province, marketName }: { province: string; marketName: string }) {
  const note = PROVINCE_CONTEXT[province]?.[marketName]
  if (!note) return null
  return (
    <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900 rounded-lg flex items-start gap-2 text-xs">
      <span className="mt-0.5 shrink-0">📍</span>
      <p className="text-blue-700 dark:text-blue-400 leading-relaxed">
        <strong>From {province}:</strong> {note}
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
      className="bg-white dark:bg-zinc-800 rounded-2xl shadow-floating card p-5 border border-gray-100 dark:border-zinc-700"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {market.flag && <span className="text-xl leading-none">{market.flag}</span>}
            <span className="font-bold text-gray-800 dark:text-gray-100 text-base">
              {market.name}
            </span>
          </div>
          {market.pop && (
            <span className="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Pop. {market.pop}
            </span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
          {index === 0 && (
            <span className="bg-brand-blue-500 text-white text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-md">
              Top Pick
            </span>
          )}
          {ta && (
            <span
              className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md border"
              style={{ color: ta.color, borderColor: ta.color, background: `${ta.color}10` }}
            >
              {ta.name}
            </span>
          )}
        </div>
      </div>

      <ScoreBar score={market.score} />

      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{market.note}</p>

      {province && <ProvinceNote province={province} marketName={market.name} />}
      {tariff && <TariffBadge risk={tariff} />}
    </div>
  )
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────

export default function CanadianMarketFinder() {
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
    setTimeout(() => setShowCTA(true), 2000)
  }

  const allMarkets = data ? (activeTab === 'domestic' ? data.domestic : data.international) : []
  const visibleMarkets = allMarkets.filter((m) => !(hideUS && m.usMarket))

  const selectClass =
    'w-full px-4 py-2.5 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition cursor-pointer appearance-none'

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-900">
      {/* ── Page hero ── */}
      <section className="bg-brand-blue-600 text-white">
        <div className="container mx-auto px-6 py-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
              🍁
            </div>
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-200">
              Canadian Trade Intelligence
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">
            Market Finder
          </h1>
          <p className="text-blue-100 max-w-xl leading-relaxed">
            Find where to sell your goods — by province or globally. Built for Canadian businesses
            navigating today&apos;s trade shifts.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-10 max-w-3xl">
        {/* ── Controls ── */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-floating p-6 mb-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                Industry / Sector
              </label>
              <div className="relative">
                <select
                  value={selectedIndustry}
                  onChange={(e) => {
                    setSelectedIndustry(e.target.value)
                    setHasSearched(false)
                    setShowCTA(false)
                  }}
                  className={selectClass}
                >
                  <option value="">Select your sector…</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                Your Province{' '}
                <span className="normal-case font-normal text-gray-400">(personalizes logistics)</span>
              </label>
              <div className="relative">
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className={selectClass}
                >
                  <option value="">All provinces</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* US toggle */}
            <button
              type="button"
              onClick={() => setHideUS(!hideUS)}
              className="flex items-center gap-3 group"
            >
              <div
                className={cn(
                  'relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0',
                  hideUS ? 'bg-brand-blue-500' : 'bg-gray-200 dark:bg-zinc-600',
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
                    hideUS ? 'left-5' : 'left-0.5',
                  )}
                />
              </div>
              <div className="text-left">
                <div
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wide transition-colors',
                    hideUS
                      ? 'text-brand-blue-600 dark:text-brand-blue-400'
                      : 'text-gray-600 dark:text-gray-400',
                  )}
                >
                  {hideUS ? '🚫 US Markets Hidden' : 'Hide US Markets'}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Show only non-US opportunities
                </div>
              </div>
            </button>

            <button
              onClick={handleFind}
              disabled={!selectedIndustry}
              className={cn(
                'font-bold py-2.5 px-7 rounded-lg text-sm transition-all transform',
                selectedIndustry
                  ? 'bg-brand-blue-500 text-white shadow-floating hover:bg-brand-blue-600 hover:scale-105'
                  : 'bg-gray-100 dark:bg-zinc-700 text-gray-400 cursor-not-allowed',
              )}
            >
              Find Markets →
            </button>
          </div>
        </div>

        {/* ── US dependency warning ── */}
        {hasSearched && isUSDependentSector && (
          <div className="mb-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl shrink-0">🚨</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400 mb-1">
                High US Trade Dependency Detected
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                <strong>{selectedIndustry}</strong> has historically relied heavily on US market
                access. Current tariff conditions make diversification a priority. Use the{' '}
                <strong>Hide US Markets</strong> toggle above to see your best pivot options.
              </p>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {hasSearched && data && (
          <div>
            {/* FTA legend */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-floating px-4 py-3 mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wide mr-1">
                FTAs:
              </span>
              {[
                { name: 'CUSMA', color: '#16a34a' },
                { name: 'CPTPP', color: '#2563eb' },
                { name: 'CETA/CUKTCA', color: '#d97706' },
                { name: 'CKFTA', color: '#7c3aed' },
              ].map((ta) => (
                <span
                  key={ta.name}
                  className="text-xs font-mono font-semibold px-2 py-0.5 rounded border"
                  style={{ color: ta.color, borderColor: ta.color, background: `${ta.color}12` }}
                >
                  {ta.name}
                </span>
              ))}
              {selectedProvince && (
                <span className="ml-auto text-xs font-mono font-medium text-brand-blue-600 dark:text-brand-blue-400 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 px-2 py-0.5 rounded">
                  📍 {selectedProvince} logistics
                </span>
              )}
            </div>

            {/* Section header */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {selectedIndustry}
              </h2>
              <p className="text-xs font-mono text-gray-400 mt-0.5">
                Ranked by opportunity score · demand, FTA access, trade policy & market alignment
              </p>
            </div>

            {/* Tabs */}
            <div className="inline-flex bg-gray-100 dark:bg-zinc-700 rounded-xl p-1 mb-4">
              {[
                { key: 'international', label: '🌐 International' },
                { key: 'domestic', label: '🍁 Canadian Provinces' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all',
                    activeTab === key
                      ? 'bg-white dark:bg-zinc-800 text-brand-blue-600 shadow-floating'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Cards */}
            {visibleMarkets.length === 0 ? (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-floating p-10 text-center">
                <div className="text-4xl mb-3">🚫</div>
                <p className="text-xs font-mono font-semibold uppercase tracking-wide text-gray-400">
                  All markets filtered out. Try switching to Domestic or disable the US filter.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {visibleMarkets.map((market, i) => (
                  <MarketCard
                    key={market.name}
                    market={market}
                    type={activeTab}
                    index={i}
                    industry={selectedIndustry}
                    province={selectedProvince}
                  />
                ))}
              </div>
            )}

            {/* ── Lead Gen CTA ── */}
            {showCTA && (
              <div className="mt-8 bg-brand-blue-500 text-white rounded-2xl shadow-floating-lg p-8 md:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <p className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-200 mb-2">
                      Inspiria Designs · Free Consultation
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-snug">
                      Ready to enter a new market?
                    </h3>
                    <p className="text-blue-100 leading-relaxed max-w-lg">
                      We help Canadian businesses build the online presence they need to compete in
                      new markets.{' '}
                      <strong className="text-white">Free trade readiness consultation</strong> — no
                      commitment, just a clear picture of where your business stands.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                    <a
                      href="https://inspiria.ca/contact"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-brand-blue-600 font-bold py-3 px-8 rounded-lg shadow-floating text-sm text-center hover:bg-gray-50 transition-all transform hover:scale-105"
                    >
                      Book Free Call →
                    </a>
                    <a
                      href="https://inspiria.ca"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-white/30 text-white/80 font-semibold py-2.5 px-8 rounded-lg text-sm text-center hover:bg-white/10 transition-all"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="mt-5 text-xs text-gray-400 dark:text-gray-500 leading-relaxed font-mono">
              Opportunity scores reflect relative market potential based on trade volume, FTA access,
              demand trends, and sector alignment. Tariff data reflects conditions as of early 2025
              and may change rapidly. Not financial or legal advice. Verify with{' '}
              <a
                href="https://www.tradecommissioner.gc.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue-500 hover:underline"
              >
                Trade Commissioner Service
              </a>{' '}
              and{' '}
              <a
                href="https://www.international.gc.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue-500 hover:underline"
              >
                Global Affairs Canada
              </a>
              .
            </p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!hasSearched && (
          <div className="text-center py-20 text-gray-400 dark:text-gray-600">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="text-xs font-mono font-semibold uppercase tracking-widest">
              Select your sector to explore markets
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
