/** Locale-aware formatting (Hermes ships Intl). Formatters are cached: creating them is expensive. */
const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(value: number, locale: string, currency = 'USD'): string {
  const key = `${locale}-${currency}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
    currencyFormatters.set(key, formatter);
  }
  return formatter.format(value);
}
