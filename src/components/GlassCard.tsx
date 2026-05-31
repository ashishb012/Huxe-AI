import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';

interface GlassCardProps {
  tintColor?: string;
  gradient?: readonly [string, string, ...string[]];
  style?: ViewStyle;
  children: React.ReactNode;
  onPress?: () => void;
  intensity?: number;
  borderRadius?: number;
}

export function GlassCard({
  tintColor,
  gradient,
  style,
  children,
  onPress,
  intensity = 20,
  borderRadius = 20,
}: GlassCardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const CardContent = (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView intensity={intensity} style={StyleSheet.absoluteFill} tint="dark" />
      {gradient ? (
        <LinearGradient
          colors={gradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor || colors.surface }]} />
      )}
      <View style={[styles.border, { borderRadius }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {CardContent}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return CardContent;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
