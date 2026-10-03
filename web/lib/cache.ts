// Mirrors Cache.java: a short TTL cache keyed by location, so moving a few
// hundred meters or re-rendering doesn't re-hit the API every time.
const TTL_MS = 10 * 60 * 1000;

function keyFor(query: { lat: number; lon: number } | { q: string }): string {
  if ("q" in query) return `q:${query.q.toLowerCase()}`;
  // ~2 decimal places ~ 1.1km, same fuzz factor as the Android app.
  return `c:${query.lat.toFixed(2)},${query.lon.toFixed(2)}`;
}

export function getCached<T>(query: { lat: number; lon: number } | { q: string }): T | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(keyFor(query));
    if (!raw) return null;
    const { data, expires } = JSON.parse(raw);
    if (Date.now() > expires) return null;
    return data as T;
  } catch {
    return null;
  }
}

export function setCached<T>(query: { lat: number; lon: number } | { q: string }, data: T): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(keyFor(query), JSON.stringify({ data, expires: Date.now() + TTL_MS }));
  } catch {
    // sessionStorage can throw in private browsing / quota exceeded - non-fatal.
  }
}
