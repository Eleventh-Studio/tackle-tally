import React, { useEffect } from 'react';
import { ScrollView, View, Text, Image } from 'react-native';
import { StatCard, SectionHeader } from '@/components/ds';
import { useStats } from '@/hooks/useStats';
import { useCatches } from '@/hooks/useCatches';

export function ProfileScreen() {
  const { loadCatches } = useCatches();
  const stats = useStats();

  useEffect(() => { loadCatches(); }, []);

  const maxCount = Math.max(...stats.speciesBreakdown.map((s) => s.count), 1);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 pt-4 pb-8 gap-y-6"
    >
      <Text className="text-2xl font-black text-foreground uppercase tracking-widest">Profile</Text>

      {/* Featured catch */}
      {stats.biggestCatch && (
        <View className="bg-surface rounded-card border border-border overflow-hidden">
          <Image
            source={{ uri: stats.biggestCatch.photo_uri }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <View className="p-4">
            <Text className="text-xs text-muted font-semibold uppercase tracking-widest mb-1">
              Biggest Catch
            </Text>
            <Text className="text-foreground font-black text-xl">
              {stats.biggestCatch.species}
            </Text>
            {stats.biggestCatch.length_cm && (
              <Text className="text-muted">{stats.biggestCatch.length_cm} cm</Text>
            )}
          </View>
        </View>
      )}

      {/* Stats */}
      <View>
        <SectionHeader title="My Stats" />
        <View className="flex-row flex-wrap gap-3">
          <View className="flex-row gap-x-3 w-full">
            <StatCard value={stats.totalCatches} label="Catches" accent />
            <StatCard value={stats.uniqueSpecies} label="Species" />
          </View>
          <View className="flex-row gap-x-3 w-full">
            <StatCard value={stats.totalSessions} label="Sessions" />
            <StatCard
              value={stats.biggestCatch?.length_cm ? `${stats.biggestCatch.length_cm}cm` : '—'}
              label="Biggest"
            />
          </View>
        </View>
      </View>

      {/* Species breakdown */}
      {stats.speciesBreakdown.length > 0 && (
        <View>
          <SectionHeader title="Species Breakdown" />
          <View className="gap-y-3">
            {stats.speciesBreakdown.map(({ species, count }) => (
              <View key={species} className="flex-row items-center gap-x-3">
                <Text className="text-foreground text-sm flex-1" numberOfLines={1}>
                  {species}
                </Text>
                <View className="flex-1 h-2 bg-surface-raised rounded-full overflow-hidden">
                  <View
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </View>
                <Text className="text-muted text-sm w-6 text-right">{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
