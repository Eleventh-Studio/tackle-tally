import React from 'react';
import { View, Text } from 'react-native';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  accent?: boolean;
}

export function StatCard({ value, label, icon, accent = false }: StatCardProps) {
  return (
    <View className="flex-1 bg-surface rounded-card border border-border p-4 items-center justify-center gap-y-1">
      {icon && <View className="mb-1">{icon}</View>}
      <Text className={`text-2xl font-black ${accent ? 'text-accent' : 'text-foreground'}`}>
        {value}
      </Text>
      <Text className="text-xs text-muted font-semibold uppercase tracking-widest text-center">
        {label}
      </Text>
    </View>
  );
}
