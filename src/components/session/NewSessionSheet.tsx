import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { BottomSheet, Button } from '@/components/ds';
import { colors } from '@/theme';
import { formatDateTime } from '@/utils/formatters';

interface NewSessionSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, startedAt: Date) => void;
}

export function NewSessionSheet({ visible, onClose, onCreate }: NewSessionSheetProps) {
  const [name, setName] = useState('');
  const [startedAt, setStartedAt] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const isLive = Date.now() - startedAt.getTime() < 60 * 1000;

  const handleCreate = () => {
    if (!name.trim()) return;
    // Refresh "now" at submit time so sessions opened-but-not-immediately-saved
    // still record as live rather than drifting a few seconds into the past.
    const finalStartedAt = isLive ? new Date() : startedAt;
    onCreate(name.trim(), finalStartedAt);
    setName('');
    setStartedAt(new Date());
    onClose();
  };

  const onPickerChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setStartedAt(selected);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="New Session" snapHeight={0.5}>
      <View className="px-6 pt-4 pb-8 gap-y-4">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Session name…"
          placeholderTextColor={colors.mutedForeground}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
          className="bg-surface-raised rounded-input border border-border px-4 py-4 text-foreground text-lg font-semibold"
        />

        <Pressable
          onPress={() => setShowPicker(true)}
          className="bg-surface-raised rounded-input border border-border px-4 py-3 flex-row items-center justify-between active:opacity-70"
        >
          <View className="flex-row items-center gap-x-3">
            <Calendar size={18} color={colors.mutedForeground} strokeWidth={2} />
            <Text className="text-muted text-sm font-semibold uppercase tracking-wider">
              Started
            </Text>
          </View>
          <Text className="text-foreground text-base font-bold">
            {isLive ? 'Now' : formatDateTime(startedAt.toISOString())}
          </Text>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={startedAt}
            mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            maximumDate={new Date()}
            onChange={onPickerChange}
          />
        )}
        {showPicker && Platform.OS === 'ios' && (
          <Button onPress={() => setShowPicker(false)} label="Done" variant="secondary" fullWidth />
        )}

        <Button
          onPress={handleCreate}
          label={isLive ? 'Start Session 🎣' : 'Add Session'}
          fullWidth
          disabled={!name.trim()}
        />
      </View>
    </BottomSheet>
  );
}
