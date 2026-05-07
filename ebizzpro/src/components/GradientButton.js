import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius, spacing } from '../theme';

export default function GradientButton({ title, onPress, icon, style, textStyle, small }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.wrapper, style]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, small && styles.gradientSmall]}
      >
        <View style={styles.content}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, small && styles.textSmall, textStyle]}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientSmall: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    marginRight: spacing.xs,
  },
  text: {
    ...typography.button,
    color: colors.textWhite,
    textAlign: 'center',
  },
  textSmall: {
    ...typography.buttonSmall,
  },
});
