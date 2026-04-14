import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSessions } from '@/hooks/useSessions';
import { useCatches } from '@/hooks/useCatches';
import { SessionCard } from '@/components/session/SessionCard';
import { NewSessionSheet } from '@/components/session/NewSessionSheet';
import { colors } from '@/theme';

export function SessionsScreen() {
  const router = useRouter();
  const { sessions, loadSessions, createSession } = useSessions();
  const { catches, loadCatches } = useCatches();
  const [refreshing, setRefreshing] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    loadSessions();
    loadCatches();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadSessions(), loadCatches()]);
    setRefreshing(false);
  };

  const catchCountForSession = (sessionId: string) =>
    catches.filter((c) => c.session_id === sessionId).length;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="px-4 pt-4 pb-8 gap-y-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-black text-foreground uppercase tracking-widest">
            Sessions
          </Text>
          <Pressable
            onPress={() => setShowNew(true)}
            className="bg-accent rounded-full px-4 py-2 active:bg-accent-pressed"
          >
            <Text className="text-accent-fg font-bold text-sm">+ New</Text>
          </Pressable>
        </View>

        {sessions.length === 0 ? (
          <View className="items-center py-12 gap-y-3">
            <Text className="text-5xl">🗓️</Text>
            <Text className="text-foreground font-bold text-lg">No sessions yet</Text>
            <Text className="text-muted text-sm text-center">
              Start a session before heading out to group your catches
            </Text>
          </View>
        ) : (
          sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              catchCount={catchCountForSession(s.id)}
              onPress={() => router.push(`/sessions/${s.id}`)}
            />
          ))
        )}
      </ScrollView>

      <NewSessionSheet
        visible={showNew}
        onClose={() => setShowNew(false)}
        onCreate={createSession}
      />
    </View>
  );
}
