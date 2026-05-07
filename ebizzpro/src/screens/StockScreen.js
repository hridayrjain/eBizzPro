import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';

export default function StockScreen({ navigation }) {
  const { state, dispatch, getStockStats } = useApp();
  const stats = getStockStats();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = state.stock.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amt) => '₹' + Number(amt).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const getGstBadgeColor = (rate) => {
    if (rate <= 5) return { bg: '#DCFCE7', text: '#16A34A' };
    if (rate <= 12) return { bg: '#DBEAFE', text: '#2563EB' };
    if (rate <= 18) return { bg: '#EEF2FF', text: colors.primary };
    return { bg: '#FEE2E2', text: '#DC2626' };
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Item', `Remove ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_STOCK', payload: item.id }) },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header showMenu showSearch showAvatar />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Stock Ledger</Text>
          <Text style={styles.pageSubtitle}>Manage your warehouse inventory, tax compliance, and real-time asset tracking.</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={() => navigation.navigate('AddStock')}>
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addBtnGradient}>
            <Ionicons name="add" size={18} color={colors.textWhite} />
            <Text style={styles.addBtnText}>Add New Item</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Summary */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}><Text style={styles.summaryLabel}>TOTAL VALUE</Text><Text style={styles.summaryValue}>{formatCurrency(stats.totalValue)}</Text></View>
          <View style={styles.summaryCard}><Text style={styles.summaryLabel}>ACTIVE SKUS</Text><Text style={styles.summaryValue}>{stats.activeSkus}</Text></View>
          <View style={[styles.summaryCard, stats.lowStockAlerts > 0 && { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.summaryLabel}>LOW STOCK</Text>
            <Text style={[styles.summaryValue, stats.lowStockAlerts > 0 && { color: '#F59E0B' }]}>{stats.lowStockAlerts} Items</Text>
          </View>
          <View style={styles.summaryCard}><Text style={styles.summaryLabel}>AVG GST</Text><Text style={styles.summaryValue}>{stats.avgGstRate}%</Text></View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search by SKU, Name..." placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {/* Stock Items */}
        {filtered.map((item) => {
          const gstColor = getGstBadgeColor(item.gstRate);
          const isLow = item.quantity <= item.lowStockThreshold;
          return (
            <TouchableOpacity key={item.id} style={styles.stockItem} activeOpacity={0.7} onPress={() => navigation.navigate('AddStock', { item })}>
              <View style={styles.stockItemHeader}>
                <View style={styles.stockItemIcon}><MaterialCommunityIcons name="package-variant" size={24} color={colors.primary} /></View>
                <View style={styles.stockItemInfo}>
                  <Text style={styles.stockItemName}>{item.name}</Text>
                  <Text style={styles.stockItemSku}>SKU: {item.sku} • HSN: {item.hsn}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={16} color={colors.danger} /></TouchableOpacity>
              </View>

              <View style={styles.stockItemDetails}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>QUANTITY</Text>
                  <View style={styles.quantityRow}>
                    {isLow && <View style={styles.lowBadge}><Text style={styles.lowText}>Low</Text></View>}
                    <Text style={[styles.detailValue, isLow && { color: colors.danger }]}>{item.quantity} Units</Text>
                  </View>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>PRICE</Text>
                  <Text style={styles.detailValue}>{formatCurrency(item.price)}</Text>
                </View>
              </View>

              <View style={styles.gstRow}>
                <Text style={styles.gstLabel}>GST:</Text>
                <View style={[styles.gstBadge, { backgroundColor: gstColor.bg }]}>
                  <Text style={[styles.gstBadgeText, { color: gstColor.text }]}>{item.gstRate}% {item.gstType}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.empty}><Ionicons name="cube-outline" size={48} color={colors.textMuted} /><Text style={styles.emptyText}>No stock items found</Text></View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge },
  titleSection: { marginBottom: spacing.xl },
  pageTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  pageSubtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  addBtn: { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.xxl },
  addBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, borderRadius: borderRadius.lg, gap: spacing.sm },
  addBtnText: { ...typography.buttonSmall, color: colors.textWhite },
  summaryGrid: { gap: spacing.md, marginBottom: spacing.xxl },
  summaryCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadows.sm },
  summaryLabel: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.xs },
  summaryValue: { ...typography.metricMedium, color: colors.textPrimary },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md, marginBottom: spacing.xxl, borderWidth: 1, borderColor: colors.borderLight },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
  stockItem: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  stockItemHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  stockItemIcon: { width: 44, height: 44, borderRadius: borderRadius.md, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  stockItemInfo: { flex: 1 },
  stockItemName: { ...typography.bodySemiBold, color: colors.textPrimary, marginBottom: 2 },
  stockItemSku: { fontSize: 10, color: colors.textMuted },
  stockItemDetails: { flexDirection: 'row', marginBottom: spacing.md },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 9, fontWeight: '600', color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.xs },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  detailValue: { ...typography.bodySemiBold, color: colors.textPrimary },
  lowBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  lowText: { fontSize: 10, fontWeight: '700', color: colors.danger },
  gstRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  gstLabel: { ...typography.label, color: colors.textSecondary, fontWeight: '600' },
  gstBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  gstBadgeText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: spacing.huge, gap: spacing.md },
  emptyText: { ...typography.bodySemiBold, color: colors.textMuted },
});
