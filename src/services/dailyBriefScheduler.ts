import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { getUserPreferences, initDatabase, updateUserPreferences } from '../database/db';
import { generateAndSaveDailyBrief } from './briefGenerationService';

const DAILY_BRIEF_TASK = 'huxeai.daily-brief-generation';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export async function runScheduledBriefIfDue(): Promise<boolean> {
  await initDatabase();
  const preferences = await getUserPreferences();
  if (!preferences.dailyBriefEnabled) return false;

  const now = new Date();
  const today = localDateKey(now);
  const scheduledMinutes = preferences.dailyBriefHour * 60 + preferences.dailyBriefMinute;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (nowMinutes < scheduledMinutes || preferences.lastScheduledBriefDate === today) return false;

  await generateAndSaveDailyBrief();
  await updateUserPreferences({ lastScheduledBriefDate: today });
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Your daily brief is ready', body: 'Your podcast has been generated. Tap to listen.', sound: 'default' },
    trigger: null,
  });
  return true;
}

TaskManager.defineTask(DAILY_BRIEF_TASK, async () => {
  try {
    await runScheduledBriefIfDue();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[DailyBriefScheduler] Background generation failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  const status = current.granted ? current.status : (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return false;

  await Notifications.setNotificationChannelAsync('daily-brief', {
    name: 'Daily brief',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
  return true;
}

export async function setDailyBriefSchedule(enabled: boolean): Promise<boolean> {
  if (!enabled) {
    if (await TaskManager.isTaskRegisteredAsync(DAILY_BRIEF_TASK)) {
      await BackgroundFetch.unregisterTaskAsync(DAILY_BRIEF_TASK);
    }
    return true;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return false;
  if (!await TaskManager.isTaskRegisteredAsync(DAILY_BRIEF_TASK)) {
    await BackgroundFetch.registerTaskAsync(DAILY_BRIEF_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
  return true;
}
