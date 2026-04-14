import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Map, List, User } from 'lucide-react-native';
import { colors } from '@/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TAB_BAR_CONTENT_HEIGHT } from './LogButton';

const TABS = [
  { name: 'index',    label: 'Home',     Icon: Home },
  { name: 'map',      label: 'Map',      Icon: Map },
  { name: 'sessions', label: 'Sessions', Icon: List },
  { name: 'profile',  label: 'Profile',  Icon: User },
] as const;

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 8, height: TAB_BAR_CONTENT_HEIGHT + (insets.bottom > 0 ? insets.bottom - 4 : 8) }}
      className="flex-row bg-tab-bg border-t border-border"
    >
      {/* First two tabs: Home, Map */}
      {TABS.slice(0, 2).map((tab, index) => {
        const routeIndex = index;
        const isActive = state.index === routeIndex;
        const iconColor = isActive ? colors.tabActive : colors.tabInactive;
        const route = state.routes[routeIndex];
        if (!route) return null;

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            className="flex-1 items-center justify-center py-2 active:opacity-70"
          >
            <tab.Icon size={24} color={iconColor} strokeWidth={isActive ? 2.5 : 1.8} />
            <Text
              className="text-[10px] font-semibold mt-1 uppercase tracking-wider"
              numberOfLines={1}
              style={{ color: iconColor }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}

      {/* Centre spacer — wider to give the LogButton breathing room */}
      <View style={{ width: 100 }} />

      {/* Last two tabs: Sessions, Profile */}
      {TABS.slice(2, 4).map((tab, index) => {
        const routeIndex = index + 2;
        const isActive = state.index === routeIndex;
        const iconColor = isActive ? colors.tabActive : colors.tabInactive;
        const route = state.routes[routeIndex];
        if (!route) return null;

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            className="flex-1 items-center justify-center py-2 active:opacity-70"
          >
            <tab.Icon size={24} color={iconColor} strokeWidth={isActive ? 2.5 : 1.8} />
            <Text
              className="text-[10px] font-semibold mt-1 uppercase tracking-wider"
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
