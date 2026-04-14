import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, showBack = false, onBack, right }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 py-4 bg-background border-b border-border">
      <View className="w-10">
        {showBack && (
          <Pressable onPress={onBack ?? (() => router.back())} hitSlop={12} className="active:opacity-60">
            <ChevronLeft size={24} color={colors.foreground} strokeWidth={2} />
          </Pressable>
        )}
      </View>

      <Text className="flex-1 text-center text-base font-black text-foreground uppercase tracking-widest">
        {title}
      </Text>

      <View className="w-10 items-end">
        {right}
      </View>
    </View>
  );
}
