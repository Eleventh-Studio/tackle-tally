import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, ImageIcon, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, NumberInput, SectionHeader } from '@/components/ds';
import { SpeciesSelect } from '@/components/catch/SpeciesSelect';
import { GearSection, type GearValues } from '@/components/catch/GearSection';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useCamera } from '@/hooks/useCamera';
import { useBarometer } from '@/hooks/sensors/useBarometer';
import { useCatches } from '@/hooks/useCatches';
import { useSessions } from '@/hooks/useSessions';
import { colors } from '@/theme';

type Phase = 'source' | 'confirm';

export function LogCatchScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const { launchCamera, launchLibrary } = useCamera();
  const { pressureHpa } = useBarometer();
  const { createCatch } = useCatches();
  const { activeSession } = useSessions();

  const [phase, setPhase] = useState<Phase>('source');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [exifLat, setExifLat] = useState<number | null>(null);
  const [exifLng, setExifLng] = useState<number | null>(null);
  const [deviceLat, setDeviceLat] = useState<number | null>(null);
  const [deviceLng, setDeviceLng] = useState<number | null>(null);

  // Request location permission as soon as the screen opens, before the user
  // taps anything, so the GPS fix is ready by the time they take the photo.
  useEffect(() => {
    Location.requestForegroundPermissionsAsync().catch(() => {});
  }, []);

  // Direct camera mode: skip the source picker and open camera immediately.
  useEffect(() => {
    if (mode === 'camera') handleCamera();
  }, []);
  const [species, setSpecies] = useState<string | null>(null);
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [gear, setGear] = useState<GearValues>({
    lure_type: null,
    lure_brand: null,
    lure_size: null,
    line_type: null,
    line_weight: null,
  });
  const [saving, setSaving] = useState(false);

  const afterPhoto = (uri: string, lat: number | null, lng: number | null) => {
    setPhotoUri(uri);
    setExifLat(lat);
    setExifLng(lng);
    setPhase('confirm');
  };

  // Capture a GPS snapshot right now. Runs in parallel with the camera/library
  // picker so the fix is ready by the time the user confirms the photo.
  const captureLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setDeviceLat(loc.coords.latitude);
      setDeviceLng(loc.coords.longitude);
    } catch {
      // GPS unavailable — save without coordinates
    }
  };

  const handleCamera = async () => {
    // Fire GPS capture and camera simultaneously — camera takes a few seconds
    // while the user frames the shot, giving GPS time to resolve.
    const [result] = await Promise.all([launchCamera(), captureLocation()]);
    if (result) afterPhoto(result.uri, result.exifLat, result.exifLng);
  };

  const handleLibrary = async () => {
    const [result] = await Promise.all([launchLibrary(), captureLocation()]);
    if (result) afterPhoto(result.uri, result.exifLat, result.exifLng);
  };

  const handleAiIdentify = () => {
    Alert.alert(
      'AI Identification',
      'AI-powered species identification is coming in a future update. Select the species manually for now.',
      [{ text: 'OK' }]
    );
  };

  const handleSave = async () => {
    if (!photoUri) return;
    setSaving(true);
    try {
      await createCatch({
        photo_uri: photoUri,
        species: species ?? null,
        length_cm: length ? parseFloat(length) : null,
        weight_g: weight ? parseFloat(weight) * 1000 : null,
        device_lat: deviceLat,
        device_lng: deviceLng,
        exif_lat: exifLat,
        exif_lng: exifLng,
        location_name: null,
        barometric_pressure_hpa: pressureHpa,
        weather_temp_c: null,
        weather_wind_kph: null,
        weather_wind_dir_deg: null,
        moon_phase: null,
        tide_height_m: null,
        session_id: activeSession?.id ?? null,
        notes: null,
        ...gear,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save catch. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Phase 1: Source picker ───────────────────────────────────────────────

  if (phase === 'source') {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121212' }}>
        <ScreenHeader title="Log Catch" showBack />
        <View className="flex-1 px-6 justify-center gap-y-4">
          <Pressable
            onPress={handleCamera}
            className="bg-accent rounded-card items-center justify-center gap-y-3 active:opacity-90"
            style={{ paddingVertical: 44 }}
          >
            <Camera size={44} color={colors.accentForeground} strokeWidth={1.5} />
            <Text className="text-accent-fg font-black text-2xl uppercase tracking-widest">
              Take Photo
            </Text>
          </Pressable>

          <Pressable
            onPress={handleLibrary}
            className="border-2 border-border rounded-card items-center justify-center gap-y-3 active:opacity-70"
            style={{ paddingVertical: 44 }}
          >
            <ImageIcon size={44} color={colors.foreground} strokeWidth={1.5} />
            <Text className="text-foreground font-bold text-2xl uppercase tracking-widest">
              Upload from Gallery
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Phase 2: Confirm + optional details ─────────────────────────────────

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121212' }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <ScreenHeader
        title="New Catch"
        showBack
        onBack={() => setPhase('source')}
      />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Photo */}
        <Image
          source={{ uri: photoUri! }}
          style={{ width: '100%', height: 280 }}
          resizeMode="cover"
        />

        {/* Auto-captured sensor badges */}
        <View className="flex-row gap-x-2 px-4 pt-3 pb-1 flex-wrap">
          {(deviceLat != null || exifLat != null) && (
            <View className="bg-surface border border-border rounded-full px-3 py-1">
              <Text className="text-xs text-foreground font-semibold">GPS ✓</Text>
            </View>
          )}
          {pressureHpa != null && (
            <View className="bg-surface border border-border rounded-full px-3 py-1">
              <Text className="text-xs text-foreground font-semibold">
                {Math.round(pressureHpa)} hPa
              </Text>
            </View>
          )}
        </View>

        <View className="px-4 pt-3 gap-y-5">
          {/* Species + AI identify */}
          <View>
            <SectionHeader title="Species (optional)" />
            <View className="flex-row gap-x-3 items-stretch">
              <View className="flex-1">
                <SpeciesSelect value={species} onChange={setSpecies} />
              </View>
              <Pressable
                onPress={handleAiIdentify}
                className="bg-surface border border-accent/40 rounded-btn items-center justify-center gap-y-1 active:opacity-70"
                style={{ paddingHorizontal: 14 }}
              >
                <Sparkles size={18} color={colors.accent} strokeWidth={1.8} />
                <Text className="text-accent font-bold text-xs uppercase tracking-wider">AI ID</Text>
              </Pressable>
            </View>
          </View>

          {/* Active session indicator */}
          {activeSession && (
            <View className="bg-accent/10 border border-accent/30 rounded-card px-4 py-3">
              <Text className="text-accent text-sm font-semibold">
                Adding to: {activeSession.name}
              </Text>
            </View>
          )}

          {/* Size */}
          <View>
            <SectionHeader title="Size (optional)" />
            <View className="flex-row gap-x-3">
              <NumberInput
                label="Length"
                value={length}
                onChangeText={setLength}
                unit="cm"
              />
              <NumberInput
                label="Weight"
                value={weight}
                onChangeText={setWeight}
                unit="kg"
              />
            </View>
          </View>

          {/* Gear — already collapsible internally */}
          <View className="border-t border-border">
            <GearSection values={gear} onChange={setGear} />
          </View>
        </View>
      </ScrollView>

      {/* Vault It — no longer requires species */}
      <View
        className="px-4 border-t border-border bg-background"
        style={{ paddingTop: 12, paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }}
      >
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="bg-accent rounded-btn items-center justify-center active:opacity-90"
          style={{ paddingVertical: 18 }}
        >
          <Text className="text-accent-fg font-black text-xl uppercase tracking-widest">
            {saving ? 'Saving…' : 'Vault It 🎣'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
