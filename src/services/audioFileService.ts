// ─────────────────────────────────────────────────────────────
// Huxe AI — Audio File Service
// ─────────────────────────────────────────────────────────────

import * as FileSystem from 'expo-file-system';

const AUDIO_DIR = `${(FileSystem as any).documentDirectory}audio_cache/`;

/**
 * Initializes the audio cache directory.
 */
export async function initAudioCache(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
  }
}

/**
 * Saves a base64 audio string to a local file.
 * 
 * @param historyId The brief history ID this audio belongs to
 * @param index The paragraph index (for ordering)
 * @param base64Audio The raw base64 string
 * @returns The local file URI
 */
export async function saveAudioPart(
  historyId: number,
  index: number,
  base64Audio: string
): Promise<string> {
  await initAudioCache();
  const filePath = `${AUDIO_DIR}brief_${historyId}_part_${index}.wav`;
  
  await FileSystem.writeAsStringAsync(filePath, base64Audio, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return filePath;
}

/**
 * Clears the audio cache.
 */
export async function clearAudioCache(): Promise<void> {
  await initAudioCache();
  const files = await FileSystem.readDirectoryAsync(AUDIO_DIR);
  await Promise.all(
    files.map((f) => FileSystem.deleteAsync(`${AUDIO_DIR}${f}`))
  );
}
