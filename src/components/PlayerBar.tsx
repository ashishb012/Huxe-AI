import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

interface PlayerBarProps {
  isPlaying: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  progress?: number;
}

const SPEEDS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4.0];

export function PlayerBar({
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onSpeedChange,
  progress = 0,
}: PlayerBarProps) {
  const insets = useSafeAreaInsets();

  const handleSpeedPress = () => {
    const currentIndex = SPEEDS.indexOf(playbackSpeed);
    const nextIndex = currentIndex === -1 || currentIndex === SPEEDS.length - 1 ? 3 : currentIndex + 1; // Default to 1.0 if not found
    onSpeedChange(SPEEDS[nextIndex]);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      
      {/* Progress Bar (Optional, dummy for now) */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.controlsRow}>
        {/* Speed Control */}
        <TouchableOpacity style={styles.speedButton} onPress={handleSpeedPress}>
          <Text style={styles.speedText}>{playbackSpeed}x</Text>
        </TouchableOpacity>

        {/* Play/Pause Control */}
        <TouchableOpacity style={styles.playButton} onPress={onTogglePlay}>
          <View style={isPlaying ? styles.pauseIcon : styles.playIcon} />
        </TouchableOpacity>

        {/* Empty placeholder to balance layout since Join button was removed */}
        <View style={styles.placeholderButton} />
      </View>
    </View>
  );
}

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
  progressContainer: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  speedButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  speedText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 16,
    borderRightWidth: 0,
    borderBottomWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: colors.background,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    marginLeft: 6, // optical center
  },
  pauseIcon: {
    width: 14,
    height: 18,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.background,
  },
  placeholderButton: {
    width: 48,
    height: 48,
  },
});
