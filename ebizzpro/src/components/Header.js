import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export default function Header({
  title,
  subtitle,
  showBack,
  showSearch,
  showNotification,
  showAvatar,
  onBack,
  onSearch,
  onNotification,
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="cube" size={16} color={colors.textWhite} />
            </View>
            <Text style={styles.logoText}>eBizz Pro</Text>
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.right}>
        {showSearch && (
          <TouchableOpacity onPress={onSearch} style={styles.iconBtn}>
            <Ionicons name="search" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        {showNotification && (
          <TouchableOpacity onPress={onNotification} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        {showAvatar && (
          <TouchableOpacity onPress={() => setShowProfileMenu(true)} style={styles.avatar} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="person" size={18} color={colors.textWhite} />
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Menu Dropdown */}
      <Modal visible={showProfileMenu} transparent animationType="fade">
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowProfileMenu(false)}>
          <View style={styles.dropdownMenu}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setShowProfileMenu(false); navigation.navigate('Reports'); }}>
              <Ionicons name="bar-chart" size={18} color={colors.textPrimary} />
              <Text style={styles.dropdownText}>Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dropdownItem, { borderBottomWidth: 0 }]} onPress={() => { setShowProfileMenu(false); }}>
              <Ionicons name="log-out" size={18} color={colors.danger} />
              <Text style={[styles.dropdownText, { color: colors.danger }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  titleContainer: {
    marginLeft: spacing.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: { flex: 1, backgroundColor: 'transparent' },
  dropdownMenu: { position: 'absolute', top: Platform.OS === 'ios' ? 100 : 70, right: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.sm, width: 160, ...shadows.lg, elevation: 8 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  dropdownText: { ...typography.bodySemiBold, color: colors.textPrimary },
});
