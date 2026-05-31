/**
 * Huxe AI – Typography Design Tokens
 * Pacifico for display / script titles, Inter for body text.
 * Every style includes fontSize, fontFamily, lineHeight, letterSpacing, and color.
 */

import { TextStyle } from 'react-native';
import { colors } from './colors';

// ── Font family constants ────────────────────────────────────────────────
export const fonts = {
  display: 'Caveat_400Regular',
  displayBold: 'Caveat_700Bold',
  serif: 'PlayfairDisplay_400Regular',
  heading: 'Inter_700Bold',
  headingSemiBold: 'Inter_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  mono: 'SpaceMono-Regular',
  /** System font fallback (safe for all platforms) */
  system: 'System',
} as const;

// ── Type scale ───────────────────────────────────────────────────────────

export interface TypographyStyle {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  letterSpacing: number;
  color: string;
}

export const typography = {
  /** Large decorative / hero titles – Playfair serif */
  hero: {
    fontSize: 48,
    fontFamily: fonts.serif,
    lineHeight: 56,
    letterSpacing: 0,
    color: colors.textPrimary,
  } as TextStyle,

  /** Large decorative script titles – Caveat */
  display: {
    fontSize: 36,
    fontFamily: fonts.display,
    lineHeight: 44,
    letterSpacing: 0.2,
    color: colors.textPrimary,
  } as TextStyle,

  /** Primary headings */
  h1: {
    fontSize: 28,
    fontFamily: fonts.heading,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  } as TextStyle,

  /** Secondary headings */
  h2: {
    fontSize: 22,
    fontFamily: fonts.headingSemiBold,
    lineHeight: 30,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  } as TextStyle,

  /** Tertiary headings / card titles */
  h3: {
    fontSize: 18,
    fontFamily: fonts.headingSemiBold,
    lineHeight: 26,
    letterSpacing: -0.1,
    color: colors.textPrimary,
  } as TextStyle,

  /** Default body copy */
  body: {
    fontSize: 16,
    fontFamily: fonts.body,
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.textSecondary,
  } as TextStyle,

  /** Smaller body copy / supporting text */
  bodySmall: {
    fontSize: 14,
    fontFamily: fonts.body,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: colors.textSecondary,
  } as TextStyle,

  /** Captions, timestamps, metadata */
  caption: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: colors.textMuted,
  } as TextStyle,

  /** Tiny labels, badges, overlines */
  label: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    lineHeight: 14,
    letterSpacing: 0.6,
    color: colors.textMuted,
    textTransform: 'uppercase',
  } as TextStyle,

  // ── Convenience variants ───────────────────────────────────────────────

  /** Bold body text for emphasis */
  bodyBold: {
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.textPrimary,
  } as TextStyle,

  /** Medium-weight body text */
  bodyMedium: {
    fontSize: 16,
    fontFamily: fonts.bodyMedium,
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.textSecondary,
  } as TextStyle,

  /** Accent-colored script text (e.g. branding taglines) */
  displayAccent: {
    fontSize: 36,
    fontFamily: fonts.display,
    lineHeight: 44,
    letterSpacing: 0.2,
    color: colors.accent,
  } as TextStyle,

  /** Section title – script font, slightly smaller */
  sectionTitle: {
    fontSize: 24,
    fontFamily: fonts.display,
    lineHeight: 32,
    letterSpacing: 0.15,
    color: colors.textPrimary,
  } as TextStyle,

  /** Button / CTA text */
  button: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    lineHeight: 22,
    letterSpacing: 0.3,
    color: colors.textOnAccent,
  } as TextStyle,

  /** Small button / chip text */
  buttonSmall: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    lineHeight: 18,
    letterSpacing: 0.2,
    color: colors.textOnAccent,
  } as TextStyle,
} as const;

export type Typography = typeof typography;
export type TypographyVariant = keyof Typography;
