import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap } from 'lucide-react-native';
import { colors } from '@/theme';

// Must match the tab bar content height used in TabBar.tsx
export const TAB_BAR_CONTENT_HEIGHT = 68;

export function LogButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const tabBarBottomPad = insets.bottom > 0 ? insets.bottom - 4 : 8;
  // Center the button on the tab bar's top edge: half above, half inside the bar
  const BUTTON_SIZE = 76;
  const bottomOffset = tabBarBottomPad + TAB_BAR_CONTENT_HEIGHT - BUTTON_SIZE / 2;

  return (
    <Pressable
      onPress={() => router.push('/log-catch?mode=camera')}
      style={[styles.button, { bottom: bottomOffset }]}
      className="active:opacity-80"
    >
      <Zap size={34} color={colors.accentForeground} strokeWidth={2.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    alignSelf: 'center',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#CCFF00',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    shadowColor: '#CCFF00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
});
