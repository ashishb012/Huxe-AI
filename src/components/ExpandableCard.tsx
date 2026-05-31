import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  tintColor?: string;
  onClose?: () => void;
  gradient?: readonly [string, string, ...string[]];
  isExpanded?: boolean;
}

export function ExpandableCard({
  title,
  subtitle,
  icon,
  children,
  tintColor,
  gradient,
  onClose,
  isExpanded,
}: ExpandableCardProps) {
  const [expanded, setExpanded] = React.useState(isExpanded || false);

  useEffect(() => {
    if (isExpanded !== undefined && isExpanded !== expanded) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(isExpanded);
    }
  }, [isExpanded]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const nextState = !expanded;
    setExpanded(nextState);
    if (!nextState && onClose) onClose();
  };

  return (
    <GlassCard
      tintColor={tintColor}
      gradient={gradient}
      style={styles.card}
      onPress={toggleExpand}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={expanded ? undefined : 1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={expanded ? undefined : 1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {!expanded ? (
          <View style={styles.chevronContainer}>
            <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
          </View>
        ) : (
          <View style={styles.chevronContainer}>
            <Ionicons name="chevron-up" size={20} color={colors.textMuted} />
          </View>
        )}
      </View>

      {expanded && (
        <View style={styles.contentContainer}>
          <View style={styles.divider} />
          <View style={styles.children}>{children}</View>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
    lineHeight: 24,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  children: {
    // Child content styles should be handled by the parent
  },
});
