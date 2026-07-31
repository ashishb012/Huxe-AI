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
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
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

export async function seekTo(position: number) {
  await TrackPlayer.seekTo(Math.max(0, position));
}

export async function seekBy(seconds: number) {
  const { position, duration } = await TrackPlayer.getProgress();
  const maximumPosition = duration > 0 ? duration : Number.MAX_SAFE_INTEGER;
  await seekTo(Math.min(Math.max(position + seconds, 0), maximumPosition));
}
