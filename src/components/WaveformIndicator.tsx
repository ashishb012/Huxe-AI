import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface WaveformIndicatorProps {
  isActive: boolean;
  barCount?: number;
  color?: string;
  size?: number;
}

export function WaveformIndicator({
  isActive,
  barCount = 4,
  color = '#FFFFFF',
  size = 24,
}: WaveformIndicatorProps) {
  const animations = useRef(
    Array.from({ length: barCount }).map(() => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    const startAnimation = () => {
      const createAnimation = (anim: Animated.Value, delay: number, duration: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const runningAnimations = animations.map((anim, index) =>
        createAnimation(anim, index * 100, 300 + Math.random() * 200)
      );

      runningAnimations.forEach((anim) => anim.start());

      return () => {
        runningAnimations.forEach((anim) => anim.stop());
      };
    };

    if (isActive) {
      return startAnimation();
    } else {
      animations.forEach((anim) => {
        anim.stopAnimation();
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isActive, animations]);

  return (
    <View style={[styles.container, { height: size }]}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
  },
  bar: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    marginHorizontal: 1.5,
  },
});
