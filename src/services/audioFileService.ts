// ─────────────────────────────────────────────────────────────
// Huxe AI — Audio File Service
// ─────────────────────────────────────────────────────────────

import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system/legacy';

const AUDIO_DIR = `${FileSystem.documentDirectory}audio_cache/`;
const WAV_HEADER_SIZE = 44;
const PCM_SAMPLE_RATE = 24000;
const PCM_CHANNELS = 1;
const PCM_BITS_PER_SAMPLE = 16;

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
  base64Audio: string,
  mimeType?: string
): Promise<string> {
  await initAudioCache();
  const filePath = `${AUDIO_DIR}brief_${historyId}_part_${index}.wav`;

  const wavBase64 = shouldWrapPcmInWav(mimeType)
    ? pcmBase64ToWavBase64(base64Audio)
    : base64Audio;

  await FileSystem.writeAsStringAsync(filePath, wavBase64, {
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

function shouldWrapPcmInWav(mimeType?: string): boolean {
  if (!mimeType) {
    return true;
  }

  return !mimeType.toLowerCase().includes('wav');
}

function pcmBase64ToWavBase64(base64Audio: string): string {
  const pcmBuffer = Buffer.from(base64Audio, 'base64');
  const wavBuffer = Buffer.alloc(WAV_HEADER_SIZE + pcmBuffer.length);

  writeWavHeader(wavBuffer, pcmBuffer.length);
  pcmBuffer.copy(wavBuffer, WAV_HEADER_SIZE);

  return wavBuffer.toString('base64');
}

function writeWavHeader(buffer: Buffer, dataLength: number) {
  const byteRate = PCM_SAMPLE_RATE * PCM_CHANNELS * (PCM_BITS_PER_SAMPLE / 8);
  const blockAlign = PCM_CHANNELS * (PCM_BITS_PER_SAMPLE / 8);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(PCM_CHANNELS, 22);
  buffer.writeUInt32LE(PCM_SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(PCM_BITS_PER_SAMPLE, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
}
