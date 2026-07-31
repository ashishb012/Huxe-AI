import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDatabaseContext } from '../../src/contexts/DatabaseContext';
import { generateGreeting, formatDate } from '../../src/mocks/briefData';
import { getRecentBriefs } from '../../src/database/db';
import { generateAndSaveDailyBrief } from '../../src/services/briefGenerationService';
import { BriefHistory } from '../../src/database/schema';
import { GradientButton } from '../../src/components/GradientButton';
import { GlassCard } from '../../src/components/GlassCard';
import { GeneratingOverlay } from '../../src/components/GeneratingOverlay';
import { HistoryCard } from '../../src/components/HistoryCard';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function HomeScreen() {
  const router = useRouter();
  const { userPreferences } = useDatabaseContext();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('Starting...');
  const [recentBriefs, setRecentBriefs] = useState<BriefHistory[]>([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        try {
          const history = await getRecentBriefs(5);
          setRecentBriefs(history);
        } catch (error) {
          console.error('[Home] Failed to load brief history:', error);
        }
      };
      loadHistory();
    }, [])
  );

  const userName = userPreferences?.preferredName || 'User';
  const greeting = generateGreeting(userName);
  const dateStr = formatDate();

  const handleGenerateBrief = async () => {
    try {
      setIsGenerating(true);
      const historyId = await generateAndSaveDailyBrief(setGenerationStatus);

      setIsGenerating(false);
      router.push({ pathname: '/(main)/player', params: { id: historyId } });
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
      const errorMsg = error instanceof Error ? `${error.message}\n\nStack:\n${error.stack}` : String(error);
      Alert.alert('Brief Generation Failed', `Detailed Log:\n${errorMsg}`);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={StyleSheet.absoluteFill}
      />

      <GeneratingOverlay isVisible={isGenerating} statusText={generationStatus} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/(main)/settings')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={['#8B4513', '#D2691E', '#CD853F', '#F4A460', '#2F4F4F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            />
            <View style={styles.heroOverlay}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>{greeting}</Text>
              </View>

              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color={colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{dateStr}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <GradientButton
              title="Generate Daily Brief"
              onPress={handleGenerateBrief}
              icon={<Ionicons name="play" size={14} color={colors.textPrimary} style={{ marginRight: 4 }} />}
            />

            <View style={styles.historyContainer}>
              <Text style={styles.sectionTitle}>Recent Briefs</Text>
              {recentBriefs.length === 0 ? (
                <GlassCard style={styles.historyCard} intensity={10}>
                  <Text style={styles.historyText}>No briefs generated yet</Text>
                </GlassCard>
              ) : (
                <View style={styles.historyList}>
                  {recentBriefs.map((item) => <HistoryCard key={item.id} history={item} />)}
                </View>
              )}
            </View>
          </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerSpacer: {
    width: 44,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  settingsIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    minHeight: 360,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.8,
  },
  heroOverlay: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)', // Darken the gradient slightly
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    ...typography.hero,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dateText: {
    ...typography.h3,
    fontSize: 20,
    color: colors.textPrimary,
    opacity: 0.9,
  },
  actionContainer: {
    gap: 24,
  },
  playIcon: {
    color: colors.textPrimary,
    fontSize: 14,
    marginRight: 4,
  },
  historyContainer: {
    alignItems: 'stretch',
    marginTop: 16,
  },
  historyList: {
    gap: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  historyCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  historyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

