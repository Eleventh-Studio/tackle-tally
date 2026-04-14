import React from 'react';
import { View, Text } from 'react-native';

interface SectionHeaderProps {
  title: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-xs text-muted font-semibold uppercase tracking-widest">
        {title}
      </Text>
      {right}
    </View>
  );
}
