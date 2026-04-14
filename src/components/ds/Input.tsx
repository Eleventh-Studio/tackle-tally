import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, ...props }: InputProps) {
  return (
    <View className="gap-y-1.5">
      {label && (
        <Text className="text-xs text-muted font-semibold uppercase tracking-widest">
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor="#6B7280"
        className={[
          'bg-surface-raised rounded-input px-4 py-3 text-foreground text-base',
          'border',
          error ? 'border-danger' : 'border-border focus:border-accent',
        ].join(' ')}
        {...props}
      />
      {error && <Text className="text-xs text-danger">{error}</Text>}
      {hint && !error && <Text className="text-xs text-muted">{hint}</Text>}
    </View>
  );
}
