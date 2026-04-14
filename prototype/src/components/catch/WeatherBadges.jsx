import React from 'react';
import { getMoonPhaseLabel, getWeatherLabel, getWindDirection } from '@/components/utils/weatherUtils';

export default function WeatherBadges({ catchData, compact = false }) {
  const {
    weather_temp, weather_wind_speed, weather_wind_dir,
    weather_code, moon_phase, tide_height, wave_height
  } = catchData;

  const hasAny = [weather_temp, weather_wind_speed, moon_phase, tide_height, wave_height, weather_code]
    .some(v => v !== null && v !== undefined);

  if (!hasAny) return null;

  const moon = getMoonPhaseLabel(moon_phase);
  const weather = getWeatherLabel(weather_code);
  const windCompass = getWindDirection(weather_wind_dir);

  const badges = [];

  if (weather_code !== null && weather_code !== undefined) {
    badges.push({ emoji: weather.emoji, label: weather.label });
  }
  if (weather_temp !== null && weather_temp !== undefined) {
    badges.push({ emoji: '🌡️', label: `${weather_temp}°C` });
  }
  if (weather_wind_speed !== null && weather_wind_speed !== undefined) {
    badges.push({ emoji: '💨', label: `${weather_wind_speed} km/h ${windCompass}` });
  }
  if (moon_phase !== null && moon_phase !== undefined) {
    badges.push({ emoji: moon.emoji, label: compact ? moon.emoji : moon.label });
  }
  if (tide_height !== null && tide_height !== undefined) {
    badges.push({ emoji: '🌊', label: `${tide_height.toFixed(1)}m tide` });
  }
  if (wave_height !== null && wave_height !== undefined) {
    badges.push({ emoji: '🏄', label: `${wave_height.toFixed(1)}m waves` });
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {badges.slice(0, 4).map((b, i) => (
          <span key={i} className="text-[10px] bg-[#252525] text-gray-400 px-1.5 py-0.5 rounded-md">{b.emoji} {b.label}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 p-4 mt-3">
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Conditions at Catch</p>
      <div className="grid grid-cols-2 gap-2">
        {badges.map((b, i) => (
          <div key={i} className="flex items-center gap-2 bg-[#252525] rounded-xl px-3 py-2">
            <span className="text-base">{b.emoji}</span>
            <span className="text-gray-300 text-sm">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}