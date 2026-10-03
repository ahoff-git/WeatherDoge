"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getCached, setCached } from "@/lib/cache";
import { formatTemperature } from "@/lib/units";
import { dogeSelect, getBgAdjectives, getDogeism, getTempAdjectives, skySelect, WeatherData } from "@/lib/weatherDoge";
import { WOW_COLORS } from "@/lib/phrases";

const WOW_INTERVAL_MS = 2300;
const WOW_LIFETIME_MS = 3200;
const GEOCODE_DEBOUNCE_MS = 300;

interface Phrase {
  id: number;
  text: string;
  top: string;
  left: string;
  color: string;
  fontSize: string;
}

interface PlaceSuggestion {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

function placeLabel(place: PlaceSuggestion): string {
  return [place.name, place.state, place.country].filter(Boolean).join(", ");
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const recentTexts = useRef<string[]>([]);
  const phraseId = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestIdRef = useRef(0);

  const loadWeather = useCallback(async (params: { lat: number; lon: number } | { q: string }) => {
    setLoading(true);
    setError(null);

    const cached = getCached<WeatherData>(params);
    if (cached) {
      setWeather(cached);
      setLoading(false);
      return;
    }

    const search = new URLSearchParams(
      "q" in params ? { q: params.q } : { lat: String(params.lat), lon: String(params.lon) },
    );
    try {
      const res = await fetch(`/api/weather?${search.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to fetch weather.");
      setWeather(data);
      setCached(params, data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to fetch weather.");
    } finally {
      setLoading(false);
    }
  }, []);

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation isn't available in this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => loadWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {
        setLoading(false);
        setError("Location access was denied. Search for a place instead.");
      },
    );
  }, [loadWeather]);

  useEffect(() => {
    const trimmed = query.trim();
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      if (trimmed.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (requestId !== requestIdRef.current) return; // a newer request has superseded this one
        setSuggestions(data.results ?? []);
        setActiveIndex(-1);
      } catch {
        if (requestId === requestIdRef.current) setSuggestions([]);
      }
    }, GEOCODE_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const selectSuggestion = useCallback(
    (place: PlaceSuggestion) => {
      setQuery(placeLabel(place));
      setShowSuggestions(false);
      setSuggestions([]);
      loadWeather({ lat: place.lat, lon: place.lon });
    },
    [loadWeather],
  );

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time capability check, not a render loop
      setError("Geolocation isn't available in this browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => loadWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {
        setLoading(false);
        setError("Location access was denied. Search for a place instead.");
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Spawn floating "such wow" phrases, mirroring MainActivity.OverlayTimerTask.
  useEffect(() => {
    if (!weather) return;
    const adjectives = [...getTempAdjectives(Math.round(weather.temperatureC)), ...getBgAdjectives(weather.icon)];

    const interval = setInterval(() => {
      let text = getDogeism(adjectives);
      let attempts = 0;
      while (recentTexts.current.includes(text) && attempts < 5) {
        text = getDogeism(adjectives);
        attempts++;
      }
      recentTexts.current = [text, ...recentTexts.current].slice(0, 4);

      const id = phraseId.current++;
      const phrase: Phrase = {
        id,
        text,
        top: `${10 + Math.random() * 70}%`,
        left: `${5 + Math.random() * 70}%`,
        color: WOW_COLORS[Math.floor(Math.random() * WOW_COLORS.length)],
        fontSize: `${1.2 + Math.random() * 1.6}rem`,
      };
      setPhrases((prev) => [...prev, phrase]);
      setTimeout(() => {
        setPhrases((prev) => prev.filter((p) => p.id !== id));
      }, WOW_LIFETIME_MS);
    }, WOW_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [weather]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) loadWeather({ q: query.trim() });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white">
      {weather && (
        <Image
          src={skySelect(weather.icon)}
          alt=""
          fill
          priority
          className="object-cover"
        />
      )}

      <div className="relative z-10 flex flex-1 flex-col">
        <form onSubmit={handleSearch} className="flex flex-wrap items-start gap-2 p-4">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={handleSearchKeyDown}
              placeholder="such search... (city name)"
              role="combobox"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-autocomplete="list"
              aria-controls="place-suggestions"
              className="w-64 rounded-full bg-black/40 px-4 py-2 text-sm text-white placeholder-white/60 backdrop-blur focus:outline-none"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul
                id="place-suggestions"
                role="listbox"
                className="absolute top-full z-30 mt-1 w-full overflow-hidden rounded-2xl bg-black/80 text-sm backdrop-blur"
              >
                {suggestions.map((place, i) => (
                  <li key={`${place.name}-${place.lat}-${place.lon}`} role="option" aria-selected={i === activeIndex}>
                    <button
                      type="button"
                      // onMouseDown fires before the input's onBlur, so the click isn't lost to the blur-close.
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectSuggestion(place)}
                      className={`block w-full px-4 py-2 text-left hover:bg-white/10 ${i === activeIndex ? "bg-white/10" : ""}`}
                    >
                      {placeLabel(place)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="rounded-full bg-black/40 px-4 py-2 text-sm backdrop-blur hover:bg-black/60">
            Search
          </button>
          <button
            type="button"
            onClick={locateUser}
            className="rounded-full bg-black/40 px-4 py-2 text-sm backdrop-blur hover:bg-black/60"
          >
            Use my location
          </button>
        </form>

        {loading && <p className="px-4 text-sm text-white/80">wow. much loading...</p>}
        {error && <p className="px-4 text-sm text-red-300">{error}</p>}

        {weather && (
          <div className="flex flex-1 flex-col items-center justify-end gap-2 pb-10 text-center">
            <p className="font-comic-neue text-7xl drop-shadow-lg">{formatTemperature(weather.temperatureC, false)}</p>
            <p className="font-comic-neue text-xl drop-shadow">{weather.condition}</p>
            <p className="font-comic-neue text-lg text-white/90 drop-shadow">{weather.place}</p>
            <Image
              src={dogeSelect(weather.icon)}
              alt="doge"
              width={260}
              height={260}
              className="mt-4 drop-shadow-2xl"
            />
          </div>
        )}
      </div>

      {phrases.map((p) => (
        <span
          key={p.id}
          className="font-comic-neue pointer-events-none absolute z-20 animate-wow-fade font-bold drop-shadow"
          style={{ top: p.top, left: p.left, color: p.color, fontSize: p.fontSize }}
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}
