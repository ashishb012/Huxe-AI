import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

interface PlayerBarProps {
  isPlaying: boolean;
  playbackSpeed: number;
  position: number;
  duration: number;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (position: number) => void;
  onSeekBy: (seconds: number) => void;
}

const SPEEDS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4.0];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatTime = (seconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function PlayerBar({
  isPlaying,
  playbackSpeed,
  position,
  duration,
  onTogglePlay,
  onSpeedChange,
  onSeek,
  onSeekBy,
}: PlayerBarProps) {
  const insets = useSafeAreaInsets();
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const trackWidthRef = useRef(0);
  const trackXRef = useRef(0);
  const durationRef = useRef(duration);
  const onSeekRef = useRef(onSeek);
  const thumbScale = useRef(new Animated.Value(1)).current;

  durationRef.current = duration;
  onSeekRef.current = onSeek;

  const playbackProgress = duration > 0 ? clamp(position / duration, 0, 1) : 0;
  const visibleProgress = isDragging ? dragProgress : playbackProgress;

  const progressFromPageX = useCallback((pageX: number) => {
    if (trackWidthRef.current <= 0) return 0;
    return clamp((pageX - trackXRef.current) / trackWidthRef.current, 0, 1);
  }, []);

  const updateDragPosition = useCallback((pageX: number) => {
    const nextProgress = progressFromPageX(pageX);
    setDragProgress(nextProgress);
    return nextProgress;
  }, [progressFromPageX]);

  const animateThumbIn = useCallback(() => {
    Animated.spring(thumbScale, {
      toValue: 1.5,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [thumbScale]);

  const animateThumbOut = useCallback(() => {
    Animated.spring(thumbScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [thumbScale]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        setIsDragging(true);
        animateThumbIn();
        updateDragPosition(event.nativeEvent.pageX);
      },
      onPanResponderMove: (event) => {
        updateDragPosition(event.nativeEvent.pageX);
      },
      onPanResponderRelease: (event) => {
        const finalProgress = progressFromPageX(event.nativeEvent.pageX);
        if (durationRef.current > 0) {
          onSeekRef.current(finalProgress * durationRef.current);
        }
        animateThumbOut();
        setIsDragging(false);
      },
      onPanResponderTerminate: () => {
        animateThumbOut();
        setIsDragging(false);
      },
    }),
  ).current;

  const handleSpeedPress = () => {
    const currentIndex = SPEEDS.indexOf(playbackSpeed);
    const nextIndex = currentIndex === -1 || currentIndex === SPEEDS.length - 1 ? 3 : currentIndex + 1;
    onSpeedChange(SPEEDS[nextIndex]);
  };

  const displayTime = isDragging ? visibleProgress * duration : position;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

      {/* ── Custom Seek Bar ────────────────────────────────── */}
      <View style={styles.seekSection}>
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Podcast progress"
          accessibilityValue={{ min: 0, max: Math.floor(duration), now: Math.floor(position) }}
          onLayout={(event) => {
            trackWidthRef.current = event.nativeEvent.layout.width;
            trackXRef.current = event.nativeEvent.layout.x;
            // Measure absolute X position for accurate drag tracking
            event.target && (event.target as any).measureInWindow?.(
              (x: number) => { trackXRef.current = x; },
            );
          }}
          style={styles.seekTrackTouchTarget}
          {...panResponder.panHandlers}
        >
          {/* Track background */}
          <View style={styles.seekTrack}>
            {/* Filled progress */}
            <View style={[styles.seekProgress, { width: `${visibleProgress * 100}%` }]} />
          </View>

          {/* Draggable thumb */}
          <Animated.View
            style={[
              styles.seekThumb,
              {
                left: `${visibleProgress * 100}%`,
                transform: [{ scale: thumbScale }],
              },
            ]}
          >
            {isDragging && <View style={styles.seekThumbGlow} />}
          </Animated.View>
        </View>

        {/* Time labels */}
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(displayTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* ── 5-Control Bottom Bar ──────────────────────────── */}
      <View style={styles.controlsRow}>
        {/* 1. 30 sec back — leftmost */}
        <SkipButton seconds={-30} label="30" onPress={onSeekBy} />

        {/* 2. 10 sec back — left */}
        <SkipButton seconds={-10} label="10" onPress={onSeekBy} />

        {/* 3. Play / Pause — center */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause podcast' : 'Play podcast'}
          style={styles.playButton}
          onPress={onTogglePlay}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={28}
            color={colors.background}
            style={!isPlaying ? styles.playIcon : undefined}
          />
        </TouchableOpacity>

        {/* 4. 10 sec forward — right */}
        <SkipButton seconds={10} label="10" forward onPress={onSeekBy} />

        {/* 5. Playback speed — rightmost */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Playback speed ${playbackSpeed}x`}
          style={styles.speedButton}
          onPress={handleSpeedPress}
          activeOpacity={0.7}
        >
          <Text style={styles.speedText}>{playbackSpeed}x</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Skip Button sub-component ──────────────────────────── */
function SkipButton({
  seconds,
  label,
  forward = false,
  onPress,
}: {
  seconds: number;
  label: string;
  forward?: boolean;
  onPress: (seconds: number) => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${forward ? 'Forward' : 'Back'} ${label} seconds`}
      style={styles.skipButton}
      onPress={() => onPress(seconds)}
      activeOpacity={0.6}
    >
      <Ionicons name={forward ? 'play-forward' : 'play-back'} size={22} color={colors.textPrimary} />
      <Text style={styles.skipLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ── Styles ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    zIndex: 100,
  },

  /* ── Seek bar ────────────────────────────────────────── */
  seekSection: {
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  seekTrackTouchTarget: {
    height: 36,
    justifyContent: 'center',
  },
  seekTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  seekProgress: {
    position: 'absolute',
    height: '100%',
    borderRadius: 2.5,
    backgroundColor: colors.accent,
  },
  seekThumb: {
    position: 'absolute',
    top: 9,           // vertically center on the 36-high touch target
    width: 16,
    height: 16,
    marginLeft: -8,
    borderRadius: 8,
    backgroundColor: colors.textPrimary,
    borderWidth: 2.5,
    borderColor: colors.accent,
    zIndex: 2,
    // subtle shadow for depth
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  seekThumbGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 165, 116, 0.25)',
  },

  /* ── Time ────────────────────────────────────────────── */
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },

  /* ── Controls ────────────────────────────────────────── */
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  skipButton: {
    width: 46,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipLabel: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: -5,
  },
  speedButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  speedText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  playButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  playIcon: {
    marginLeft: 3,
  },
});
