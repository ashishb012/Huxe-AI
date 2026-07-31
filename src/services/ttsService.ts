// ─────────────────────────────────────────────────────────────
// Huxe AI — TTS Service (Gemini 2.5 Flash Preview TTS)
// ─────────────────────────────────────────────────────────────

import { PodcastScript } from './scriptService';
import { saveAudioPart } from './audioFileService';
import { logError, ErrorSeverity } from '../utils/errorHandler';
import { getUserPreferences } from '../database/db';

// Gemini 2.5 Flash Preview TTS — cheaper, higher limits
const TTS_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Max retries when the model returns text tokens instead of audio
const MAX_RETRIES = 3;

export interface GeneratedTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  duration: number;
}

/**
 * Build the TTS request body for multi-speaker audio.
 * Per official docs, multi-speaker TTS uses `multiSpeakerVoiceConfig`
 * with `speakerVoiceConfigs` array. Speaker names MUST match those used in the prompt text.
 *
 * @see https://ai.google.dev/gemini-api/docs/speech-generation#multi-speaker
 */
async function buildTTSRequestBody(text: string): Promise<object> {
  const prefs = await getUserPreferences();
  
  return {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'Host',
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: prefs.voice1 || 'Charon' }
              }
            },
            {
              speaker: 'Co-Host',
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: prefs.voice2 || 'Puck' }
              }
            }
          ]
        }
      }
    }
  };
}

/**
 * Calls the Gemini TTS API for a single text chunk.
 * Implements retry logic because the model occasionally returns
 * text tokens instead of audio tokens (documented behavior).
 */
async function callTTSWithRetry(
  text: string,
  partIndex: number
): Promise<{ base64Audio: string; mimeType: string }> {
  const requestBody = await buildTTSRequestBody(text);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`[TTS] Part ${partIndex} — attempt ${attempt}/${MAX_RETRIES}`);

    const response = await fetch(`${TTS_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TTS] API returned ${response.status}: ${errorText}`);
      throw new Error(`TTS API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`[TTS] Part ${partIndex} — response keys:`, Object.keys(data));

    // Validate we got audio back, not text
    const candidate = data.candidates?.[0];
    if (!candidate) {
      console.warn(`[TTS] Part ${partIndex} — no candidates in response`);
      if (attempt < MAX_RETRIES) continue;
      throw new Error(`TTS returned no candidates after ${MAX_RETRIES} attempts`);
    }

    const part = candidate.content?.parts?.[0];
    const inlineData = part?.inlineData;

    if (!inlineData?.data) {
      // Model returned text tokens instead of audio — retry
      const textContent = part?.text || 'unknown';
      console.warn(`[TTS] Part ${partIndex} — got text instead of audio: "${String(textContent).substring(0, 100)}"`);
      if (attempt < MAX_RETRIES) continue;
      throw new Error(`TTS returned text instead of audio after ${MAX_RETRIES} retries`);
    }

    console.log(`[TTS] Part ${partIndex} — got audio, mimeType: ${inlineData.mimeType}, size: ${inlineData.data.length} chars`);
    return {
      base64Audio: inlineData.data,
      mimeType: inlineData.mimeType || 'audio/L16;rate=24000',
    };
  }

  // Should never reach here, but TypeScript needs it
  throw new Error('TTS retry loop exited unexpectedly');
}

/**
 * Generates audio for each paragraph in the script sequentially.
 * Combines all paragraphs with speaker labels into a single
 * multi-speaker TTS call to produce natural-sounding conversation.
 */
export async function generateAudioForScript(
  historyId: number,
  script: PodcastScript,
  onProgress?: (status: string) => void
): Promise<GeneratedTrack[]> {
  if (!API_KEY) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set. Cannot generate audio.');
  }

  console.log(`[TTS] Starting audio generation for history ${historyId}, ${script.paragraphs.length} paragraphs`);

  if (onProgress) onProgress('Generating full audio podcast...');

  // Combine all paragraphs into a single multi-speaker transcript
  // Format: "Host: text \n\n Co-Host: text"
  const fullScriptText = script.paragraphs
    .map(p => `${p.speaker}: ${p.text}`)
    .join('\n\n');

  try {
    // Make exactly ONE API call to avoid 3 RPM rate limits
    const { base64Audio, mimeType } = await callTTSWithRetry(fullScriptText, 0);

    const localUri = await saveAudioPart(historyId, 0, base64Audio, mimeType);
    console.log(`[TTS] Full audio saved to: ${localUri}`);

    console.log(`[TTS] Audio generation complete. 1 track generated for full script.`);
    
    return [
      {
        id: `full_podcast`,
        url: localUri,
        title: script.title || 'Daily Brief',
        artist: 'Huxe AI',
        duration: 0, // TrackPlayer resolves this from the file
      }
    ];
  } catch (error) {
    logError(error, `TTS:full_podcast`, ErrorSeverity.ERROR);
    console.error(`[TTS] Failed to generate full audio:`, error);
    throw new Error('TTS failed to generate audio. Check API key and rate limits.');
  }
}
