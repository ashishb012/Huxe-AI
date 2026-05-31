import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface TopicChipProps {
  label: string;
  onRemove?: () => void;
  selected?: boolean;
  onPress?: () => void;
}

export function TopicChip({ label, onRemove, selected, onPress }: TopicChipProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const Container = onPress || onRemove ? TouchableOpacity : Animated.View;

  return (
    <Container
      activeOpacity={0.8}
      onPress={onPress || onRemove}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={[
          styles.container,
          selected && styles.selectedContainer,
        ]}
      >
        <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        )}
      </BlurView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  selectedContainer: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.accent,
  },
  text: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  selectedText: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  removeButton: {
    marginLeft: 8,
    padding: 2,
  },
  removeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
