import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export default function StatCard({ label, value, suffix, icon, highlight, highlightColor, style }) {
  const bgColor = highlight ? (highlightColor || colors.warningLight) : colors.surface;
  const textColor = highlight ? colors.textPrimary : colors.textPrimary;

  return (
    <View style={[styles.card, { backgroundColor: bgColor }, style]}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: textColor }]}>{value}</Text>
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  iconWrap: {
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  value: {
    ...typography.metricMedium,
  },
  suffix: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
