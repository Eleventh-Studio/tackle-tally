import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap } from 'lucide-react-native';
import { StatCard, SectionHeader } from '@/components/ds';
import { CatchCard } from '@/components/catch/CatchCard';
import { ActiveSessionBanner } from '@/components/session/ActiveSessionBanner';
import { NewSessionSheet } from '@/components/session/NewSessionSheet';
import { useCatches } from '@/hooks/useCatches';
import { useSessions } from '@/hooks/useSessions';
import { useStats } from '@/hooks/useStats';
import { colors } from '@/theme';

export function HomeScreen() {
  const router = useRouter();
  const { catches, loadCatches } = useCatches();
  const { activeSession, createSession, endSession, loadSessions } = useSessions();
  const stats = useStats();
  const [refreshing, setRefreshing] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);
  useEffect(() => {
    loadCatches();
    loadSessions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCatches(), loadSessions()]);
    setRefreshing(false);
  };

  const activeCatchCount = activeSession
    ? catches.filter((c) => c.session_id === activeSession.id).length
    : 0;

  const recentCatches = catches.slice(0, 10);

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, paddingHorizontal: 16, gap: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* Header */}
        <Text className="text-3xl font-black text-foreground uppercase tracking-widest">
          Tackle Tally
        </Text>

        {/* Active session */}
        {activeSession && (
          <ActiveSessionBanner
            session={activeSession}
            catchCount={activeCatchCount}
            onPress={() => router.push(`/sessions/${activeSession.id}`)}
            onEnd={() => endSession(activeSession.id)}
          />
        )}

        {/* Stats */}
        <View className="flex-row gap-x-3">
          <StatCard value={stats.totalCatches} label="Catches" accent />
          <StatCard value={stats.totalSessions} label="Sessions" />
          <StatCard value={stats.uniqueSpecies} label="Species" />
        </View>

        {/* Primary CTA */}
        <Pressable
          onPress={() => router.push('/log-catch')}
          className="bg-accent rounded-card items-center justify-center active:bg-accent-pressed flex-row gap-x-4"
          style={{ paddingVertical: 28 }}
        >
          <Zap size={30} color={colors.accentForeground} strokeWidth={2.5} />
          <Text className="text-accent-fg font-black text-3xl uppercase tracking-widest">
            Log a Catch
          </Text>
        </Pressable>

        {/* Secondary: start/view session */}
        {!activeSession && (
          <Pressable
            onPress={() => setShowNewSession(true)}
            className="border border-border rounded-card py-4 items-center active:bg-surface-raised"
          >
            <Text className="text-muted font-semibold text-base">+ Start New Session</Text>
          </Pressable>
        )}

        {/* Recent catches */}
        {recentCatches.length > 0 && (
          <View>
            <SectionHeader title="Recent Catches" />
            <View className="gap-y-3">
              {recentCatches.map((c) => (
                <CatchCard
                  key={c.id}
                  catch_={c}
                  onPress={() => router.push(`/catches/${c.id}`)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty state */}
        {catches.length === 0 && (
          <View className="items-center py-12 gap-y-3">
            <Text className="text-5xl">🎣</Text>
            <Text className="text-foreground font-bold text-lg text-center">
              No catches yet
            </Text>
            <Text className="text-muted text-center text-sm">
              Tap LOG A CATCH to record your first fish
            </Text>
          </View>
        )}
      </ScrollView>

      <NewSessionSheet
        visible={showNewSession}
        onClose={() => setShowNewSession(false)}
        onCreate={(name) => createSession(name)}
      />
    </>
  );
}
