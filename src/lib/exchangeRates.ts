// Daily exchange rates for showing a foreign-currency donation in Malawi Kwacha.
// DzalekaPay only charges in MWK; a card from abroad pays the MWK amount and the donor's bank converts it.
// Source: open.er-api.com (free, no key, updated daily). Rates are "units of currency per 1 MWK".

let cached: Promise<Record<string, number> | null> | null = null;

export const getMwkRates = (): Promise<Record<string, number> | null> => {
  if (!cached) {
    cached = fetch("https://open.er-api.com/v6/latest/MWK")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => (data?.result === "success" && data.rates ? (data.rates as Record<string, number>) : null))
      .catch(() => null)
      .then((rates) => {
        if (!rates) cached = null; // let a later attempt retry
        return rates;
      });
  }
  return cached;
};

// MWK -> another currency (e.g. the membership fee in TZS). Small amounts keep 2 decimals, others are whole units; rounded up.
export const fromMwk = (mwk: number, currency: string, rates: Record<string, number> | null): number | null => {
  if (!(mwk > 0)) return null;
  if (currency === "MWK") return Math.round(mwk);
  const rate = rates?.[currency];
  if (!rate || rate <= 0) return null;
  const value = mwk * rate;
  return value < 100 ? Math.ceil(value * 100) / 100 : Math.ceil(value);
};

// Whole kwacha, rounded up so the donor never pays less than they chose.
export const toMwk = (amount: number, currency: string, rates: Record<string, number> | null): number | null => {
  if (!(amount > 0)) return null;
  if (currency === "MWK") return Math.round(amount);
  const rate = rates?.[currency];
  if (!rate || rate <= 0) return null;
  return Math.ceil(amount / rate);
};
