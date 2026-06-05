import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import TrackPlayer, { useProgress, useIsPlaying, useActiveTrack } from 'react-native-track-player';

import { useDatabaseContext } from '../../src/contexts/DatabaseContext';
import { getBriefHistoryById, getScriptForHistory } from '../../src/database/db';
import { DailyBriefData } from '../../src/types/brief';
import { PodcastScript } from '../../src/services/scriptService';
import { loadTracks, play, pause, setPlaybackRate } from '../../src/services/playerService';
import { GeneratedTrack } from '../../src/services/ttsService';

import { SectionCard } from '../../src/components/SectionCard';
import { ExpandableCard } from '../../src/components/ExpandableCard';
import { WaveformIndicator } from '../../src/components/WaveformIndicator';
import { PlayerBar } from '../../src/components/PlayerBar';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const historyId = params.id ? parseInt(params.id as string) : null;

  const { userPreferences } = useDatabaseContext();
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  const [brief, setBrief] = useState<DailyBriefData | null>(null);
  const [script, setScript] = useState<PodcastScript | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TrackPlayer Hooks
  const { playing } = useIsPlaying();
  const progressState = useProgress();
  const activeTrack = useActiveTrack();
  
  // Active Card mapping
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const userName = userPreferences?.preferredName || 'User';

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (historyId) {
          const history = await getBriefHistoryById(historyId);
          if (history && history.briefDataJson) {
            setBrief(JSON.parse(history.briefDataJson));
          }
          
          const scriptRecord = await getScriptForHistory(historyId);
          if (scriptRecord) {
            const parsedScript: PodcastScript = JSON.parse(scriptRecord.scriptJson);
            setScript(parsedScript);
            
            // Reconstruct track objects
            const tracks: GeneratedTrack[] = parsedScript.paragraphs.map((p, i) => ({
              id: `part_${i}`,
              url: `${FileSystem.documentDirectory}audio_cache/brief_${historyId}_part_${i}.wav`,
              title: `Part ${i + 1}`,
              artist: p.speaker,
              duration: 0
            }));
            
            await loadTracks(tracks);
            await play();
          }
        }
      } catch (error) {
        console.error('Failed to load brief data from DB:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    return () => {
      // Pause when leaving
      pause();
    };
  }, [historyId]);

  // Sync active track index to active card expansion (simple heuristic mapping)
  useEffect(() => {
    if (activeTrack && brief) {
      const partMatch = String(activeTrack.id).match(/part_(\d+)/);
      if (partMatch) {
        const index = parseInt(partMatch[1]);
        // Roughly try to map paragraph index to sections
        // Very basic mapping for demo purposes
        const totalItems = brief.emails.length + brief.newsletters.length + brief.headlines.length + brief.interests.length;
        if (totalItems > 0 && script) {
          const ratio = index / script.paragraphs.length;
          
          const allCardIds = [
            ...brief.calendar.map(c => c.id),
            ...brief.emails.map(e => e.id),
            ...brief.newsletters.map(n => n.id),
            ...brief.headlines.map(h => h.id),
            ...brief.interests.map(i => i.id),
            ...brief.markets.map(m => m.symbol)
          ];
          
          const targetCardIndex = Math.floor(ratio * allCardIds.length);
          setActiveCardId(allCardIds[Math.min(targetCardIndex, allCardIds.length - 1)]);
        }
      }
    }
  }, [activeTrack, brief, script]);

  const handleTogglePlay = () => {
    if (playing) {
      pause();
    } else {
      play();
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setPlaybackRate(speed);
  };

  const progressPercent = progressState.duration > 0 ? progressState.position / progressState.duration : 0;

  if (isLoading || !brief) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: 16 }}>
            Generating your brief...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Brief</Text>
          <TouchableOpacity onPress={() => router.push('/(main)/settings')} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting Card */}
          <View style={styles.greetingContainer}>
            <LinearGradient
              colors={['#8B4513', '#D2691E', '#CD853F', '#F4A460', '#2F4F4F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.greetingGradient}
            />
            <View style={styles.greetingOverlay}>
              <View style={styles.waveformWrapper}>
                <WaveformIndicator isActive={playing || false} />
              </View>
              <Text style={styles.greetingText}>{brief.greeting}</Text>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color={colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{brief.date}</Text>
              </View>
            </View>
          </View>

          {/* Calendar Section */}
          {brief.calendar.length > 0 && (
            <SectionCard title="Calendar" sectionType="calendar" isActive={false}>
              {brief.calendar.map((event) => (
                <ExpandableCard
                  key={event.id}
                  title={event.title}
                  subtitle={`${event.time}`}
                  icon={<Ionicons name="calendar-outline" size={18} color={colors.textPrimary} />}
                  isExpanded={activeCardId === event.id}
                >
                  {event.location && <Text style={styles.expandedText}>• Location: {event.location}</Text>}
                </ExpandableCard>
              ))}
            </SectionCard>
          )}

          {/* Email Section */}
          {brief.emails.length > 0 && (
            <SectionCard title="Email" sectionType="email" isActive={false}>
              {brief.emails.map((email) => (
                <ExpandableCard
                  key={email.id}
                  title={email.subject}
                  subtitle={`From: ${email.from}`}
                  icon={<Ionicons name="mail-outline" size={18} color={colors.textPrimary} />}
                  isExpanded={activeCardId === email.id}
                >
                  <Text style={styles.expandedText}>• {email.snippet}</Text>
                </ExpandableCard>
              ))}
            </SectionCard>
          )}

          {/* Newsletter Section */}
          {brief.newsletters.length > 0 && (
            <SectionCard title="Newsletter" sectionType="newsletter" isActive={false}>
              {brief.newsletters.map((nl) => (
                <ExpandableCard
                  key={nl.id}
                  title={nl.author}
                  subtitle={nl.title}
                  icon={<Ionicons name="newspaper-outline" size={18} color={colors.textPrimary} />}
                  isExpanded={activeCardId === nl.id}
                >
                  {nl.bullets.map((bullet, i) => (
                    <Text key={i} style={styles.expandedText}>• {bullet}</Text>
                  ))}
                </ExpandableCard>
              ))}
            </SectionCard>
          )}

          {/* Headlines Section */}
          {brief.headlines.length > 0 && (
            <SectionCard title="Headlines" sectionType="headlines" isActive={false}>
              {brief.headlines.map((hl) => (
                <ExpandableCard
                  key={hl.id}
                  title={hl.source}
                  subtitle={hl.title}
                  icon={<Ionicons name="newspaper-outline" size={18} color={colors.textPrimary} />}
                  isExpanded={activeCardId === hl.id}
                >
                  <Text style={styles.expandedText}>• Tap to read the full article on {hl.source}</Text>
                </ExpandableCard>
              ))}
            </SectionCard>
          )}

          {/* Interests Section */}
          {brief.interests.length > 0 && (
            <SectionCard title="Interests" sectionType="interests" isActive={false}>
              {brief.interests.map((interest) => (
                <ExpandableCard
                  key={interest.id}
                  title={interest.topic}
                  icon={<Ionicons name="radio-button-on" size={12} color={colors.textMuted} />}
                  isExpanded={activeCardId === interest.id}
                >
                  {interest.bullets.map((bullet, i) => (
                    <Text key={i} style={styles.expandedText}>• {bullet}</Text>
                  ))}
                </ExpandableCard>
              ))}
            </SectionCard>
          )}

          {/* Markets Section */}
          {brief.markets.length > 0 && (
            <SectionCard title="Markets" sectionType="markets" isActive={false}>
              {brief.markets.map((market) => (
                <ExpandableCard
                  key={market.symbol}
                  title={market.name}
                  subtitle={`${(market.value || 0).toFixed(2)} (${market.isPositive ? '+' : ''}${(market.changePercent || 0).toFixed(2)}%)`}
                  icon={
                    <Ionicons 
                      name={market.isPositive ? "trending-up" : "trending-down"} 
                      size={18} 
                      color={market.isPositive ? '#4CAF50' : '#F44336'} 
                    />
                  }
                  isExpanded={activeCardId === market.symbol}
                >
                  <Text style={styles.expandedText}>
                    {market.isPositive ? 'Up' : 'Down'} {Math.abs(market.change || 0).toFixed(2)} points today.
                  </Text>
                </ExpandableCard>
              ))}
            </SectionCard>
          )}

          {/* Farewell Card */}
          <View style={styles.greetingContainer}>
            <LinearGradient
              colors={['#2F4F4F', '#8B4513', '#D2691E', '#CD853F', '#F4A460']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.greetingGradient}
            />
            <View style={styles.greetingOverlay}>
              <View style={styles.waveformWrapper}>
                <WaveformIndicator isActive={false} />
              </View>
              <Text style={styles.greetingText}>Thanks for listening, {userName}</Text>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color={colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{brief.date}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Fixed Player Bar */}
      <PlayerBar
        isPlaying={playing || false}
        playbackSpeed={playbackSpeed}
        onTogglePlay={handleTogglePlay}
        onSpeedChange={handleSpeedChange}
        progress={progressPercent}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  backIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  settingsIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  headerTitle: {
    ...typography.bodyBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Space for PlayerBar
    paddingTop: 16,
  },
  greetingContainer: {
    height: 380,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  greetingGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.8,
  },
  greetingOverlay: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  waveformWrapper: {
    alignSelf: 'flex-start',
  },
  greetingText: {
    ...typography.hero,
    fontSize: 42,
    color: colors.textPrimary,
    lineHeight: 52,
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
  emailIcon: {
    fontSize: 16,
    color: colors.textPrimary,
    opacity: 0.8,
  },
  bulletIcon: {
    fontSize: 12,
    color: colors.textMuted,
  },
  expandedText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  jumpContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  jumpButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 999,
  },
  jumpText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  headlineCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  headlineThumbPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headlineThumbIcon: {
    fontSize: 24,
  },
  headlineTextContainer: {
    flex: 1,
  },
  headlineTitle: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
