// Ported verbatim from WeatherDoge/src/main/res/values/strings.xml string-arrays.

export const WOWS = ["wow", "so wow"];

export const DOGEFIX = ["such %s", "very %s", "much %s", "so %s"];

export const WEATHER_ADJECTIVES = {
  polarvortex: ["winter", "freeze", "polar vortex", "ridiculous", "hibernate", "climate change", "doom"],
  yuck: ["cold", "freeze", "shiver", "ice", "yuck", "climate change", "popsicle"],
  notokay: ["icy", "winter", "chill", "crisp", "brrrrr", "cool", "not okay"],
  chilly: ["icy", "frost", "numb", "shiver", "brrr", "chilly", "below freezing point"],
  concern: ["chilly", "concern", "coat", "frosty", "uh oh", "brrrr", "almost freezing"],
  whatever: ["moderate", "mild", "okay", "medium", "cool", "whatever", "brisk"],
  warmth: ["heat", "warmth", "climate", "sweating", "balmy", "nice day", "ambient"],
  globalwarming: ["boiling", "bake", "melt", "dying", "suffer", "global warming", "tropical heat"],
} as const;

// Background (sky condition) related descriptors, keyed by OWM icon code.
export const BG_ADJECTIVES: Record<string, string[]> = {
  "01d": ["clear", "sky", "lovely", "amaze", "wonderful", "sun", "weather"],
  "01n": ["night", "amaze", "clear", "lovely", "wonderful", "sky", "stars", "moon", "dark", "weather"],
  "02d": ["cloud", "okay", "cumulus", "amaze", "sky", "weather"],
  // Note: the Android app has a bug where the "02n" case always resolves to bg_02d
  // (the night branch of the ternary was mistakenly written as bg_02d). Reproduced here for parity.
  "02n": ["cloud", "okay", "cumulus", "amaze", "sky", "weather"],
  "03d": ["cloudy", "scattered", "overcast", "weather"],
  "03n": ["cloud", "scattered", "clear sky", "night time", "weather"],
  "04d": ["gloomy", "clouds", "shady", "boring", "weather"],
  "04n": ["gloomy", "clouds", "shady", "boring", "weather"],
  "09d": ["cloud", "showers", "raindrop", "wet", "weather"],
  "09n": ["cloud", "showers", "raindrop", "wet", "night", "weather"],
  "10d": ["raindrops", "soak", "wet", "slippery", "shower", "terrible", "weather"],
  "10n": ["raindrops", "soak", "wet", "slippery", "shower", "terrible", "scary", "dark cloud", "night", "weather"],
  "11d": ["thunder", "loud", "scare", "bolt", "lightning", "terrible", "hide", "weather"],
  "11n": ["scary night", "thunder", "loud", "crash", "bolt", "lightning", "terrible", "hide", "weather"],
  "13d": ["snow", "white", "soft", "icy", "snowflake", "powder", "joy", "shiny", "festive", "weather"],
  "13n": ["snow", "white", "night time", "slippery", "icy", "snowflake", "powder", "joy", "shiny", "festive", "weather"],
  "50d": ["mist", "vapor", "creepy", "spook", "blind", "low visibility", "darkness", "gloomy", "depress", "weather"],
  "50n": ["mist", "vapor", "creepy", "spook", "blind", "low visibility", "darkness", "gloomy", "depress", "weather"],
};

// Colors from res/values/colors.xml integer-array "wow_colors".
export const WOW_COLORS = [
  "#0066FF", "#FF3399", "#33CC33", "#FFFF99", "#FFFF75",
  "#8533FF", "#33D6FF", "#FF5CFF", "#19D1A3", "#FF4719",
  "#197519", "#6699FF", "#4747D1", "#D1D1E0", "#FF5050",
  "#FFFFF0", "#CC99FF", "#66E0C2", "#FF4DFF", "#00CCFF",
];
