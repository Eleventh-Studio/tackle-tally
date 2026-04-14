import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, TextInput } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { BottomSheet } from '@/components/ds';
import { SPECIES_LIST } from '@/constants/species';
import { colors } from '@/theme';

interface SpeciesSelectProps {
  value: string | null;
  onChange: (species: string) => void;
}

export function SpeciesSelect({ value, onChange }: SpeciesSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = SPECIES_LIST.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (species: string) => {
    onChange(species);
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between bg-surface-raised rounded-input border border-border px-4 py-3 active:opacity-70"
      >
        <Text className={value ? 'text-foreground text-base' : 'text-muted text-base'}>
          {value ?? 'Select species…'}
        </Text>
        <ChevronDown size={18} color={colors.mutedForeground} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title="Species" snapHeight={0.75}>
        <View className="px-4 pt-3 pb-2">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search species…"
            placeholderTextColor={colors.mutedForeground}
            autoFocus
            className="bg-surface-raised rounded-input border border-border px-4 py-3 text-foreground text-base"
          />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              className="px-6 py-4 border-b border-border active:bg-surface-raised"
            >
              <Text
                className={`text-base ${item === value ? 'text-accent font-bold' : 'text-foreground'}`}
              >
                {item}
              </Text>
            </Pressable>
          )}
        />
      </BottomSheet>
    </>
  );
}
