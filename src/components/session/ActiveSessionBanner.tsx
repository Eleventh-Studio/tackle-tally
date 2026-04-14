import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Session } from '@/types';
import { formatDuration } from '@/utils/formatters';

interface ActiveSessionBannerProps {
  session: Session;
  catchCount: number;
  onPress: () => void;
  onEnd: () => void;
}

export function ActiveSessionBanner({ session, catchCount, onPress, onEnd }: ActiveSessionBannerProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-accent rounded-card px-4 py-4 flex-row items-center justify-between active:opacity-80"
    >
      <View className="flex-1">
        <Text className="text-accent-fg text-xs font-bold uppercase tracking-widest mb-0.5">
          Active Session
        </Text>
        <Text className="text-accent-fg font-black text-base" numberOfLines={1}>
          {session.name}
        </Text>
        <Text className="text-accent-fg/70 text-sm mt-0.5">
          {formatDuration(session.started_at)} · {catchCount}{' '}
          {catchCount === 1 ? 'catch' : 'catches'}
        </Text>
      </View>
      <Pressable
        onPress={onEnd}
        className="bg-accent-fg/20 rounded-full px-4 py-2 ml-3 active:opacity-70"
        hitSlop={8}
      >
        <Text className="text-accent-fg text-xs font-bold uppercase tracking-widest">End</Text>
      </Pressable>
    </Pressable>
  );
}
