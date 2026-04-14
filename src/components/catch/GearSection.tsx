import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { Input } from '@/components/ds';
import { colors } from '@/theme';
import { LURE_TYPES, LINE_TYPES } from '@/constants/gear';

export interface GearValues {
  lure_type: string | null;
  lure_brand: string | null;
  lure_size: string | null;
  line_type: string | null;
  line_weight: string | null;
}

interface GearSectionProps {
  values: GearValues;
  onChange: (values: GearValues) => void;
}

export function GearSection({ values, onChange }: GearSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = expanded ? ChevronDown : ChevronRight;

  return (
    <View>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center justify-between py-4 active:opacity-70"
      >
        <Text className="text-xs text-muted font-semibold uppercase tracking-widest">
          Gear (optional)
        </Text>
        <Icon size={16} color={colors.mutedForeground} />
      </Pressable>

      {expanded && (
        <View className="gap-y-4 pb-4">
          {/* Lure type picker */}
          <View className="gap-y-2">
            <Text className="text-xs text-muted font-semibold uppercase tracking-widest">
              Lure Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {LURE_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => onChange({ ...values, lure_type: type })}
                  className={[
                    'px-4 py-2 rounded-full border',
                    values.lure_type === type
                      ? 'bg-accent border-accent'
                      : 'bg-surface-raised border-border',
                  ].join(' ')}
                >
                  <Text
                    className={`text-sm font-semibold ${values.lure_type === type ? 'text-accent-fg' : 'text-muted'}`}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input
            label="Lure Brand"
            value={values.lure_brand ?? ''}
            onChangeText={(text) => onChange({ ...values, lure_brand: text || null })}
            placeholder="e.g. Squidgy"
          />
          <Input
            label="Lure Size"
            value={values.lure_size ?? ''}
            onChangeText={(text) => onChange({ ...values, lure_size: text || null })}
            placeholder='e.g. 4"'
          />

          {/* Line type */}
          <View className="gap-y-2">
            <Text className="text-xs text-muted font-semibold uppercase tracking-widest">
              Line Type
            </Text>
            <View className="flex-row gap-2">
              {LINE_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => onChange({ ...values, line_type: type })}
                  className={[
                    'px-4 py-2 rounded-full border',
                    values.line_type === type
                      ? 'bg-accent border-accent'
                      : 'bg-surface-raised border-border',
                  ].join(' ')}
                >
                  <Text
                    className={`text-sm font-semibold ${values.line_type === type ? 'text-accent-fg' : 'text-muted'}`}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input
            label="Line Weight"
            value={values.line_weight ?? ''}
            onChangeText={(text) => onChange({ ...values, line_weight: text || null })}
            placeholder="e.g. 20lb"
          />
        </View>
      )}
    </View>
  );
}
