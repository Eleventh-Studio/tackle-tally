import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, Image, Users, List, BarChart2, User } from 'lucide-react-native';
import { colors } from '@/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TABS = [
  { name: 'index', label: 'Action', Icon: Zap },
  { name: 'gallery', label: 'Gallery', Icon: Image },
  { name: 'community', label: 'Crew', Icon: Users },
  { name: 'sessions', label: 'Sessions', Icon: List },
  { name: 'charts', label: 'Charts', Icon: BarChart2 },
  { name: 'profile', label: 'Profile', Icon: User },
] as const;

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 8 }}
      className="flex-row bg-tab-bg border-t border-border"
    >
      {state.routes.map((route, index) => {
        const tab = TABS[index];
        if (!tab) return null;
        const isActive = state.index === index;
        const iconColor = isActive ? colors.tabActive : colors.tabInactive;

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            className="flex-1 items-center justify-center py-2 active:opacity-70"
          >
            <tab.Icon size={20} color={iconColor} strokeWidth={isActive ? 2.5 : 1.8} />
            <Text
              className="text-[9px] font-semibold mt-0.5 uppercase tracking-wider"
              numberOfLines={1}
              style={{ color: iconColor }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
