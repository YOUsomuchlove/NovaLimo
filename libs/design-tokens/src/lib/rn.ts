import { fontSize, fontWeight, motion, radius, spacing } from './scales';
import { darkTheme } from './semantic';

/**
 * React Native theme for `apps/app-driver` (always dark, per app-mobile.pen).
 * Plain object — no react-native import, so this lib stays platform-free.
 */
export const rnTheme = {
  color: darkTheme,
  spacing,
  radius: { ...radius, pill: 999 },
  fontSize,
  /** Expo font family names from `@expo-google-fonts/inter`. */
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  fontWeight,
  motion,
  /** RN has no CSS box-shadow on Android; elevation + iOS shadow props. */
  elevation: {
    e1: {
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    e2: {
      shadowColor: '#000',
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    e3: {
      shadowColor: '#000',
      shadowOpacity: 0.5,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    },
  },
} as const;

export type RnTheme = typeof rnTheme;
