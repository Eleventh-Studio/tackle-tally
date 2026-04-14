import React from 'react';
import { View, Text } from 'react-native';

export function CommunityScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center gap-y-3 px-8">
      <Text className="text-5xl">👥</Text>
      <Text className="text-foreground font-black text-xl uppercase tracking-widest">
        Community
      </Text>
      <Text className="text-muted text-center text-sm">
        Connect with your crew and share catches — coming in Stage 2.
      </Text>
    </View>
  );
}
