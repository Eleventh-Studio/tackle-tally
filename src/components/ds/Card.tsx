import React from 'react';
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className = '', elevated = false }: CardProps) {
  return (
    <View
      className={[
        'rounded-card border border-border',
        elevated ? 'bg-surface-raised' : 'bg-surface',
        className,
      ].join(' ')}
    >
      {children}
    </View>
  );
}
