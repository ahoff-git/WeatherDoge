// Ported from WeatherDoge/src/main/java/com/versobit/weatherdoge/WeatherDoge.java
// Selection logic keys off the raw OpenWeatherMap icon code, e.g. "10d" -> img=10, day=true.

import { BG_ADJECTIVES, DOGEFIX, WEATHER_ADJECTIVES, WOWS } from "./phrases";

export interface WeatherData {
  temperatureC: number;
  condition: string;
  icon: string; // raw OWM icon code, e.g. "10d"
  place: string;
  cityId: number;
  time: number;
}

function parseIcon(icon: string): { img: number; day: boolean } {
  return { img: parseInt(icon.substring(0, 2), 10), day: icon.charAt(2) === "d" };
}

const SKY_CODES: Record<number, { d: string; n: string }> = {
  1: { d: "01d", n: "01n" },
  2: { d: "02d", n: "02n" },
  3: { d: "03d", n: "03n" },
  4: { d: "04d", n: "04n" },
  9: { d: "09d", n: "09n" },
  // No sky_10n asset exists in the original app; it falls back to sky_09n.
  10: { d: "10d", n: "09n" },
  11: { d: "11d", n: "11n" },
  13: { d: "13d", n: "13n" },
  50: { d: "50d", n: "50n" },
};

const DOGE_CODES: Record<number, { d: string; n: string }> = {
  1: { d: "01d", n: "01n" },
  // Quirk from the original app: daytime code 2 shows doge_04, not a doge_02d.
  2: { d: "04", n: "02n" },
  3: { d: "03d", n: "03n" },
  4: { d: "04", n: "04" },
  9: { d: "09", n: "09" },
  10: { d: "10", n: "10" },
  11: { d: "11", n: "11" },
  13: { d: "13", n: "13" },
  50: { d: "50", n: "50" },
};

export function skySelect(icon: string): string {
  const { img, day } = parseIcon(icon);
  const entry = SKY_CODES[img] ?? SKY_CODES[1];
  return `/images/sky_${day ? entry.d : entry.n}.jpg`;
}

export function dogeSelect(icon: string): string {
  const { img, day } = parseIcon(icon);
  const entry = DOGE_CODES[img] ?? DOGE_CODES[1];
  return `/images/doge_${day ? entry.d : entry.n}.png`;
}

export function isSnowing(icon: string): boolean {
  const { img } = parseIcon(icon);
  return img === 13;
}

// temp must be in Celsius
export function getTempAdjectives(temp: number): string[] {
  if (temp <= -30) return [...WEATHER_ADJECTIVES.polarvortex];
  if (temp <= -15) return [...WEATHER_ADJECTIVES.yuck];
  if (temp <= -7) return [...WEATHER_ADJECTIVES.notokay];
  if (temp <= 0) return [...WEATHER_ADJECTIVES.chilly];
  if (temp <= 10) return [...WEATHER_ADJECTIVES.concern];
  if (temp <= 20) return [...WEATHER_ADJECTIVES.whatever];
  if (temp <= 30) return [...WEATHER_ADJECTIVES.warmth];
  return [...WEATHER_ADJECTIVES.globalwarming];
}

export function getBgAdjectives(icon: string): string[] {
  return [...(BG_ADJECTIVES[icon] ?? BG_ADJECTIVES["01d"])];
}

// Mirrors WeatherDoge.getDogeism(): bare "wow"/"so wow" is weighted
// proportionally to the combined adjective pool so it isn't overrepresented.
export function getDogeism(weatherAdjectives: string[]): string {
  const wowOrNot = Math.floor(Math.random() * (weatherAdjectives.length + WOWS.length));
  if (wowOrNot >= weatherAdjectives.length) {
    return WOWS[wowOrNot - weatherAdjectives.length];
  }
  const fix = DOGEFIX[Math.floor(Math.random() * DOGEFIX.length)];
  const word = weatherAdjectives[Math.floor(Math.random() * weatherAdjectives.length)];
  return fix.replace("%s", word);
}
