// Ported from UnitLocale.java: imperial only for US, Liberia (LR), and Myanmar (MM).
const IMPERIAL_COUNTRIES = new Set(["US", "LR", "MM"]);

export function isImperialLocale(): boolean {
  if (typeof navigator === "undefined") return false;
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    return !!region && IMPERIAL_COUNTRIES.has(region);
  } catch {
    return false;
  }
}

export function formatTemperature(celsius: number, forceMetric: boolean): string {
  const useFahrenheit = isImperialLocale() && !forceMetric;
  const value = useFahrenheit ? celsius * 1.8 + 32 : celsius;
  return `${Math.round(value)}°${useFahrenheit ? "F" : "C"}`;
}
