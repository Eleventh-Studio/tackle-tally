import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Camera } from 'lucide-react-native';
import { colors } from '@/theme';

interface PhotoPickerProps {
  uri: string | null;
  onPressCamera: () => void;
  onPressLibrary: () => void;
}

export function PhotoPicker({ uri, onPressCamera, onPressLibrary }: PhotoPickerProps) {
  if (uri) {
    return (
      <Pressable onPress={onPressLibrary} className="active:opacity-80">
        <Image
          source={{ uri }}
          className="w-full h-64 rounded-card bg-surface-raised"
          resizeMode="cover"
        />
        <View className="absolute bottom-3 right-3 bg-black/60 rounded-full px-3 py-1.5">
          <Text className="text-white text-xs font-semibold">Change</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View className="flex-row gap-x-3">
      <Pressable
        onPress={onPressCamera}
        className="flex-1 h-48 bg-surface-raised rounded-card border border-border items-center justify-center active:opacity-70"
      >
        <Camera size={32} color={colors.accent} strokeWidth={1.5} />
        <Text className="text-accent font-bold text-sm mt-2 uppercase tracking-widest">
          Camera
        </Text>
      </Pressable>

      <Pressable
        onPress={onPressLibrary}
        className="flex-1 h-48 bg-surface-raised rounded-card border border-border items-center justify-center active:opacity-70"
      >
        <Camera size={32} color={colors.mutedForeground} strokeWidth={1.5} />
        <Text className="text-muted font-bold text-sm mt-2 uppercase tracking-widest">
          Library
        </Text>
      </Pressable>
    </View>
  );
}
