import 'react-native';
import { jest } from '@jest/globals';

// Mock Track Player
jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn(),
  registerPlaybackService: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(),
  setRate: jest.fn(),
  destroy: jest.fn(),
  useProgress: () => ({ position: 0, duration: 100 }),
  usePlaybackState: () => ({ state: 'paused' }),
}));

// Mock Google Sign-In
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ user: { id: 'test', email: 'test@example.com' } })),
    signOut: jest.fn(() => Promise.resolve()),
    getTokens: jest.fn(() => Promise.resolve({ idToken: 'mockIdToken', accessToken: 'mockAccessToken' })),
    signInSilently: jest.fn(() => Promise.resolve({ user: { id: 'test', email: 'test@example.com' } })),
    hasPreviousSignIn: jest.fn(() => true),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: '12501',
    IN_PROGRESS: '12502',
    PLAY_SERVICES_NOT_AVAILABLE: '12500',
    SIGN_IN_REQUIRED: '4',
  },
  isErrorWithCode: jest.fn(),
  isSuccessResponse: jest.fn(() => true),
}));

// Mock Expo SQLite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(),
  })),
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useSegments: () => ['(main)'],
  Stack: Object.assign(({ children }: any) => children, {
    Screen: ({ children }: any) => children,
  }),
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock Vector Icons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: View,
  };
});
