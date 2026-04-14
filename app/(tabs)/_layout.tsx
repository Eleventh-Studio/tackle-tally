import React from 'react';
import { Tabs } from 'expo-router';
import { TabBar } from '@/components/navigation/TabBar';

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="gallery" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="sessions" />
      <Tabs.Screen name="charts" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
