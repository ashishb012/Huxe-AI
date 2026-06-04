// ─────────────────────────────────────────────────────────────
// Huxe AI — Audio Player Service
// ─────────────────────────────────────────────────────────────

import TrackPlayer, { 
  Capability, 
  RepeatMode 
} from 'react-native-track-player';
import { GeneratedTrack } from './ttsService';

let isSetup = false;

export async function setupPlayer() {
  if (isSetup) return;

  try {
    await TrackPlayer.setupPlayer();
    
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
    });

    await TrackPlayer.setRepeatMode(RepeatMode.Off);
    isSetup = true;
  } catch (error) {
    console.error('Failed to setup track player:', error);
  }
}

export async function loadTracks(tracks: GeneratedTrack[]) {
  if (!isSetup) await setupPlayer();
  
  await TrackPlayer.reset();
  
  if (tracks.length > 0) {
    await TrackPlayer.add(tracks);
  }
}

export async function play() {
  await TrackPlayer.play();
}

export async function pause() {
  await TrackPlayer.pause();
}

export async function setPlaybackRate(rate: number) {
  await TrackPlayer.setRate(rate);
}
