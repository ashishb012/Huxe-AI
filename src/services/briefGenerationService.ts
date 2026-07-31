import { addBriefHistory, addBriefScript, getUserPreferences, pruneBriefHistory, updateBriefHistoryAudioPath } from '../database/db';
import { deleteAudioFiles } from './audioFileService';
import { generateDailyBrief } from './briefDataService';
import { generatePodcastScript } from './scriptService';
import { generateAudioForScript } from './ttsService';

export async function generateAndSaveDailyBrief(onProgress?: (status: string) => void): Promise<number> {
  const preferences = await getUserPreferences();
  const userName = preferences.preferredName || 'User';

  onProgress?.('Fetching emails and calendar...');
  const briefData = await generateDailyBrief(userName);
  onProgress?.('Writing podcast script with AI...');
  const script = await generatePodcastScript(briefData, userName, preferences.language || 'en', onProgress);

  onProgress?.('Saving brief to database...');
  const durationEstimateSeconds = parseInt(script.durationEstimate, 10) * 60 || 120;
  const historyId = await addBriefHistory(durationEstimateSeconds, null, JSON.stringify(briefData));
  await addBriefScript(historyId, JSON.stringify(script));

  onProgress?.('Generating lifelike audio...');
  const tracks = await generateAudioForScript(historyId, script, onProgress);
  if (tracks.length > 0) await updateBriefHistoryAudioPath(historyId, tracks[0].url);

  const expiredAudioFiles = await pruneBriefHistory(10);
  await deleteAudioFiles(expiredAudioFiles);
  return historyId;
}
