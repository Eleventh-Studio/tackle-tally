import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader, SectionHeader } from '@/components/ds';
import {
  useSettingsStore,
  type LengthUnit,
  type WeightUnit,
} from '@/stores/useSettingsStore';

export function SettingsScreen() {
  const { lengthUnit, weightUnit, setLengthUnit, setWeightUnit } = useSettingsStore();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScreenHeader title="Settings" showBack />
      <ScrollView contentContainerClassName="px-4 pt-4 pb-8 gap-y-6">
        <View>
          <SectionHeader title="Units" />
          <View className="gap-y-3">
            <Toggle<LengthUnit>
              label="Length"
              value={lengthUnit}
              options={[
                { label: 'cm', value: 'cm' },
                { label: 'in', value: 'in' },
              ]}
              onChange={setLengthUnit}
            />
            <Toggle<WeightUnit>
              label="Weight"
              value={weightUnit}
              options={[
                { label: 'kg', value: 'kg' },
                { label: 'lb', value: 'lb' },
              ]}
              onChange={setWeightUnit}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Toggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <View className="bg-surface border border-border rounded-card px-4 py-3 flex-row items-center justify-between">
      <Text className="text-foreground text-base font-bold">{label}</Text>
      <View className="flex-row bg-surface-raised rounded-full p-1">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              className={`rounded-full px-4 py-1.5 ${selected ? 'bg-accent' : ''}`}
            >
              <Text
                className={`text-sm font-bold uppercase tracking-wider ${
                  selected ? 'text-accent-fg' : 'text-muted'
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
