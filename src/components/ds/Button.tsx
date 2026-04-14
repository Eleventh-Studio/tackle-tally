import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-accent active:bg-accent-pressed',
  secondary: 'bg-surface-raised border border-border active:bg-surface',
  ghost: 'bg-transparent active:bg-surface-raised',
  danger: 'bg-danger active:opacity-80',
};

const labelClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'text-accent-fg font-bold',
  secondary: 'text-foreground font-semibold',
  ghost: 'text-muted font-semibold',
  danger: 'text-white font-bold',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-4 py-2 rounded-btn',
  md: 'px-5 py-3 rounded-btn',
  lg: 'px-6 py-4 rounded-btn',
};

const labelSizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : 'self-start',
        isDisabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#000' : '#fff'}
          className="mr-2"
        />
      ) : icon ? (
        <View className="mr-2">{icon}</View>
      ) : null}
      <Text className={[labelClasses[variant], labelSizeClasses[size]].join(' ')}>
        {label}
      </Text>
    </Pressable>
  );
}
