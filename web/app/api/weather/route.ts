import { NextRequest, NextResponse } from "next/server";

// Ported from WeatherUtil.getWeatherFromOWM() - proxies the OWM "current weather"
// endpoint server-side so the API key never reaches the browser.

function capitalizeDescription(description: string): string {
  const capitalized = description.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
  // Matches the Android app's regex fixup: "Sky Is Clear" -> "Sky is Clear".
  return capitalized.replace(/(?<=[^\w])Is(?=[^\w]|$)/g, "is");
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenWeatherMap App ID has not been set on the server." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const q = searchParams.get("q");

  const owmUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
  if (q) {
    owmUrl.searchParams.set("q", q);
  } else if (lat && lon) {
    owmUrl.searchParams.set("lat", lat);
    owmUrl.searchParams.set("lon", lon);
  } else {
    return NextResponse.json({ error: "Provide either q, or lat and lon." }, { status: 400 });
  }
  owmUrl.searchParams.set("APPID", apiKey);

  const res = await fetch(owmUrl.toString());
  const body = await res.json();

  if (body.cod !== 200 && body.cod !== "200") {
    return NextResponse.json(
      { error: body.message ?? "Unable to fetch weather." },
      { status: typeof body.cod === "number" ? body.cod : 502 },
    );
  }

  const weather = body.weather?.[0] ?? {};
  const temperatureC = body.main.temp - 273.15;

  return NextResponse.json({
    temperatureC,
    condition: capitalizeDescription(weather.description ?? ""),
    icon: weather.icon ?? "01d",
    place: q ?? body.name,
    cityId: body.id,
    time: Date.now(),
    link: `https://openweathermap.org/city/${body.id}`,
  });
}
