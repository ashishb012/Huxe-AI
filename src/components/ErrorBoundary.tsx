import React, { ErrorInfo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { GradientButton } from './GradientButton';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Ionicons name="warning" size={64} color={colors.accent} />
            <Text style={styles.title}>Oops! Something went wrong.</Text>
            <Text style={styles.subtitle}>
              We encountered an unexpected error.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.devErrorContainer}>
                <Text style={styles.devErrorText}>{this.state.error.message}</Text>
              </View>
            )}

            <View style={{ marginTop: 32 }}>
              <GradientButton title="Try Again" onPress={this.handleReset} />
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  devErrorContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
  },
  devErrorText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
});
