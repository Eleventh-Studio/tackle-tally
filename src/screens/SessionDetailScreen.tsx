import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenHeader, StatCard, SectionHeader, Button } from '@/components/ds';
import { CatchCard } from '@/components/catch/CatchCard';
import { useSessions } from '@/hooks/useSessions';
import { useCatches } from '@/hooks/useCatches';
import { formatDate, formatDuration } from '@/utils/formatters';
import { MOOD_EMOJIS } from '@/constants/gear';

export function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sessions, endSession, editSession } = useSessions();
  const { catches } = useCatches();

  const session = sessions.find((s) => s.id === id);
  const sessionCatches = catches.filter((c) => c.session_id === id);
  const isActive = session && !session.ended_at;

  if (!session) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">Session not found</Text>
      </View>
    );
  }

  const handleEnd = () => {
    Alert.alert('End Session?', 'This will mark the session as complete.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Session', onPress: () => endSession(session.id) },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121212' }}>
    <View className="flex-1 bg-background">
      <ScreenHeader
        title={session.name}
        showBack
        right={
          isActive ? (
            <Pressable onPress={handleEnd} className="active:opacity-70">
              <Text className="text-accent font-bold text-sm">End</Text>
            </Pressable>
          ) : undefined
        }
      />
      <ScrollView contentContainerClassName="px-4 pt-4 pb-8 gap-y-6">
        {/* Meta */}
        <View className="gap-y-1">
          <Text className="text-foreground font-black text-2xl">{session.mood_emoji ?? '🎣'} {session.name}</Text>
          <Text className="text-muted text-sm">
            {formatDate(session.started_at)} · {formatDuration(session.started_at, session.ended_at)}
          </Text>
          {isActive && (
            <View className="bg-accent/10 border border-accent/30 rounded-card px-3 py-1.5 self-start mt-1">
              <Text className="text-accent text-xs font-bold uppercase tracking-widest">Active</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row gap-x-3">
          <StatCard value={sessionCatches.length} label="Catches" accent />
          <StatCard value={formatDuration(session.started_at, session.ended_at)} label="Duration" />
          <StatCard
            value={new Set(sessionCatches.map((c) => c.species)).size}
            label="Species"
          />
        </View>

        {/* Catches */}
        <View>
          <SectionHeader title="Catches" />
          {sessionCatches.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-muted text-sm">No catches in this session</Text>
            </View>
          ) : (
            <View className="gap-y-3">
              {sessionCatches.map((c) => (
                <CatchCard key={c.id} catch_={c} />
              ))}
            </View>
          )}
        </View>

        {/* Add catch button */}
        <Button
          onPress={() =>
            router.push({ pathname: '/log-catch', params: { session_id: session.id } })
          }
          label="+ Add Catch to Session"
          variant="secondary"
          fullWidth
        />
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}
