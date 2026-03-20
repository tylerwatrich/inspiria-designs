// Canada industry-level goods trade — world aggregate
// Reporter: Canada (124) | Partner: World (ALL)
// Source: UN Comtrade, Annual HS, aggrLevel=2 (HS chapter)
// Downloaded: March 2026 | Flows: Exports + Imports
// Note: HS 44 appears in both Forestry and Construction; HS 85 in both Tech and Manufacturing

export interface IndustryExportYear {
  exports: number
  imports: number
}

export interface IndustryExportData {
  hsCodes: string[]
  byYear: Record<number, IndustryExportYear>
}

export const CANADA_INDUSTRY_EXPORTS: Record<string, IndustryExportData> = {
  'Agriculture & Food': {
    hsCodes: ['02', '10', '12', '15', '16'],
    byYear: {
      2022: { exports: 66289758541, imports: 19258864106 },
      2023: { exports: 68885450348, imports: 17620152515 },
      2024: { exports: 61413354337, imports: 18629820154 },
    },
  },
  'Automotive & Parts': {
    hsCodes: ['87'],
    byYear: {
      2022: { exports: 100436250822, imports: 165084455508 },
      2023: { exports: 126817852149, imports: 184145591333 },
      2024: { exports: 111901113299, imports: 175794280037 },
    },
  },
  'Construction & Building Materials': {
    hsCodes: ['44', '72', '73'],
    byYear: {
      2022: { exports: 75564607349, imports: 58305794067 },
      2023: { exports: 60127430179, imports: 50808059501 },
      2024: { exports: 56163458528, imports: 46907431426 },
    },
  },
  'Energy & Resources': {
    hsCodes: ['27'],
    byYear: {
      2022: { exports: 362162560913, imports: 90027632377 },
      2023: { exports: 285942358127, imports: 76510882774 },
      2024: { exports: 281357652350, imports: 69931929235 },
    },
  },
  'Fashion & Apparel': {
    hsCodes: ['61', '62'],
    byYear: {
      2022: { exports: 3184523993, imports: 24930620629 },
      2023: { exports: 2990657568, imports: 21683304572 },
      2024: { exports: 2980887270, imports: 21038254308 },
    },
  },
  'Forestry & Lumber': {
    hsCodes: ['44', '47'],
    byYear: {
      2022: { exports: 53100468464, imports: 9154748044 },
      2023: { exports: 37888832517, imports: 7897019052 },
      2024: { exports: 37276101550, imports: 7787582192 },
    },
  },
  'Healthcare & Medical': {
    hsCodes: ['30'],
    byYear: {
      2022: { exports: 21469988777, imports: 40171462154 },
      2023: { exports: 19221352649, imports: 37852740912 },
      2024: { exports: 21779002666, imports: 37720087448 },
    },
  },
  Manufacturing: {
    hsCodes: ['84', '85'],
    byYear: {
      2022: { exports: 104878173914, imports: 267307035361 },
      2023: { exports: 116839365384, imports: 274616055233 },
      2024: { exports: 112890506049, imports: 263237121574 },
    },
  },
  'Mining & Metals': {
    hsCodes: ['26', '74', '76'],
    byYear: {
      2022: { exports: 60245933196, imports: 28133480503 },
      2023: { exports: 56806109976, imports: 24878572993 },
      2024: { exports: 56745681781, imports: 24561019526 },
    },
  },
  'Software & Technology': {
    hsCodes: ['85'],
    byYear: {
      2022: { exports: 29472326570, imports: 106551884224 },
      2023: { exports: 32016064948, imports: 106193641642 },
      2024: { exports: 33721345818, imports: 101311665465 },
    },
  },
  // Tourism & Hospitality, Financial Services — services, not covered by Comtrade goods data
}

export const INDUSTRY_EXPORT_YEARS = [2022, 2023, 2024] as const
