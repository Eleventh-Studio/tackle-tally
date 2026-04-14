import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: 'bg-surface-raised', text: 'text-muted' },
  accent: { bg: 'bg-accent', text: 'text-accent-fg' },
  success: { bg: 'bg-success/20', text: 'text-success' },
  warning: { bg: 'bg-warning/20', text: 'text-warning' },
  danger: { bg: 'bg-danger/20', text: 'text-danger' },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const { bg, text } = variantClasses[variant];
  return (
    <View className={`${bg} px-2.5 py-1 rounded-full`}>
      <Text className={`${text} text-xs font-semibold`}>{label}</Text>
    </View>
  );
}
