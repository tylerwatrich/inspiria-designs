'use client'

import { useState } from 'react'

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
    'United Kingdom': { level: 'LOW', note: 'CETA-successor framework provides stable market access' },
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
    Germany: {
      level: 'LOW',
      note: 'Urgent demand post-Russia; regulatory alignment improving',
    },
    Japan: {
      level: 'LOW',
      note: 'Long-term LNG contracts reduce risk; CPTPP supports trade',
    },
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
    Germany: { level: 'LOW', note: 'CETA covers metals; EU critical mineral partnerships deepening' },
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
  India: { name: 'Negotiations ongoing', color: '#9ca3af' },
  China: { name: 'No FTA', color: '#9ca3af' },
  'Saudi Arabia': { name: 'No FTA', color: '#9ca3af' },
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
  const color = score >= 85 ? '#c8102e' : score >= 70 ? '#e05a20' : '#f5a623'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        style={{
          flex: 1,
          height: '6px',
          background: '#e8e0d4',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            background: color,
            borderRadius: '3px',
            transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '13px',
          fontWeight: '700',
          color,
          minWidth: '36px',
          textAlign: 'right',
        }}
      >
        {score}
      </span>
    </div>
  )
}

function TariffBadge({ risk }: { risk: TariffInfo }) {
  const colors = {
    HIGH: { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c' },
    MEDIUM: { bg: '#fffbeb', border: '#fcd34d', text: '#b45309' },
    LOW: { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
  }
  const c = colors[risk.level]
  return (
    <div
      style={{
        marginTop: '10px',
        padding: '8px 12px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
      }}
    >
      <span style={{ fontSize: '10px', marginTop: '2px' }}>⚠️</span>
      <div>
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '10px',
            fontWeight: '700',
            color: c.text,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          Tariff Risk: {risk.level}
        </span>
        <p
          style={{
            margin: '2px 0 0',
            fontFamily: "'Courier New', monospace",
            fontSize: '11px',
            color: c.text,
            lineHeight: '1.5',
          }}
        >
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
      style={{
        marginTop: '8px',
        padding: '7px 12px',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '7px',
      }}
    >
      <span style={{ fontSize: '11px', marginTop: '1px' }}>📍</span>
      <p
        style={{
          margin: 0,
          fontFamily: "'Courier New', monospace",
          fontSize: '11px',
          color: '#1d4ed8',
          lineHeight: '1.5',
        }}
      >
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
  const tariff =
    type === 'international' && industry ? TARIFF_RISK[industry]?.[market.name] : null
  return (
    <div
      style={{
        background: '#faf8f4',
        border: '1px solid #e2d9cc',
        borderRadius: '4px',
        padding: '18px 20px',
        animation: `fadeUp 0.4s ease ${index * 0.07}s both`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px',
        }}
      >
        <div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}
          >
            {market.flag && <span style={{ fontSize: '20px' }}>{market.flag}</span>}
            <span
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: '17px',
                fontWeight: '700',
                color: '#1a1410',
                letterSpacing: '-0.3px',
              }}
            >
              {market.name}
            </span>
          </div>
          {market.pop && (
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '11px',
                color: '#9b8b7a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Pop. {market.pop}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          {index === 0 && (
            <span
              style={{
                background: '#c8102e',
                color: 'white',
                fontSize: '10px',
                fontFamily: "'Courier New', monospace",
                fontWeight: '700',
                letterSpacing: '1px',
                padding: '2px 7px',
                borderRadius: '2px',
                textTransform: 'uppercase',
              }}
            >
              TOP PICK
            </span>
          )}
          {ta && (
            <span
              style={{
                border: `1px solid ${ta.color}`,
                color: ta.color,
                fontSize: '10px',
                fontFamily: "'Courier New', monospace",
                fontWeight: '600',
                letterSpacing: '0.5px',
                padding: '2px 7px',
                borderRadius: '2px',
              }}
            >
              {ta.name}
            </span>
          )}
        </div>
      </div>
      <ScoreBar score={market.score} />
      <p
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: '13.5px',
          color: '#5a4a3a',
          lineHeight: '1.6',
          marginTop: '10px',
          marginBottom: 0,
        }}
      >
        {market.note}
      </p>
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

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', fontFamily: 'Georgia, serif' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ctaReveal { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        select:focus { outline: 2px solid #c8102e; outline-offset: 0; }
        .tab-btn:hover { background: #e8dfd4 !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: '#1a0a06', borderBottom: '3px solid #c8102e', padding: '0 24px' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', padding: '28px 0 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                background: '#c8102e',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              🍁
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '10px',
                  letterSpacing: '3px',
                  color: '#c8102e',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                Canadian Trade Intelligence
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '26px',
                  fontWeight: '700',
                  color: '#f5f0e8',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.1,
                }}
              >
                Market Finder
              </h1>
            </div>
          </div>
          <p
            style={{
              margin: 0,
              color: '#a89882',
              fontSize: '14px',
              lineHeight: '1.5',
              maxWidth: '560px',
            }}
          >
            Find where to sell your goods — by province or globally. Built for Canadian businesses
            navigating today&apos;s trade shifts.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Controls */}
        <div
          style={{
            background: 'white',
            border: '1px solid #ddd4c4',
            borderRadius: '6px',
            padding: '22px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              marginBottom: '18px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#9b8b7a',
                  marginBottom: '7px',
                }}
              >
                Industry / Sector
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => {
                  setSelectedIndustry(e.target.value)
                  setHasSearched(false)
                  setShowCTA(false)
                }}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: '#faf8f4',
                  border: '1.5px solid #ddd4c4',
                  borderRadius: '4px',
                  fontFamily: 'Georgia, serif',
                  fontSize: '14px',
                  color: selectedIndustry ? '#1a1410' : '#9b8b7a',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239b8b7a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
              >
                <option value="">Select your sector…</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#9b8b7a',
                  marginBottom: '7px',
                }}
              >
                Your Province{' '}
                <span style={{ fontWeight: '400', color: '#c8b89a', fontSize: '9px' }}>
                  (personalizes logistics)
                </span>
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: '#faf8f4',
                  border: '1.5px solid #ddd4c4',
                  borderRadius: '4px',
                  fontFamily: 'Georgia, serif',
                  fontSize: '14px',
                  color: selectedProvince ? '#1a1410' : '#9b8b7a',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239b8b7a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
              >
                <option value="">All provinces</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* US Toggle */}
            <div
              onClick={() => setHideUS(!hideUS)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '11px',
                  position: 'relative',
                  background: hideUS ? '#c8102e' : '#ddd4c4',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: hideUS ? '21px' : '3px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '11px',
                    fontWeight: '700',
                    color: hideUS ? '#c8102e' : '#5a4a3a',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  {hideUS ? '🚫 US Markets Hidden' : 'Hide US Markets'}
                </div>
                <div
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '10px',
                    color: '#9b8b7a',
                    marginTop: '1px',
                  }}
                >
                  Show only non-US opportunities
                </div>
              </div>
            </div>

            <button
              onClick={handleFind}
              disabled={!selectedIndustry}
              style={{
                padding: '11px 30px',
                background: selectedIndustry ? '#c8102e' : '#ddd4c4',
                color: selectedIndustry ? 'white' : '#9b8b7a',
                border: 'none',
                borderRadius: '4px',
                fontFamily: "'Courier New', monospace",
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                cursor: selectedIndustry ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              Find Markets →
            </button>
          </div>
        </div>

        {/* US Dependency Warning */}
        {hasSearched && isUSDependentSector && (
          <div
            style={{
              marginBottom: '18px',
              padding: '14px 18px',
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'slideIn 0.3s ease both',
            }}
          >
            <span style={{ fontSize: '20px', flexShrink: 0 }}>🚨</span>
            <div>
              <div
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#b91c1c',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                High US Trade Dependency Detected
              </div>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'Georgia, serif',
                  fontSize: '13.5px',
                  color: '#7f1d1d',
                  lineHeight: '1.6',
                }}
              >
                <strong>{selectedIndustry}</strong> has historically relied heavily on US market
                access. Current tariff conditions and trade uncertainty make diversification a
                priority. Use the &quot;Hide US Markets&quot; toggle above to see your best pivot
                options.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && data && (
          <div style={{ animation: 'slideIn 0.4s ease both' }}>
            {/* FTA Legend */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
                marginBottom: '14px',
                padding: '11px 14px',
                background: 'white',
                border: '1px solid #ddd4c4',
                borderRadius: '5px',
              }}
            >
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#9b8b7a',
                  marginRight: '2px',
                }}
              >
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
                  style={{
                    fontSize: '11px',
                    fontFamily: "'Courier New', monospace",
                    color: ta.color,
                    border: `1px solid ${ta.color}`,
                    padding: '2px 7px',
                    borderRadius: '2px',
                  }}
                >
                  {ta.name}
                </span>
              ))}
              {selectedProvince && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '11px',
                    color: '#1d4ed8',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '2px 8px',
                    borderRadius: '2px',
                  }}
                >
                  📍 {selectedProvince} logistics
                </span>
              )}
            </div>

            {/* Section header */}
            <div style={{ marginBottom: '12px' }}>
              <h2
                style={{
                  margin: '0 0 3px',
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1a1410',
                  letterSpacing: '-0.4px',
                }}
              >
                {selectedIndustry}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#9b8b7a',
                  fontFamily: "'Courier New', monospace",
                }}
              >
                Ranked by opportunity score · demand, FTA access, trade policy & market alignment
              </p>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '2px',
                marginBottom: '12px',
                background: '#e8dfd4',
                padding: '3px',
                borderRadius: '5px',
                width: 'fit-content',
              }}
            >
              {[
                { key: 'international', label: '🌐 International' },
                { key: 'domestic', label: '🍁 Canadian Provinces' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className="tab-btn"
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: '8px 20px',
                    border: 'none',
                    borderRadius: '3px',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: activeTab === key ? 'white' : 'transparent',
                    color: activeTab === key ? '#c8102e' : '#7a6a5a',
                    boxShadow: activeTab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Cards */}
            {visibleMarkets.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  background: 'white',
                  border: '1px solid #ddd4c4',
                  borderRadius: '6px',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚫</div>
                <p
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '11px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: '#9b8b7a',
                    margin: 0,
                  }}
                >
                  All markets filtered out. Try switching to Domestic or disable the US filter.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

            {/* Lead Gen CTA */}
            {showCTA && (
              <div
                style={{
                  marginTop: '28px',
                  background: '#1a0a06',
                  border: '2px solid #3a1a0e',
                  borderRadius: '8px',
                  padding: '28px',
                  animation: 'ctaReveal 0.7s cubic-bezier(0.16,1,0.3,1) both',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px',
                  }}
                >
                  <div style={{ flex: '1', minWidth: '260px' }}>
                    <div
                      style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: '10px',
                        letterSpacing: '3px',
                        color: '#c8102e',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                      }}
                    >
                      Inspiria Designs · Free Consultation
                    </div>
                    <h3
                      style={{
                        margin: '0 0 10px',
                        fontSize: '21px',
                        fontWeight: '700',
                        color: '#f5f0e8',
                        letterSpacing: '-0.3px',
                        lineHeight: 1.2,
                      }}
                    >
                      Ready to enter a new market?
                    </h3>
                    <p
                      style={{
                        margin: '0 0 6px',
                        fontFamily: 'Georgia, serif',
                        fontSize: '14px',
                        color: '#a89882',
                        lineHeight: '1.65',
                      }}
                    >
                      We help Canadian businesses build the online presence they need to compete in
                      new markets — whether that&apos;s a US pivot, a global push, or capturing more
                      of Canada.
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: 'Georgia, serif',
                        fontSize: '14px',
                        color: '#a89882',
                        lineHeight: '1.65',
                      }}
                    >
                      <strong style={{ color: '#f5f0e8' }}>Free trade readiness consultation</strong>{' '}
                      — no commitment, just a clear picture of where your business stands.
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      minWidth: '190px',
                    }}
                  >
                    <a
                      href="https://inspiria.ca/contact"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '13px 24px',
                        background: '#c8102e',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontFamily: "'Courier New', monospace",
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                      }}
                    >
                      Book Free Call →
                    </a>
                    <a
                      href="https://inspiria.ca"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '10px 24px',
                        background: 'transparent',
                        color: '#a89882',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        border: '1px solid #3a2a1e',
                        fontFamily: "'Courier New', monospace",
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                      }}
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div
              style={{
                marginTop: '18px',
                padding: '13px 16px',
                border: '1px solid #ddd4c4',
                borderRadius: '4px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '11.5px',
                  color: '#9b8b7a',
                  fontFamily: "'Courier New', monospace",
                  lineHeight: '1.7',
                }}
              >
                Opportunity scores reflect relative market potential based on trade volume, FTA
                access, demand trends, and sector alignment. Tariff data reflects conditions as of
                early 2025 and may change rapidly. Not financial or legal advice. Verify with{' '}
                <a
                  href="https://www.tradecommissioner.gc.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#c8102e' }}
                >
                  Trade Commissioner Service
                </a>{' '}
                and{' '}
                <a
                  href="https://www.international.gc.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#c8102e' }}
                >
                  Global Affairs Canada
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasSearched && (
          <div style={{ textAlign: 'center', padding: '52px 24px', color: '#9b8b7a' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <p
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Select your sector to explore markets
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
