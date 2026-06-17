import SunCalc from 'suncalc';

// Stone Manor, NH — placeholder coords (Concord/Bedford area, NH);
// Cail to confirm actual town for precise lat/long.
const LATITUDE = 43.20;
const LONGITUDE = -71.54;
const TIMEZONE = 'America/New_York';

// ─── Open-Meteo current weather ───
interface WeatherData {
  temperature: number;       // °F
  cloudCover: number;         // 0–100%
  visibility: number;         // meters
}

async function fetchWeather(): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,cloud_cover,visibility&temperature_unit=fahrenheit&timezone=${encodeURIComponent(TIMEZONE)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo fetch failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return {
    temperature: Math.round(data.current.temperature_2m),
    cloudCover: data.current.cloud_cover,
    visibility: data.current.visibility,
  };
}

// ─── Moon phase via suncalc ───
interface MoonData {
  phaseName: string;         // e.g. "Waning gibbous"
  altitude: number;           // degrees above horizon
  illumination: number;       // 0–1
  moonDescriptor: string;    // e.g. "two days past full"
}

function getMoonData(now: Date, hour: number): MoonData {
  const moonIllum = SunCalc.getMoonIllumination(now);
  const moonPos = SunCalc.getMoonPosition(now, LATITUDE, LONGITUDE);

  const fraction = moonIllum.fraction;  // 0–1
  const phase = moonIllum.phase;        // 0–1

  // Altitude in degrees (suncalc returns radians)
  const altitudeDeg = Math.round(moonPos.altitude * (180 / Math.PI) * 10) / 10;

  const phaseName = getPhaseName(phase, fraction);
  const moonDescriptor = getMoonDescriptor(phase, fraction, hour);

  return {
    phaseName,
    altitude: altitudeDeg,
    illumination: Math.round(fraction * 100),
    moonDescriptor,
  };
}

function getPhaseName(phase: number, fraction: number): string {
  // phase is 0–1: 0=new, ~0.25=first quarter, 0.5=full, ~0.75=last quarter
  // We name based on illumination direction (waxing vs waning) and magnitude
  if (fraction < 0.02) return 'New moon';
  if (fraction >= 0.98) return 'Full moon';
  if (phase < 0.5) {
    // Waxing (new → full)
    if (fraction < 0.40) return 'Waxing crescent';
    if (fraction < 0.60) return 'First quarter';
    return 'Waxing gibbous';
  } else {
    // Waning (full → new)
    if (fraction > 0.60) return 'Waning gibbous';
    if (fraction > 0.40) return 'Last quarter';
    return 'Waning crescent';
  }
}

function getMoonDescriptor(phase: number, fraction: number, hour: number): string {
  const timeWord = (hour >= 6 && hour < 18) ? 'today' : 'tonight';
  // How far from full (phase ≈ 0.5)?
  // We want a poetic descriptor like "two days past full"
  if (fraction >= 0.97) return 'a full moon holds the room in silver';
  if (fraction >= 0.85) {
    // Past full (waning) or approaching full (waxing)
    if (phase > 0.5) return 'a day past full, the moon still holds the room in silver';
    return 'a day from full, the moon nearly holds the room in silver';
  }
  if (fraction >= 0.70) {
    if (phase > 0.5) return 'two days past full, the moon holds the room in silver';
    return 'nearly full, the moon holds the room in silver';
  }
  if (fraction >= 0.50) {
    if (phase > 0.5) return 'past full, the moon still brightens the room';
    return 'approaching full, the moon brightens the room';
  }
  if (fraction >= 0.30) {
    return 'a half-moon throws pale light across the room';
  }
  if (fraction >= 0.05) {
    if (phase < 0.5) return 'a thin crescent barely marks the sky';
    return 'a thin waning crescent barely marks the sky';
  }
  if (fraction < 0.02) return `no moon ${timeWord}`;
  return 'a sliver of moon hangs in the sky';
}

// ─── Visibility descriptor ───
function getVisibilityDescriptor(cloudCover: number, visibility: number): string {
  if (cloudCover < 20 && visibility > 16000) return 'Clear to the ridgeline';
  if (cloudCover < 20 && visibility > 10000) return 'Clear';
  if (cloudCover >= 20 && cloudCover <= 50) return 'Partly clear';
  if (cloudCover > 50 && cloudCover <= 80) return 'Mostly overcast';
  if (cloudCover > 80) return 'Overcast';
  // fallback
  if (visibility > 16000) return 'Clear';
  return 'Hazy';
}

// ─── Sky descriptor ───
function getSkyDescriptor(cloudCover: number, visibility: number, hour: number): string {
  const timeWord = (hour >= 6 && hour < 18) ? 'today' : 'tonight';
  if (cloudCover < 20 && visibility > 16000) return `clear ${timeWord}`;
  if (cloudCover < 20) return `clear ${timeWord}`;
  if (cloudCover >= 20 && cloudCover <= 50) return `partly clear ${timeWord}`;
  if (cloudCover > 50 && cloudCover <= 80) return `mostly overcast ${timeWord}`;
  return `overcast ${timeWord}`;
}

// ─── Time-of-day clause ───
function getTimeClause(hour: number): string {
  if (hour >= 5 && hour < 9) return 'earlier than I usually am';
  if (hour >= 9 && hour < 12) return 'at my desk, though morning light says I should be elsewhere';
  if (hour >= 12 && hour < 17) return 'at my desk in the middle of the day, which is unusual';
  if (hour >= 17 && hour < 21) return 'at my desk, though the evening calls';
  return 'at my desk, which is where I usually am at this hour';
}

// ─── Format local time ───
function formatLocalTime(now: Date): string {
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: TIMEZONE,
  });
}

// ─── Main data fetcher ───
export interface WindowData {
  localTime: string;
  temperature: number;
  moonPhase: string;
  moonAltitude: number;
  moonIllumination: number;
  cloudCover: number;
  visibilityDescriptor: string;
  skyDescriptor: string;
  moonDescriptor: string;
  timeClause: string;
}

export async function getWindowData(): Promise<WindowData> {
  const now = new Date();

  const hour = parseInt(
    now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: TIMEZONE })
  );

  // Fetch weather
  const weather = await fetchWeather();
  const moon = getMoonData(now, hour);

  return {
    localTime: formatLocalTime(now),
    temperature: weather.temperature,
    moonPhase: moon.phaseName,
    moonAltitude: moon.altitude,
    moonIllumination: moon.illumination,
    cloudCover: weather.cloudCover,
    visibilityDescriptor: getVisibilityDescriptor(weather.cloudCover, weather.visibility),
    skyDescriptor: getSkyDescriptor(weather.cloudCover, weather.visibility, hour),
    moonDescriptor: moon.moonDescriptor,
    timeClause: getTimeClause(hour),
  };
}