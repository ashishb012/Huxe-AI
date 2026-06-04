// ─────────────────────────────────────────────────────────────
// Huxe AI — TTS Service
// ─────────────────────────────────────────────────────────────

import { PodcastScript } from './scriptService';
import { saveAudioPart } from './audioFileService';
import { getUserPreferences } from '../database/db';

const TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

// We reuse the Gemini API key, assuming it's a general GCP key with TTS enabled.
// If it fails, we provide mock audio paths or fail gracefully.
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export interface GeneratedTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  duration: number;
}

/**
 * Generates audio for each paragraph in the script sequentially.
 */
export async function generateAudioForScript(
  historyId: number,
  script: PodcastScript,
  onProgress?: (status: string) => void
): Promise<GeneratedTrack[]> {
  const prefs = await getUserPreferences();
  
  // Map our preferred voice names to actual Google TTS voice names
  // Using standard voices as fallback
  const getVoiceName = (speaker: string) => {
    if (speaker.toLowerCase().includes('co-host') || speaker.toLowerCase() === 'cohost') {
      // Female voice
      return 'en-US-Journey-F'; 
    }
    // Male voice
    return 'en-US-Journey-D';
  };

  const tracks: GeneratedTrack[] = [];

  for (let i = 0; i < script.paragraphs.length; i++) {
    const p = script.paragraphs[i];
    if (onProgress) onProgress(`Generating audio (${i + 1}/${script.paragraphs.length})...`);
    
    try {
      const response = await fetch(`${TTS_API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: p.text },
          voice: { 
            languageCode: 'en-US',
            name: getVoiceName(p.speaker)
          },
          audioConfig: { 
            audioEncoding: 'LINEAR16', // WAV format roughly
            speakingRate: 1.1 
          }
        })
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const data = await response.json();
      const base64Audio = data.audioContent;
      
      const localUri = await saveAudioPart(historyId, i, base64Audio);
      
      tracks.push({
        id: `part_${i}`,
        url: localUri,
        title: `Part ${i + 1}`,
        artist: p.speaker,
        duration: 0 // TrackPlayer will figure it out
      });
      
    } catch (error) {
      console.warn(`Failed to generate audio for part ${i}: `, error);
      // If the API fails (e.g. TTS API not enabled on this key), we will return an empty array 
      // or we can use a fallback silent audio track.
      // For this demo, let's break early if TTS fails to avoid spamming errors.
      break;
    }
  }

  return tracks;
}
