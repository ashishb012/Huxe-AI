import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function NetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkNetwork = async () => {
      const state = await Network.getNetworkStateAsync();
      const connected = state.isConnected ?? true;
      
      if (connected !== isConnected) {
        setIsConnected(connected);
        
        Animated.spring(slideAnim, {
          toValue: connected ? -100 : insets.top,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      }
    };

    checkNetwork();
    interval = setInterval(checkNetwork, 5000);

    return () => clearInterval(interval);
  }, [isConnected, slideAnim, insets.top]);

  if (isConnected && slideAnim.setOffset === undefined) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Ionicons name="cloud-offline" size={20} color="#fff" />
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#D32F2F', // Material Red
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  text: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
});
