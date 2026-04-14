import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit: string;
  placeholder?: string;
}

/**
 * Large-target numeric input for one-handed use.
 * Shows value large and unit alongside — designed for length/weight entry.
 */
export function NumberInput({ label, value, onChangeText, unit, placeholder = '0' }: NumberInputProps) {
  return (
    <View className="flex-1 bg-surface-raised rounded-input border border-border p-4">
      <Text className="text-xs text-muted font-semibold uppercase tracking-widest mb-2">
        {label}
      </Text>
      <View className="flex-row items-end">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          className="text-4xl font-black text-foreground flex-1"
        />
        <Text className="text-lg text-muted mb-1 ml-1">{unit}</Text>
      </View>
    </View>
  );
}
