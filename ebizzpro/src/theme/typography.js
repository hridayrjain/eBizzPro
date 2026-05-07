import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  fontFamily,

  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },

  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  bodySemiBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  // Caption / Labels
  caption: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },

  // Numbers / Metrics
  metricLarge: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
  },
  metricMedium: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  metricSmall: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },

  // Buttons
  button: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
};
