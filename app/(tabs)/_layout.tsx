import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabBar } from '@/components/navigation/TabBar';
import { LogButton } from '@/components/navigation/LogButton';

export default function TabLayout() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121212' }}>
      <View style={{ flex: 1 }}>
        <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="map" />
          <Tabs.Screen name="sessions" />
          <Tabs.Screen name="profile" />
        </Tabs>
        <LogButton />
      </View>
    </SafeAreaView>
  );
}
