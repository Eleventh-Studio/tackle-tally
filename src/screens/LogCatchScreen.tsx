import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenHeader, NumberInput, SectionHeader, Button } from '@/components/ds';
import { PhotoPicker } from '@/components/catch/PhotoPicker';
import { SpeciesSelect } from '@/components/catch/SpeciesSelect';
import { GearSection, type GearValues } from '@/components/catch/GearSection';
import { useCamera } from '@/hooks/useCamera';
import { useLocation } from '@/hooks/sensors/useLocation';
import { useBarometer } from '@/hooks/sensors/useBarometer';
import { useCatches } from '@/hooks/useCatches';
import { useSessions } from '@/hooks/useSessions';

export function LogCatchScreen() {
  const router = useRouter();
  const { launchCamera, launchLibrary } = useCamera();
  const { latitude, longitude } = useLocation();
  const { pressureHpa } = useBarometer();
  const { createCatch } = useCatches();
  const { activeSession } = useSessions();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [exifLat, setExifLat] = useState<number | null>(null);
  const [exifLng, setExifLng] = useState<number | null>(null);
  const [species, setSpecies] = useState<string | null>(null);
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [gear, setGear] = useState<GearValues>({
    lure_type: null,
    lure_brand: null,
    lure_size: null,
    line_type: null,
    line_weight: null,
  });
  const [saving, setSaving] = useState(false);

  const handleCamera = async () => {
    const result = await launchCamera();
    if (result) {
      setPhotoUri(result.uri);
      setExifLat(result.exifLat);
      setExifLng(result.exifLng);
    }
  };

  const handleLibrary = async () => {
    const result = await launchLibrary();
    if (result) {
      setPhotoUri(result.uri);
      setExifLat(result.exifLat);
      setExifLng(result.exifLng);
    }
  };

  const canSave = !!photoUri && !!species;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await createCatch({
        photo_uri: photoUri!,
        species: species!,
        length_cm: length ? parseFloat(length) : null,
        weight_g: weight ? parseFloat(weight) * 1000 : null,
        device_lat: latitude,
        device_lng: longitude,
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
        notes: notes.trim() || null,
        ...gear,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save catch. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <ScreenHeader title="Log Catch" showBack />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-8 gap-y-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo */}
        <View>
          <SectionHeader title="Photo" />
          <PhotoPicker
            uri={photoUri}
            onPressCamera={handleCamera}
            onPressLibrary={handleLibrary}
          />
        </View>

        {/* Species */}
        <View>
          <SectionHeader title="Species" />
          <SpeciesSelect value={species} onChange={setSpecies} />
        </View>

        {/* Size */}
        <View>
          <SectionHeader title="Size" />
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

        {/* Conditions */}
        <View className="flex-row gap-x-3">
          {pressureHpa && (
            <View className="flex-1 bg-surface rounded-card border border-border px-4 py-3">
              <Text className="text-xs text-muted font-semibold uppercase tracking-widest mb-1">
                Pressure
              </Text>
              <Text className="text-foreground font-bold">{Math.round(pressureHpa)} hPa</Text>
            </View>
          )}
          {(latitude || longitude) && (
            <View className="flex-1 bg-surface rounded-card border border-border px-4 py-3">
              <Text className="text-xs text-muted font-semibold uppercase tracking-widest mb-1">
                GPS
              </Text>
              <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
                {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        {/* Active session indicator */}
        {activeSession && (
          <View className="bg-accent/10 border border-accent/30 rounded-card px-4 py-3">
            <Text className="text-accent text-sm font-semibold">
              Adding to: {activeSession.name}
            </Text>
          </View>
        )}

        {/* Gear */}
        <View className="border-t border-border">
          <GearSection values={gear} onChange={setGear} />
        </View>
      </ScrollView>

      {/* Sticky bottom action bar */}
      <View className="px-4 py-4 border-t border-border bg-background">
        <View className="flex-row gap-x-3">
          <Pressable
            onPress={() => router.back()}
            className="flex-1 items-center justify-center py-4 rounded-btn border border-border active:opacity-70"
          >
            <Text className="text-muted font-bold text-base">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={!canSave || saving}
            className={[
              'flex-[2] items-center justify-center py-4 rounded-btn',
              canSave && !saving ? 'bg-accent active:bg-accent-pressed' : 'bg-surface-raised',
            ].join(' ')}
          >
            <Text
              className={`font-black text-lg ${canSave && !saving ? 'text-accent-fg' : 'text-muted'}`}
            >
              {saving ? 'Saving…' : 'Vault It 🎣'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
