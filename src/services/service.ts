// ─────────────────────────────────────────────────────────────
// Huxe AI — Track Player Background Service
// ─────────────────────────────────────────────────────────────

import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function() {
  // Remote handlers run while the JS app can be suspended. Always absorb command
  // errors so a stale media notification cannot surface an unhandled warning.
  const safely = (action: () => Promise<void>) => () => {
    void action().catch((error) => console.warn('[PlayerService] Remote command ignored:', error));
  };

  TrackPlayer.addEventListener(Event.RemotePlay, safely(() => TrackPlayer.play()));
  TrackPlayer.addEventListener(Event.RemotePause, safely(() => TrackPlayer.pause()));
  TrackPlayer.addEventListener(Event.RemoteStop, safely(() => TrackPlayer.stop()));
  TrackPlayer.addEventListener(Event.RemoteNext, safely(() => TrackPlayer.skipToNext()));
  TrackPlayer.addEventListener(Event.RemotePrevious, safely(() => TrackPlayer.skipToPrevious()));
};
