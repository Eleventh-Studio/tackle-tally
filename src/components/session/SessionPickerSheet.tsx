import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { BottomSheet } from '@/components/ds';
import type { Session } from '@/types';
import { colors } from '@/theme';
import { formatDate } from '@/utils/formatters';

interface SessionPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  sessions: Session[];
  selectedId: string | null;
  onSelect: (sessionId: string | null) => void;
}

export function SessionPickerSheet({
  visible,
  onClose,
  sessions,
  selectedId,
  onSelect,
}: SessionPickerSheetProps) {
  const choose = (id: string | null) => {
    onSelect(id);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add to Session" snapHeight={0.6}>
      <ScrollView contentContainerClassName="px-2 pb-8">
        <Row label="No session" sublabel="Standalone catch" selected={selectedId === null} onPress={() => choose(null)} />
        {sessions.map((s) => (
          <Row
            key={s.id}
            label={s.name}
            sublabel={`${formatDate(s.started_at)}${s.ended_at ? '' : ' · Active'}`}
            selected={selectedId === s.id}
            onPress={() => choose(s.id)}
          />
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

function Row({
  label,
  sublabel,
  selected,
  onPress,
}: {
  label: string;
  sublabel: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3 rounded-card active:bg-surface"
    >
      <View className="gap-y-0.5">
        <Text className="text-foreground text-base font-bold">{label}</Text>
        <Text className="text-muted text-xs">{sublabel}</Text>
      </View>
      {selected && <Check size={20} color={colors.accent} strokeWidth={2.5} />}
    </Pressable>
  );
}
