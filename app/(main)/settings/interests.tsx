import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDatabaseContext } from '../../../src/contexts/DatabaseContext';
import { TopicChip } from '../../../src/components/TopicChip';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';

export default function InterestsScreen() {
  const router = useRouter();
  const { interests, addInterest, removeInterest, marketPreferences, updateMarketPreferences } = useDatabaseContext();
  const [newTopic, setNewTopic] = useState('');

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      addInterest(newTopic.trim());
      setNewTopic('');
    }
  };

  const toggleUsMarket = (value: boolean) => {
    updateMarketPreferences({ usMarketEnabled: value });
  };

  const toggleIndianMarket = (value: boolean) => {
    updateMarketPreferences({ indianMarketEnabled: value });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interests</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a topic (e.g., Space exploration)"
              placeholderTextColor={colors.textMuted}
              value={newTopic}
              onChangeText={setNewTopic}
              onSubmitEditing={handleAddTopic}
              returnKeyType="done"
            />
            <TouchableOpacity 
              style={[styles.addButton, !newTopic.trim() && styles.addButtonDisabled]} 
              onPress={handleAddTopic}
              disabled={!newTopic.trim()}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipContainer}>
            {interests.map((interest) => (
              <TopicChip
                key={interest.id}
                label={interest.topicString}
                onRemove={() => removeInterest(interest.id)}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Stock Market Updates</Text>
          
          <GlassCard style={styles.marketCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>US Markets</Text>
                <Text style={styles.toggleDesc}>S&P 500, NASDAQ</Text>
              </View>
              <Switch
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.accent }}
                thumbColor={colors.textPrimary}
                ios_backgroundColor="rgba(255,255,255,0.1)"
                onValueChange={toggleUsMarket}
                value={marketPreferences?.usMarketEnabled ?? false}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Indian Markets</Text>
                <Text style={styles.toggleDesc}>NIFTY 50, SENSEX</Text>
              </View>
              <Switch
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.accent }}
                thumbColor={colors.textPrimary}
                ios_backgroundColor="rgba(255,255,255,0.1)"
                onValueChange={toggleIndianMarket}
                value={marketPreferences?.indianMarketEnabled ?? false}
              />
            </View>
          </GlassCard>
        </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  spacer: {
    width: 44,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 24,
    paddingHorizontal: 20,
    color: colors.textPrimary,
    ...typography.body,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addButtonDisabled: {
    backgroundColor: colors.surfaceBorder,
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 24,
    color: colors.textOnAccent,
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 40,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.accent,
    marginBottom: 16,
  },
  marketCard: {
    padding: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  toggleDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 12,
  },
});
