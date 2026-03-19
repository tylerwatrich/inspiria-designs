// Canada industry-level goods exports — aggregate across 12 target markets
// Partners: US, China, Japan, Germany, UK, South Korea, Australia, India, Mexico, Singapore, France, Saudi Arabia
// Source: UN Comtrade, Annual HS, Canada (reporter 124)
// HS codes: 02, 10, 12, 15, 16 (Agriculture), 26, 74, 76 (Mining), 85 (Tech), 87 (Auto)
// Downloaded: March 2026

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
      2022: {
        exports: 6458601489 + 4616771498 + 6184039759 + 6178510912 + 1275088925,
        imports: 2031569517 + 1890845451 + 1017928458 + 812913784 + 1274761271,
      },
      2023: {
        exports: 6305162290 + 4599465640 + 6584077114 + 6495756222 + 1265365634,
        imports: 2031260366 + 1258239306 + 962179926 + 687713304 + 1169673404,
      },
      2024: {
        exports: 6436425241 + 3696005836 + 5865312516 + 5169138832 + 1400767900,
        imports: 2118904644 + 996998089 + 983179630 + 766880798 + 1128055764,
      },
    },
  },
  'Automotive & Parts': {
    hsCodes: ['87'],
    byYear: {
      2022: { exports: 48519937977, imports: 78749243333 },
      2023: { exports: 61333825224, imports: 87713848897 },
      2024: { exports: 54005525277, imports: 84213688981 },
    },
  },
  'Mining & Metals': {
    hsCodes: ['26', '74', '76'],
    byYear: {
      2022: {
        exports: 8658398964 + 4118730285 + 13678833997,
        imports: 3130475503 + 2024983278 + 5054063482,
      },
      2023: {
        exports: 8677937821 + 4016754532 + 11932391945,
        imports: 2846060758 + 1946361278 + 4381062791,
      },
      2024: {
        exports: 8256787922 + 4430131566 + 11796628257,
        imports: 2536699086 + 2281251059 + 4507865944,
      },
    },
  },
  'Software & Technology': {
    hsCodes: ['85'],
    byYear: {
      2022: { exports: 12920412203, imports: 41432201890 },
      2023: { exports: 14124564339, imports: 40920956470 },
      2024: { exports: 15194394076, imports: 39315522440 },
    },
  },
  // Tourism & Hospitality, Financial Services — services, not covered by Comtrade goods data
}

export const INDUSTRY_EXPORT_YEARS = [2022, 2023, 2024] as const
