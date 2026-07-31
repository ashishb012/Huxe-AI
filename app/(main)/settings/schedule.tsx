import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { GlassCard } from '../../../src/components/GlassCard';
import { useDatabaseContext } from '../../../src/contexts/DatabaseContext';
import { setDailyBriefSchedule } from '../../../src/services/dailyBriefScheduler';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';

function toTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseTime(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 ? { hour, minute } : null;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { userPreferences, updateUserPreferences } = useDatabaseContext();
  const [time, setTime] = useState('08:00');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userPreferences) setTime(toTime(userPreferences.dailyBriefHour, userPreferences.dailyBriefMinute));
  }, [userPreferences]);

  const saveTime = async () => {
    const parsed = parseTime(time);
    if (!parsed) {
      Alert.alert('Use a valid time', 'Enter a 24-hour time such as 07:30 or 18:00.');
      return false;
    }
    await updateUserPreferences({ dailyBriefHour: parsed.hour, dailyBriefMinute: parsed.minute });
    setTime(toTime(parsed.hour, parsed.minute));
    return true;
  };

  const toggleSchedule = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      if (enabled && !await saveTime()) return;
      const scheduled = await setDailyBriefSchedule(enabled);
      if (!scheduled) {
        Alert.alert('Notifications are disabled', 'Enable notifications for Huxe AI in system settings to receive your daily brief alert.');
        return;
      }
      await updateUserPreferences({ dailyBriefEnabled: enabled ? 1 : 0 });
    } catch (error) {
      console.error('[Schedule] Failed to update schedule:', error);
      Alert.alert('Could not update schedule', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Schedule</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Automatic daily brief</Text>
          <GlassCard style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.title}>Generate every day</Text>
                <Text style={styles.description}>Create a new podcast and notify you when it is ready.</Text>
              </View>
              <Switch
                value={Boolean(userPreferences?.dailyBriefEnabled)}
                onValueChange={toggleSchedule}
                disabled={isSaving}
                trackColor={{ false: colors.surfaceBorder, true: colors.accent }}
              />
            </View>
          </GlassCard>

          <Text style={[styles.sectionTitle, styles.timeHeading]}>Generation time</Text>
          <GlassCard style={styles.card}>
            <Text style={styles.description}>Local time, in 24-hour format.</Text>
            <View style={styles.timeRow}>
              <TextInput
                value={time}
                onChangeText={setTime}
                onBlur={() => { void saveTime(); }}
                editable={!isSaving}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                placeholder="08:00"
                placeholderTextColor={colors.textMuted}
                style={styles.timeInput}
              />
              <TouchableOpacity style={styles.saveButton} onPress={() => { void saveTime(); }} disabled={isSaving}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          <Text style={styles.note}>
            Your phone lets Huxe AI run background work around this time. It may run a little later when battery-saving settings or the operating system delay background activity.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  spacer: { width: 44 },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  sectionTitle: { ...typography.h3, color: colors.accent, marginBottom: 16 },
  timeHeading: { marginTop: 32 },
  card: { padding: 18 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleText: { flex: 1 },
  title: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: 4 },
  description: { ...typography.caption, color: colors.textSecondary, lineHeight: 19 },
  timeRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
  timeInput: { flex: 1, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 12, color: colors.textPrimary, paddingHorizontal: 14, paddingVertical: 12, ...typography.body },
  saveButton: { backgroundColor: colors.accent, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 18 },
  saveButtonText: { ...typography.bodyBold, color: colors.textOnAccent },
  note: { ...typography.caption, color: colors.textMuted, lineHeight: 19, marginTop: 20 },
});
