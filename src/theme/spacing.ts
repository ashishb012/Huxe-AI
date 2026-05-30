/**
 * Huxe AI – Spacing, Radius, Shadow & Layout Tokens
 * Consistent spatial rhythm and glassmorphism shadow presets.
 */

import { ViewStyle } from 'react-native';

// ── Spacing scale ────────────────────────────────────────────────────────
export const spacing = {
  /** 4 px – micro padding, icon gaps */
  xs: 4,
  /** 8 px – tight padding, inline gaps */
  sm: 8,
  /** 12 px – default inner padding */
  md: 12,
  /** 16 px – card inner padding, list gaps */
  lg: 16,
  /** 20 px – section inner padding */
  xl: 20,
  /** 24 px – generous padding */
  xxl: 24,
  /** 32 px – section separators */
  xxxl: 32,
  /** 48 px – hero / splash spacing */
  huge: 48,
} as const;

// ── Border radii ─────────────────────────────────────────────────────────
export const borderRadius = {
  /** 8 px – subtle rounding (tags, chips) */
  sm: 8,
  /** 12 px – buttons, small cards */
  md: 12,
  /** 16 px – standard cards */
  lg: 16,
  /** 20 px – prominent cards */
  xl: 20,
  /** 24 px – large cards, modals */
  xxl: 24,
  /** 20 px – alias for the default player card radius */
  card: 20,
  /** 999 px – fully rounded pill buttons */
  pill: 999,
} as const;

// ── Shadow presets (glassmorphism) ───────────────────────────────────────
export const shadows = {
  /** No shadow */
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,

  /** Subtle card shadow */
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  /** Default glass card shadow */
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  /** Elevated card shadow */
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,

  /** Floating modal / sheet shadow */
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,

  /** Warm glow for accent elements */
  glow: {
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,

  /** Subtle inner-glow effect for player cards */
  cardGlow: {
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,
} as const;

// ── Layout helpers ───────────────────────────────────────────────────────
export const layout = {
  /** Horizontal screen edge padding */
  screenPadding: 24,
  /** Vertical gap between cards in a list */
  cardGap: 16,
  /** Vertical gap between major sections */
  sectionGap: 32,
  /** Standard card inner padding */
  cardPadding: 20,
  /** Height of the mini-player bar */
  miniPlayerHeight: 72,
  /** Height of the bottom tab bar */
  tabBarHeight: 64,
  /** Height of the collapsed header */
  headerHeight: 56,
  /** Max content width for tablets / landscape */
  maxContentWidth: 480,
  /** Standard icon size */
  iconSize: 24,
  /** Small icon size */
  iconSizeSm: 20,
  /** Large icon size */
  iconSizeLg: 32,
  /** Avatar / profile image size */
  avatarSize: 40,
  /** Touch target minimum (accessibility) */
  hitSlop: 44,
} as const;

// ── Convenience re-exports ───────────────────────────────────────────────
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Layout = typeof layout;
