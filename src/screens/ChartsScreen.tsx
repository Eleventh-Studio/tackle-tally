import React, { useEffect } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatches } from '@/hooks/useCatches';
import { useStats } from '@/hooks/useStats';
import { SectionHeader } from '@/components/ds';

export function ChartsScreen() {
  const { catches, loadCatches } = useCatches();
  const stats = useStats();

  useEffect(() => { loadCatches(); }, []);

  if (catches.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121212' }}>
        <View className="flex-1 items-center justify-center gap-y-3">
          <Text className="text-5xl">📊</Text>
          <Text className="text-foreground font-bold text-lg">No data yet</Text>
          <Text className="text-muted text-sm">Log some catches to see your stats</Text>
        </View>
      </SafeAreaView>
    );
  }

  const maxCount = Math.max(...stats.speciesBreakdown.map((s) => s.count), 1);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121212' }}>
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 pt-4 pb-8 gap-y-8"
    >
      <Text className="text-2xl font-black text-foreground uppercase tracking-widest">Charts</Text>

      {/* Species breakdown */}
      <View>
        <SectionHeader title="Top Species" />
        <View className="gap-y-3">
          {stats.speciesBreakdown.slice(0, 10).map(({ species, count }) => (
            <View key={species} className="gap-y-1">
              <View className="flex-row justify-between">
                <Text className="text-foreground text-sm font-semibold" numberOfLines={1}>
                  {species}
                </Text>
                <Text className="text-muted text-sm">{count}</Text>
              </View>
              <View className="h-2 bg-surface-raised rounded-full overflow-hidden">
                <View
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Summary stats */}
      <View className="gap-y-3">
        <SectionHeader title="Summary" />
        <View className="bg-surface rounded-card border border-border p-4 gap-y-3">
          <StatRow label="Total Catches" value={stats.totalCatches} />
          <StatRow label="Total Sessions" value={stats.totalSessions} />
          <StatRow label="Species Diversity" value={stats.uniqueSpecies} />
          {stats.biggestCatch && (
            <StatRow
              label="Biggest Fish"
              value={`${stats.biggestCatch.species} ${stats.biggestCatch.length_cm ? `(${stats.biggestCatch.length_cm}cm)` : ''}`}
            />
          )}
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-muted text-sm">{label}</Text>
      <Text className="text-foreground font-bold text-sm">{value}</Text>
    </View>
  );
}
