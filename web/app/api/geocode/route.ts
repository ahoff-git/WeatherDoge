import { NextRequest, NextResponse } from "next/server";

interface OwmGeocodeResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  // OWM also includes a `local_names` map of city-name translations we don't use; dropped below.
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenWeatherMap App ID has not been set on the server." }, { status: 500 });
  }

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const geocodeUrl = new URL("https://api.openweathermap.org/geo/1.0/direct");
  geocodeUrl.searchParams.set("q", q);
  geocodeUrl.searchParams.set("limit", "5");
  geocodeUrl.searchParams.set("appid", apiKey);

  const res = await fetch(geocodeUrl.toString());
  if (!res.ok) {
    return NextResponse.json({ error: "Unable to search for that place." }, { status: 502 });
  }
  const body: OwmGeocodeResult[] = await res.json();

  // Collapse duplicate name/country/state combos (OWM can return the same city twice
  // for different data sources).
  const seen = new Set<string>();
  const results = body
    .map(({ name, lat, lon, country, state }) => ({ name, lat, lon, country, state }))
    .filter((r) => {
      const key = `${r.name}|${r.state ?? ""}|${r.country}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return NextResponse.json({ results });
}
