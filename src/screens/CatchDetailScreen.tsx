import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2, Sparkles, MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { ScreenHeader, SectionHeader, NumberInput, Input } from '@/components/ds';
import { SpeciesSelect } from '@/components/catch/SpeciesSelect';
import { GearSection, type GearValues } from '@/components/catch/GearSection';
import { useCatches } from '@/hooks/useCatches';
import { useLocation } from '@/hooks/sensors/useLocation';
import { colors } from '@/theme';
import { formatDateTime } from '@/utils/formatters';
import { getCatchCoordinates } from '@/utils/coordinates';
import { getCatchTimestamp, isRetrospective } from '@/utils/timestamps';

export function CatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { catches, editCatch, deleteCatch } = useCatches();
  const { latitude: currentLat, longitude: currentLng } = useLocation();

  const catch_ = catches.find((c) => c.id === id);

  const [species, setSpecies] = useState<string | null>(catch_?.species ?? null);
  const [length, setLength] = useState(catch_?.length_cm != null ? String(catch_.length_cm) : '');
  const [weight, setWeight] = useState(
    catch_?.weight_g != null ? String(catch_.weight_g / 1000) : ''
  );
  const [notes, setNotes] = useState(catch_?.notes ?? '');
  const [gear, setGear] = useState<GearValues>({
    lure_type: catch_?.lure_type ?? null,
    lure_brand: catch_?.lure_brand ?? null,
    lure_size: catch_?.lure_size ?? null,
    line_type: catch_?.line_type ?? null,
    line_weight: catch_?.line_weight ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);

  if (!catch_) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">Catch not found</Text>
      </View>
    );
  }

  const coords = getCatchCoordinates(catch_);

  const handleSave = async () => {
    setSaving(true);
    try {
      await editCatch(id, {
        species: species ?? null,
        length_cm: length ? parseFloat(length) : null,
        weight_g: weight ? parseFloat(weight) * 1000 : null,
        notes: notes.trim() || null,
        ...gear,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Catch', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCatch(id);
          router.back();
        },
      },
    ]);
  };

  const handleUseCurrentLocation = async () => {
    if (currentLat == null || currentLng == null) {
      Alert.alert('Location unavailable', 'Could not get your current location. Make sure location permission is granted.');
      return;
    }
    try {
      await editCatch(id, { device_lat: currentLat, device_lng: currentLng });
    } catch {
      Alert.alert('Error', 'Failed to save location.');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121212' }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <ScreenHeader
        title={catch_.species ?? 'Unknown Species'}
        showBack
        right={
          <Pressable onPress={handleDelete} hitSlop={8} className="active:opacity-60">
            <Trash2 size={20} color={colors.danger} strokeWidth={2} />
          </Pressable>
        }
      />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Photo */}
        <Image
          source={{ uri: catch_.photo_uri }}
          style={{ width: '100%', height: 280 }}
          resizeMode="cover"
        />

        {/* Map thumbnail or location unavailable */}
        {coords ? (
          <View style={{ height: 160, overflow: 'hidden' }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              userInterfaceStyle="dark"
            >
              <Marker coordinate={coords} />
            </MapView>
            {/* Pressable overlay to capture tap and prevent scroll conflicts */}
            <Pressable
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              onPress={() => setShowMap(true)}
            />
            <View
              style={{ position: 'absolute', bottom: 8, right: 8 }}
              className="bg-black/60 rounded-full px-3 py-1"
            >
              <Text className="text-white text-xs font-semibold">Tap to expand</Text>
            </View>
          </View>
        ) : (
          <View className="mx-4 mt-3 bg-surface border border-border rounded-card px-4 py-3 flex-row items-center justify-between gap-x-3">
            <View className="flex-row items-center gap-x-2">
              <MapPin size={16} color={colors.mutedForeground} strokeWidth={1.8} />
              <Text className="text-muted text-sm">Location unavailable</Text>
            </View>
            {(currentLat != null) && (
              <Pressable
                onPress={handleUseCurrentLocation}
                className="bg-surface-raised border border-border rounded-full px-3 py-1 active:opacity-70"
              >
                <Text className="text-accent text-xs font-bold">Use current</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Read-only metadata row */}
        <View className="px-4 py-3 border-b border-border gap-y-2 mt-3">
          <Text className="text-xs text-muted font-semibold uppercase tracking-widest">
            {formatDateTime(getCatchTimestamp(catch_))}
          </Text>
          {isRetrospective(catch_) && (
            <Text className="text-[10px] text-subtle font-semibold uppercase tracking-widest">
              Logged {formatDateTime(catch_.created_at)}
            </Text>
          )}
          <View className="flex-row gap-x-2 flex-wrap">
            {coords && (
              <View className="bg-surface border border-border rounded-full px-3 py-1">
                <Text className="text-xs text-foreground font-semibold">GPS ✓</Text>
              </View>
            )}
            {catch_.barometric_pressure_hpa != null && (
              <View className="bg-surface border border-border rounded-full px-3 py-1">
                <Text className="text-xs text-foreground font-semibold">
                  {Math.round(catch_.barometric_pressure_hpa)} hPa
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Editable fields */}
        <View className="px-4 pt-5 gap-y-6">
          <View>
            <SectionHeader title="Species" />
            <View className="flex-row gap-x-3 items-stretch">
              <View className="flex-1">
                <SpeciesSelect value={species} onChange={setSpecies} />
              </View>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    'AI Identification',
                    'AI-powered species identification is coming in a future update. Select the species manually for now.',
                    [{ text: 'OK' }]
                  )
                }
                className="bg-surface border border-accent/40 rounded-btn items-center justify-center gap-y-1 active:opacity-70"
                style={{ paddingHorizontal: 14 }}
              >
                <Sparkles size={18} color={colors.accent} strokeWidth={1.8} />
                <Text className="text-accent font-bold text-xs uppercase tracking-wider">AI ID</Text>
              </Pressable>
            </View>
          </View>

          <View>
            <SectionHeader title="Size" />
            <View className="flex-row gap-x-3">
              <NumberInput label="Length" value={length} onChangeText={setLength} unit="cm" />
              <NumberInput label="Weight" value={weight} onChangeText={setWeight} unit="kg" />
            </View>
          </View>

          <View>
            <SectionHeader title="Notes" />
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes…"
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>

          <View className="border-t border-border">
            <GearSection values={gear} onChange={setGear} />
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
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
            {saving ? 'Saving…' : 'Save Changes'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>

    {/* Full-screen map modal */}
    {coords && (
      <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121212' }}>
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <Text className="font-black text-foreground text-base uppercase tracking-widest">
              {catch_.species ?? 'Catch Location'}
            </Text>
            <Pressable onPress={() => setShowMap(false)} className="active:opacity-60">
              <Text className="text-accent font-bold text-base">Done</Text>
            </Pressable>
          </View>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
            userInterfaceStyle="dark"
          >
            <Marker
              coordinate={coords}
              title={catch_.species ?? 'Catch'}
              description={formatDateTime(getCatchTimestamp(catch_))}
            />
          </MapView>
        </SafeAreaView>
      </Modal>
    )}
    </SafeAreaView>
  );
}
