import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function NotFound() {
  return (
    <View className="flex-1 bg-background items-center justify-center gap-y-4">
      <Text className="text-foreground font-black text-2xl">404</Text>
      <Link href="/" className="text-accent font-semibold">
        Go home
      </Link>
    </View>
  );
}
