/**
 * Huxe AI – Color Design Tokens
 * Dark glassmorphism palette with warm amber/gold accents
 * and section-specific tinted surfaces.
 */

export const colors = {
  // ── Base ────────────────────────────────────────────────────────────────
  background: '#0a0a0a',
  backgroundGradient: ['#1a1008', '#0f0a04', '#0a0a0a'] as const,

  // ── Surfaces (glassmorphism) ───────────────────────────────────────────
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceElevated: 'rgba(255, 255, 255, 0.12)',
  surfaceBorder: 'rgba(255, 255, 255, 0.1)',
  surfaceBorderLight: 'rgba(255, 255, 255, 0.15)',

  // ── Text ───────────────────────────────────────────────────────────────
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  textOnAccent: '#FFFFFF',

  // ── Accent (warm amber / gold) ─────────────────────────────────────────
  accent: '#D4A574',
  accentLight: '#E8C9A0',
  accentDark: '#8B6914',
  accentGradient: ['#D4A574', '#C4956A', '#8B6914'] as const,

  // ── Section tints (player cards) ───────────────────────────────────────
  emailTint: 'rgba(180, 100, 100, 0.20)',
  emailGradient: [
    'rgba(180, 100, 100, 0.25)',
    'rgba(140, 70, 70, 0.15)',
  ] as const,

  newsletterTint: 'rgba(80, 120, 60, 0.20)',
  newsletterGradient: [
    'rgba(80, 120, 60, 0.25)',
    'rgba(60, 100, 40, 0.15)',
  ] as const,

  headlinesTint: 'rgba(50, 70, 100, 0.20)',
  headlinesGradient: [
    'rgba(50, 70, 100, 0.25)',
    'rgba(30, 50, 80, 0.15)',
  ] as const,

  interestsTint: 'rgba(100, 70, 40, 0.20)',
  interestsGradient: [
    'rgba(100, 70, 40, 0.25)',
    'rgba(80, 50, 20, 0.15)',
  ] as const,

  // ── Semantic ───────────────────────────────────────────────────────────
  success: '#4CAF50',
  error: '#EF5350',
  warning: '#FFA726',
  info: '#42A5F5',

  // ── Player ─────────────────────────────────────────────────────────────
  playerBackground: 'rgba(20, 15, 10, 0.95)',
  playerSurface: 'rgba(255, 255, 255, 0.06)',
} as const;

// ── Section gradient lookup ──────────────────────────────────────────────
// Keyed by the canonical section name used throughout the app.

export type SectionName = 'email' | 'newsletter' | 'headlines' | 'interests';

export const sectionGradients: Record<SectionName, readonly [string, string]> = {
  email: colors.emailGradient,
  newsletter: colors.newsletterGradient,
  headlines: colors.headlinesGradient,
  interests: colors.interestsGradient,
} as const;

export const sectionTints: Record<SectionName, string> = {
  email: colors.emailTint,
  newsletter: colors.newsletterTint,
  headlines: colors.headlinesTint,
  interests: colors.interestsTint,
} as const;

export type Colors = typeof colors;
