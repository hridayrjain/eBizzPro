import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../theme';

const statusConfig = {
  ACTIVE: { bg: colors.successLight, text: colors.success, label: 'ACTIVE' },
  DRAFT: { bg: colors.warningLight, text: colors.warning, label: 'DRAFT' },
  PAID: { bg: colors.successLight, text: colors.success, label: 'PAID' },
  PENDING: { bg: colors.pendingLight, text: colors.pending, label: 'PENDING' },
  FILED: { bg: colors.successLight, text: colors.success, label: 'FILED' },
  'B2B GST': { bg: '#EEF2FF', text: colors.primary, label: 'B2B GST' },
  B2C: { bg: '#F0FDF4', text: colors.success, label: 'B2C' },
};

export default function StatusBadge({ status, style }) {
  const config = statusConfig[status] || statusConfig.ACTIVE;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
