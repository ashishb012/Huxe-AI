import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BriefHistory } from '../database/schema';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { GlassCard } from './GlassCard';

interface Props {
  history: BriefHistory;
}

export function HistoryCard({ history }: Props) {
  const router = useRouter();

  const handlePress = () => {
    router.push({ pathname: '/(main)/player', params: { id: history.id } });
  };

  const dateStr = new Date(history.generatedAt).toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const timeStr = new Date(history.generatedAt).toLocaleTimeString([], {
    hour: 'numeric', minute: '2-digit'
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <GlassCard style={styles.card} intensity={15}>
        <View style={styles.left}>
          <View style={styles.iconContainer}>
            <Ionicons name="headset" size={20} color={colors.accent} />
          </View>
          <View>
            <Text style={styles.title}>Brief for {dateStr}</Text>
            <Text style={styles.subtitle}>{timeStr} • {history.durationSeconds ? Math.round(history.durationSeconds / 60) + ' min' : 'Unknown'}</Text>
          </View>
        </View>
        <Ionicons name="play-circle-outline" size={28} color={colors.textPrimary} />
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,165,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
