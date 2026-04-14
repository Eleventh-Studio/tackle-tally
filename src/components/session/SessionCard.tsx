import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import type { Session } from '@/types';
import { formatDate, formatDuration } from '@/utils/formatters';

interface SessionCardProps {
  session: Session;
  catchCount?: number;
  onPress?: () => void;
}

export function SessionCard({ session, catchCount = 0, onPress }: SessionCardProps) {
  const isActive = !session.ended_at;

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface rounded-card border border-border overflow-hidden active:opacity-80"
    >
      {/* Cover photo / placeholder */}
      <View className="h-32 bg-surface-raised">
        {session.cover_photo_uri ? (
          <Image
            source={{ uri: session.cover_photo_uri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl">{session.mood_emoji ?? '🎣'}</Text>
          </View>
        )}
        {isActive && (
          <View className="absolute top-3 left-3 bg-accent px-3 py-1 rounded-full">
            <Text className="text-accent-fg text-xs font-bold uppercase tracking-widest">
              Active
            </Text>
          </View>
        )}
      </View>

      <View className="p-4">
        <Text className="text-foreground font-bold text-base" numberOfLines={1}>
          {session.name}
        </Text>
        <Text className="text-muted text-sm mt-1">
          {formatDate(session.started_at)} ·{' '}
          {formatDuration(session.started_at, session.ended_at)} ·{' '}
          {catchCount} {catchCount === 1 ? 'catch' : 'catches'}
        </Text>
      </View>
    </Pressable>
  );
}
