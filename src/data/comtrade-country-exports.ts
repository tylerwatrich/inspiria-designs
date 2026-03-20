// Canada per-country export values by industry — 12 target markets
// Reporter: Canada (124) | Year: 2024
// Source: UN Comtrade, Annual HS — TradeData (6).json
// Downloaded: March 2026 | Flow: Exports (X)
// Coverage: 4 goods industries with HS code mapping; services industries not included
// Used as static fallback when COMTRADE_API_KEY is not configured

export const COMTRADE_COUNTRY_EXPORTS_2024: Record<string, Record<string, number>> = {
  'Agriculture & Food': {
    Australia: 145244211,
    China: 4847197610,
    France: 88416844,
    Germany: 139774919,
    India: 1249271,
    Japan: 2917820664,
    Mexico: 1188518788,
    'Saudi Arabia': 14396136,
    Singapore: 31587425,
    'South Korea': 562710081,
    'United Kingdom': 416315839,
    'United States': 12214418512,
  },
  'Automotive & Parts': {
    Australia: 72601169,
    China: 434205038,
    France: 31764392,
    Germany: 182691778,
    India: 805147,
    Japan: 27937895,
    Mexico: 1240268097,
    'Saudi Arabia': 933121579,
    Singapore: 23909302,
    'South Korea': 7797794,
    'United Kingdom': 55090230,
    'United States': 50995332850,
  },
  'Mining & Metals': {
    Australia: 33730715,
    China: 3923323482,
    France: 387009593,
    Germany: 531583081,
    India: 323416776,
    Japan: 1705059509,
    Mexico: 351533354,
    'Saudi Arabia': 502874,
    Singapore: 4834051,
    'South Korea': 1350658790,
    'United Kingdom': 152968267,
    'United States': 15718927234,
  },
  'Software & Technology': {
    Australia: 127397426,
    China: 263690707,
    France: 168252623,
    Germany: 248246056,
    India: 127055644,
    Japan: 141407150,
    Mexico: 444272139,
    'Saudi Arabia': 55514854,
    Singapore: 119235412,
    'South Korea': 123375971,
    'United Kingdom': 228807921,
    'United States': 13147138167,
  },
}
