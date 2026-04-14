import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import type { Catch } from '@/types';
import { formatSize, formatDateTime } from '@/utils/formatters';

interface CatchCardProps {
  catch_: Catch;
  onPress?: () => void;
}

export function CatchCard({ catch_: c, onPress }: CatchCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-x-3 bg-surface rounded-card border border-border p-3 active:opacity-80"
    >
      <Image
        source={{ uri: c.photo_uri }}
        className="w-16 h-16 rounded-lg bg-surface-raised"
        resizeMode="cover"
      />
      <View className="flex-1 justify-center gap-y-1">
        <Text className="text-foreground font-bold text-base" numberOfLines={1}>
          {c.species}
        </Text>
        {(c.length_cm || c.weight_g) && (
          <Text className="text-muted text-sm">{formatSize(c.length_cm, c.weight_g)}</Text>
        )}
        <Text className="text-subtle text-xs">{formatDateTime(c.created_at)}</Text>
      </View>
    </Pressable>
  );
}
