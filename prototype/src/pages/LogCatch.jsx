import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigation } from '@/components/NavigationContext';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Zap, Camera, Loader2, ImagePlus, ChevronDown, Sparkles, Check, Cloud, Wifi, WifiOff } from 'lucide-react';
import { fetchWeatherData } from '@/components/utils/weatherUtils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import GearSection from '@/components/catch/GearSection';
import * as exifr from 'exifr';

const GOLD_COAST_FISH = [
  'Bream (Yellowfin)',
  'Flathead (Dusky)',
  'Whiting (Sand)',
  'Trevally (Giant)',
  'Trevally (Golden)',
  'Mangrove Jack',
  'Snapper (Squire)',
  'Barramundi',
  'Tailor',
  'Tuna (Longtail)',
  'Mackerel (Spanish)',
  'Mackerel (Grey)',
  'Queenfish',
  'Dart',
  'Mulloway (Jewfish)',
  'Tarpon',
  'Flathead (Tiger)',
  'Cobia',
  'Mahi-Mahi',
  'Marlin',
  'Wahoo',
  'Reef Cod',
  'Sweetlip',
  'Coral Trout',
  'Parrotfish',
  'Yellowtail Kingfish',
  'Shark (Whaler)',
  'Ray (Bull)',
  'Garfish',
  'Luderick (Blackfish)',
  'Other',
];

// Check if user has internet (4G/5G/WiFi)
function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}

export default function LogCatch() {
  const { navigate, goBack, currentParams } = useNavigation();
  const sessionId = currentParams.session_id || null;
  const isOnline = useOnline();

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExifData, setHasExifData] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localSpecies, setLocalSpecies] = useState([]);

  // Load past species from offline cache
  useEffect(() => {
    base44.entities.Catch.list('-created_date', 100).then(catches => {
      const seen = [...new Set(catches.map(c => c.fish_type).filter(Boolean))];
      setLocalSpecies(seen);
    }).catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    fish_type: 'Not Identified',
    length: '',
    timestamp: new Date().toISOString(),
    location_lat: null,
    location_lng: null,
    location_name: '',
    is_private: true,
  });

  const [gear, setGear] = useState({
    lure_type: '',
    lure_brand: '',
    lure_size: '',
    lure_hook_size: '',
    lure_photo_url: '',
    line_type: '',
    line_weight: '',
  });

  const [showGear, setShowGear] = useState(false);

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let locationName = '';
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            locationName = data.address?.suburb || data.address?.city || data.address?.town || '';
          } catch (e) {}
          resolve({ lat, lng, name: locationName });
        },
        () => resolve(null),
        { timeout: 10000 }
      );
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImageFile(file);
    setAiSuggestions([]);

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    // Extract EXIF data (GPS + timestamp) from the original file bytes
    let timestamp = new Date().toISOString();
    let exifFound = false;
    let exifLat = null;
    let exifLng = null;

    try {
      const exif = await exifr.parse(file, {
        tiff: true,
        exif: true,
        gps: true,
        interop: false,
        translateKeys: true,
        translateValues: true,
      });

      if (exif) {
        // GPS from EXIF
        if (exif.latitude != null && exif.longitude != null) {
          exifLat = exif.latitude;
          exifLng = exif.longitude;
          exifFound = true;
        }

        // Timestamp from EXIF (DateTimeOriginal preferred)
        const exifDate = exif.DateTimeOriginal || exif.CreateDate || exif.DateTime;
        if (exifDate) {
          const parsed = new Date(exifDate);
          if (!isNaN(parsed.getTime())) {
            timestamp = parsed.toISOString();
            exifFound = true;
          }
        }
      }
    } catch (err) {
      // EXIF parse failed — fall back to file.lastModified
      if (file.lastModified) {
        const fileDate = new Date(file.lastModified);
        if (Math.abs(new Date() - fileDate) > 60000) {
          timestamp = fileDate.toISOString();
          exifFound = true;
        }
      }
    }

    // Use EXIF GPS if available, otherwise fall back to device GPS
    let locationLat = exifLat;
    let locationLng = exifLng;
    let locationName = '';

    if (locationLat && locationLng) {
      // Reverse geocode the EXIF GPS coords
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${locationLat}&lon=${locationLng}&format=json`);
        const data = await res.json();
        locationName = data.address?.suburb || data.address?.city || data.address?.town || '';
      } catch (e) {}
    } else {
      // No EXIF GPS — use device location
      const location = await getCurrentLocation();
      locationLat = location?.lat || null;
      locationLng = location?.lng || null;
      locationName = location?.name || '';
    }

    setFormData(prev => ({ ...prev, timestamp, location_lat: locationLat, location_lng: locationLng, location_name: locationName }));
    setHasExifData(exifFound);
    setIsProcessing(false);

    // Fetch weather in background
    if (locationLat) {
      setIsFetchingWeather(true);
      fetchWeatherData(locationLat, locationLng, timestamp).then(wd => {
        setWeatherData(wd);
        setIsFetchingWeather(false);
      });
    }
  };

    const handleAiIdentify = async () => {
      if (!imageFile || !isOnline) return;
      setIsIdentifying(true);
      setAiSuggestions([]);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a fish identification expert specialising in Australian fish, particularly from the Gold Coast, Queensland region.
    Analyse this fishing photo and identify the fish species.
    Return your top 3 suggestions ranked by confidence.
    Only suggest species that are commonly found in Gold Coast waters (both inshore and offshore).
    Be specific with common Australian names.`,
          file_urls: [file_url],
          response_json_schema: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    species: { type: 'string' },
                    confidence: { type: 'string', enum: ['High', 'Medium', 'Low'] },
                  },
                },
              },
            },
          },
        });
        if (result?.suggestions?.length) {
          setAiSuggestions(result.suggestions);
          setFormData(prev => ({ ...prev, fish_type: result.suggestions[0].species }));
        }
      } catch (e) {
        console.log('AI identification failed', e);
      }
      setIsIdentifying(false);
    };

  const handleSave = async () => {
    if (!imageFile) return;
    setIsSaving(true);
    // Navigate home immediately (optimistic) — upload happens in background
    navigate('Home');
    const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
    await base44.entities.Catch.create({
        photo_url: file_url,
        fish_type: formData.fish_type,
        length: formData.length ? parseFloat(formData.length) : null,
        timestamp: formData.timestamp,
        location_lat: formData.location_lat,
        location_lng: formData.location_lng,
        location_name: formData.location_name,
        is_private: formData.is_private,
        has_exif_data: hasExifData,
        session_id: sessionId,
        ...(weatherData || {}),
        lure_type: gear.lure_type || null,
        lure_brand: gear.lure_brand || null,
        lure_size: gear.lure_size || null,
        lure_hook_size: gear.lure_hook_size || null,
        lure_photo_url: gear.lure_photo_url || null,
        line_type: gear.line_type || null,
        line_weight: gear.line_weight || null,
      });
  };

  const formattedDate = format(new Date(formData.timestamp), 'MMM d, yyyy · h:mm a');

  return (
    <div className="min-h-screen bg-[#121212] pb-10">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-xl border-b border-gray-800/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => goBack()}
            className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight">TACKLE TALLY</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Log Your Catch</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">

        {/* PHOTO CARD */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E1E1E] rounded-2xl border border-gray-800 overflow-hidden">
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="catch" className="w-full aspect-[4/3] object-cover" />
              {hasExifData && (
                <div className="absolute top-3 left-3 bg-[#CCFF00] text-[#121212] px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" fill="currentColor" />
                  <span className="text-xs font-bold uppercase">Big Brain</span>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-600"
              >
                Change Photo
              </button>
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-3 hover:bg-[#252525] transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#CCFF00]/10 border-2 border-dashed border-[#CCFF00]/30 flex items-center justify-center">
                <ImagePlus className="w-8 h-8 text-[#CCFF00]" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Add Photo</p>
                <p className="text-gray-500 text-sm mt-0.5">Tap to select from gallery</p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                  className="flex items-center gap-1.5 bg-[#2A2A2A] text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-700"
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </button>
                <span className="flex items-center gap-1.5 bg-[#2A2A2A] text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-700">
                  <ImagePlus className="w-4 h-4" />
                  Gallery
                </span>
              </div>
            </button>
          )}
        </motion.div>

        {/* AI SUGGESTIONS */}
        {aiSuggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E1E1E] rounded-2xl border border-[#CCFF00]/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#CCFF00]" />
              <span className="text-[#CCFF00] text-xs font-bold uppercase tracking-widest">AI Suggestions</span>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setFormData(prev => ({ ...prev, fish_type: s.species }))}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${formData.fish_type === s.species ? 'bg-[#CCFF00]/15 border border-[#CCFF00]/40' : 'bg-[#2A2A2A] border border-transparent'}`}
                >
                  <div className="flex items-center gap-2">
                    {formData.fish_type === s.species && <Check className="w-4 h-4 text-[#CCFF00]" />}
                    <span className="text-white font-semibold text-sm">{s.species}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    s.confidence === 'High' ? 'bg-green-500/15 text-green-400' :
                    s.confidence === 'Medium' ? 'bg-yellow-500/15 text-yellow-400' :
                    'bg-gray-500/15 text-gray-400'
                  }`}>{s.confidence}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* DETAILS CARD */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[#1E1E1E] rounded-2xl border border-gray-800 p-5 space-y-5">

          {/* Species Identification */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-gray-400 text-xs uppercase tracking-widest">Species</Label>
              <div className="flex items-center gap-1.5">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-[10px] text-green-400 font-semibold"><Wifi className="w-3 h-3" />Online</span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold"><WifiOff className="w-3 h-3" />Offline</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  value={formData.fish_type}
                  onChange={e => setFormData(prev => ({ ...prev, fish_type: e.target.value }))}
                  placeholder="Not Identified"
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  className="w-full bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-base border border-gray-700 focus:border-[#CCFF00] outline-none pr-10"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                {showDropdown && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#2A2A2A] border border-gray-700 rounded-xl overflow-auto max-h-52 shadow-xl">
                    {/* Recent local catches first */}
                    {localSpecies.filter(f => f !== 'Not Identified' && f.toLowerCase().includes((formData.fish_type === 'Not Identified' ? '' : formData.fish_type).toLowerCase())).map(fish => (
                      <button
                        key={'local-' + fish}
                        onMouseDown={() => setFormData(prev => ({ ...prev, fish_type: fish }))}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#CCFF00] hover:bg-[#333] transition-colors flex items-center gap-2"
                      >
                        <span className="text-[10px] bg-[#CCFF00]/10 text-[#CCFF00] px-1.5 py-0.5 rounded font-bold">Recent</span>
                        {fish}
                      </button>
                    ))}
                    {/* Standard list */}
                    {GOLD_COAST_FISH.filter(f => {
                      const q = formData.fish_type === 'Not Identified' ? '' : formData.fish_type;
                      return f.toLowerCase().includes(q.toLowerCase()) && !localSpecies.includes(f);
                    }).map(fish => (
                      <button
                        key={fish}
                        onMouseDown={() => setFormData(prev => ({ ...prev, fish_type: fish }))}
                        className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#333] transition-colors"
                      >
                        {fish}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* AI Identify button - only if online and photo selected */}
              {imageFile && (
                <button
                  onClick={handleAiIdentify}
                  disabled={!isOnline || isIdentifying}
                  title={isOnline ? 'AI Identify' : 'No internet connection'}
                  className={`flex items-center gap-1.5 px-3 py-3 rounded-xl font-bold text-sm flex-shrink-0 transition-colors ${
                    isOnline
                      ? 'bg-[#CCFF00]/10 border border-[#CCFF00]/40 text-[#CCFF00] hover:bg-[#CCFF00]/20'
                      : 'bg-[#2A2A2A] border border-gray-700 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isIdentifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {!isIdentifying && <span className="hidden sm:inline">AI ID</span>}
                </button>
              )}
            </div>
            {!isOnline && (
              <p className="text-gray-600 text-xs mt-1.5">AI identification requires internet. You can still vault your catch.</p>
            )}
          </div>

          {/* Size */}
          <div>
            <Label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Size (cm)</Label>
            <input
              type="number"
              value={formData.length}
              onChange={e => setFormData(prev => ({ ...prev, length: e.target.value }))}
              placeholder="e.g. 48"
              className="w-full bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-base border border-gray-700 focus:border-[#CCFF00] outline-none"
            />
          </div>

          {/* Auto-detected info */}
          {(formData.location_name || formData.location_lat) && (
            <div className="flex items-center gap-3 py-2 border-t border-gray-800">
              <MapPin className="w-4 h-4 text-[#CCFF00] flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Location</p>
                <p className="text-white text-sm font-medium">
                  {formData.location_name || `${formData.location_lat?.toFixed(4)}, ${formData.location_lng?.toFixed(4)}`}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 py-2 border-t border-gray-800">
            <Calendar className="w-4 h-4 text-[#CCFF00] flex-shrink-0" />
            <div>
              <p className="text-gray-500 text-xs">Date & Time</p>
              <p className="text-white text-sm font-medium">{formattedDate}</p>
            </div>
            {hasExifData && <Zap className="w-3.5 h-3.5 text-[#CCFF00] ml-auto" />}
          </div>

          {/* Weather data */}
            {(isFetchingWeather || weatherData) && (
              <div className="border-t border-gray-800 pt-4">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" /> Conditions at Catch
                  {isFetchingWeather && <span className="text-[10px] text-gray-600 ml-1">Fetching...</span>}
                </p>
                {weatherData && (
                  <div className="flex flex-wrap gap-2">
                    {weatherData.weather_temp !== null && (
                      <span className="bg-[#2A2A2A] text-gray-300 text-xs px-2.5 py-1 rounded-lg">🌡️ {weatherData.weather_temp}°C</span>
                    )}
                    {weatherData.weather_wind_speed !== null && (
                      <span className="bg-[#2A2A2A] text-gray-300 text-xs px-2.5 py-1 rounded-lg">💨 {weatherData.weather_wind_speed} km/h</span>
                    )}
                    {weatherData.moon_phase !== null && (
                      <span className="bg-[#2A2A2A] text-gray-300 text-xs px-2.5 py-1 rounded-lg">🌕 Moon {Math.round(weatherData.moon_phase * 100)}%</span>
                    )}
                    {weatherData.tide_height !== null && (
                      <span className="bg-[#2A2A2A] text-gray-300 text-xs px-2.5 py-1 rounded-lg">🌊 Tide {weatherData.tide_height?.toFixed(1)}m</span>
                    )}
                    {weatherData.wave_height !== null && (
                      <span className="bg-[#2A2A2A] text-gray-300 text-xs px-2.5 py-1 rounded-lg">🏄 Waves {weatherData.wave_height?.toFixed(1)}m</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Gear Section */}
            <div className="border-t border-gray-800 pt-4">
              <button
                type="button"
                onClick={() => setShowGear(v => !v)}
                className="w-full flex items-center justify-between text-left"
              >
                <p className="text-gray-400 text-xs uppercase tracking-widest">⚙️ Gear Used</p>
                <span className="text-[#CCFF00] text-xs font-bold">{showGear ? 'Hide' : 'Add Gear'}</span>
              </button>
              {showGear && (
                <div className="mt-4">
                  <GearSection gear={gear} onChange={setGear} />
                </div>
              )}
            </div>

            {/* Private toggle */}
            <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <div>
              <p className="text-white font-semibold text-sm">Private Catch</p>
              <p className="text-gray-500 text-xs">Only visible to you</p>
            </div>
            <Switch
              checked={formData.is_private}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, is_private: checked }))}
              className="data-[state=checked]:bg-[#CCFF00]"
            />
          </div>
        </motion.div>

        {/* BOTTOM ACTIONS */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('Home')}
            className="flex-1 bg-[#1E1E1E] border border-gray-700 text-gray-300 py-5 rounded-2xl font-bold text-lg"
          >
            CANCEL
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={!imageFile || isSaving}
            className="flex-1 bg-[#CCFF00] text-[#121212] py-5 rounded-2xl font-bold text-lg disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Vaulting...
              </>
            ) : 'VAULT IT 🎣'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}