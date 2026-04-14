import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { BottomSheet, Button } from '@/components/ds';
import { colors } from '@/theme';

interface NewSessionSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function NewSessionSheet({ visible, onClose, onCreate }: NewSessionSheetProps) {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="New Session" snapHeight={0.4}>
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
        <Button
          onPress={handleCreate}
          label="Start Session 🎣"
          fullWidth
          disabled={!name.trim()}
        />
      </View>
    </BottomSheet>
  );
}
