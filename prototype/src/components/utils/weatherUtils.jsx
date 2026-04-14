/**
 * Fetch historical weather, tide, and wave data from Open-Meteo
 * for a given lat/lng and ISO datetime string.
 * Returns an object with weather fields ready to save on a Catch entity.
 */
export async function fetchWeatherData(lat, lng, isoTimestamp) {
  if (!lat || !lng || !isoTimestamp) return {};

  const date = new Date(isoTimestamp);
  const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
  const hour = date.getUTCHours();

  try {
    // ---- Weather (historical archive) ----
    const weatherUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation&timezone=GMT`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const temp = weatherData?.hourly?.temperature_2m?.[hour] ?? null;
    const windSpeed = weatherData?.hourly?.wind_speed_10m?.[hour] ?? null;
    const windDir = weatherData?.hourly?.wind_direction_10m?.[hour] ?? null;
    const weatherCode = weatherData?.hourly?.weather_code?.[hour] ?? null;
    const precip = weatherData?.hourly?.precipitation?.[hour] ?? null;

    // ---- Marine (tide + wave height) ----
    let tideHeight = null;
    let waveHeight = null;
    try {
      const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=sea_level_height_msl,wave_height&past_days=92&forecast_days=1&timezone=GMT`;
      const marineRes = await fetch(marineUrl);
      const marineData = await marineRes.json();

      const times = marineData?.hourly?.time ?? [];
      const targetTime = `${dateStr}T${String(hour).padStart(2, '0')}:00`;
      const idx = times.indexOf(targetTime);
      if (idx !== -1) {
        tideHeight = marineData?.hourly?.sea_level_height_msl?.[idx] ?? null;
        waveHeight = marineData?.hourly?.wave_height?.[idx] ?? null;
      }
    } catch (e) {
      // Marine data not available for this location (e.g. inland) — ignore
    }

    // ---- Moon phase (calculated locally) ----
    const moonPhase = calculateMoonPhase(date);

    return {
      weather_temp: temp,
      weather_wind_speed: windSpeed,
      weather_wind_dir: windDir,
      weather_code: weatherCode,
      weather_precip: precip,
      moon_phase: moonPhase,
      tide_height: tideHeight,
      wave_height: waveHeight,
    };
  } catch (e) {
    console.warn('Weather fetch failed', e);
    return {};
  }
}

/**
 * Calculate moon phase (0–1) from a date.
 * 0 / 1 = new moon, 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter
 */
export function calculateMoonPhase(date) {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const synodicMonth = 29.53058867;
  const diffMs = date - knownNewMoon;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const phase = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
  return parseFloat((phase / synodicMonth).toFixed(3));
}

/**
 * Returns a human-readable moon phase label and emoji.
 */
export function getMoonPhaseLabel(phase) {
  if (phase === null || phase === undefined) return { label: '—', emoji: '🌑' };
  if (phase < 0.03 || phase > 0.97) return { label: 'New Moon', emoji: '🌑' };
  if (phase < 0.22) return { label: 'Waxing Crescent', emoji: '🌒' };
  if (phase < 0.28) return { label: 'First Quarter', emoji: '🌓' };
  if (phase < 0.47) return { label: 'Waxing Gibbous', emoji: '🌔' };
  if (phase < 0.53) return { label: 'Full Moon', emoji: '🌕' };
  if (phase < 0.72) return { label: 'Waning Gibbous', emoji: '🌖' };
  if (phase < 0.78) return { label: 'Last Quarter', emoji: '🌗' };
  return { label: 'Waning Crescent', emoji: '🌘' };
}

/**
 * WMO weather code → label + emoji
 */
export function getWeatherLabel(code) {
  if (code === null || code === undefined) return { label: '—', emoji: '❓' };
  if (code === 0) return { label: 'Clear Sky', emoji: '☀️' };
  if (code <= 2) return { label: 'Partly Cloudy', emoji: '⛅' };
  if (code === 3) return { label: 'Overcast', emoji: '☁️' };
  if (code <= 49) return { label: 'Fog', emoji: '🌫️' };
  if (code <= 57) return { label: 'Drizzle', emoji: '🌦️' };
  if (code <= 67) return { label: 'Rain', emoji: '🌧️' };
  if (code <= 77) return { label: 'Snow', emoji: '❄️' };
  if (code <= 82) return { label: 'Rain Showers', emoji: '🌦️' };
  if (code <= 86) return { label: 'Snow Showers', emoji: '🌨️' };
  if (code <= 99) return { label: 'Thunderstorm', emoji: '⛈️' };
  return { label: '—', emoji: '❓' };
}

/**
 * Wind direction degrees → compass label
 */
export function getWindDirection(deg) {
  if (deg === null || deg === undefined) return '—';
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}