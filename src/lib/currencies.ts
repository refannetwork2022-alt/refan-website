// World currency list for forms. Currencies common for ReFAN's members and supporters come first,
// then every other currency the browser knows (ISO 4217), with English names.

const PREFERRED = ["MWK", "USD", "EUR", "GBP", "TZS", "KES", "UGX", "BIF", "RWF", "CDF", "ZMW", "MZN", "ZAR"];

const FALLBACK = [
  "AED", "AUD", "BRL", "CAD", "CHF", "CNY", "EGP", "ETB", "GHS", "INR", "JPY", "NGN", "SEK", "SSP", "XAF", "XOF",
];

const displayNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "currency" });
  } catch {
    return null;
  }
})();

export const currencyName = (code: string): string => displayNames?.of(code) || code;

export const WORLD_CURRENCIES: string[] = (() => {
  let all: string[] = [];
  try {
    all = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("currency") ?? [];
  } catch {
    all = [];
  }
  if (!all.length) all = FALLBACK;
  const rest = all.filter((c) => !PREFERRED.includes(c)).sort();
  return [...PREFERRED, ...rest];
})();
