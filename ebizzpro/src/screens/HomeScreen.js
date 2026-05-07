import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

export default function HomeScreen({ navigation }) {
  const { state, getInvoiceStats, getStockStats, getTopCustomers } = useApp();
  const stats = getInvoiceStats();
  const stockStats = getStockStats();
  const topCustomers = getTopCustomers();

  const formatCurrency = (amt) => '₹' + Number(amt).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const recentInvoices = state.invoices.slice(0, 3);
  const colorPool = ['#3B5BDB', '#7C3AED', '#059669', '#D97706', '#DC2626'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header showSearch showAvatar />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.sectionLabel}>OVERVIEW DASHBOARD</Text>
          <Text style={styles.pageTitle}>Financial{'\n'}Performance</Text>
        </View>

        <TouchableOpacity style={styles.newBillBtn} activeOpacity={0.85} onPress={() => navigation.navigate('CreateInvoice', { type: 'B2B' })}>
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.newBillGradient}>
            <Ionicons name="add" size={18} color={colors.textWhite} />
            <Text style={styles.newBillText}>New Bill</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Monthly Revenue */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View style={styles.revenueIconRow}><Ionicons name="trending-up" size={18} color={colors.textSecondary} /><Text style={styles.revenueLabel}>Monthly Revenue</Text></View>
            <View style={styles.changeBadge}><Ionicons name="arrow-up" size={12} color={colors.success} /><Text style={styles.changeText}>+16.2%</Text></View>
          </View>
          <Text style={styles.revenueAmount}>{formatCurrency(stats.monthlyRevenue || 428450)}</Text>
          <View style={styles.progressBg}><LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: '73%' }]} /></View>
          <Text style={styles.progressLabel}>73% of Target</Text>
        </View>

        {/* Today Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { flex: 1 }]}>
            <View style={styles.statIconWrap}><MaterialCommunityIcons name="cash-register" size={20} color={colors.primary} /></View>
            <Text style={styles.statLabel}>Today's Revenue</Text>
            <Text style={styles.statValue}>{formatCurrency(stats.todayRevenue || 34120)}</Text>
          </View>
          <View style={[styles.statCard, { flex: 1 }]}>
            <View style={styles.statIconWrap}><MaterialCommunityIcons name="file-document-outline" size={20} color={colors.primary} /></View>
            <Text style={styles.statLabel}>Today's Bills</Text>
            <Text style={styles.statValue}>{stats.todayBills || state.invoices.length}</Text>
            <View style={styles.busyBadge}><Ionicons name="flame" size={12} color={colors.warning} /><Text style={styles.busyText}>Busy Day</Text></View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Invoices')}><Text style={styles.viewAllText}>View All Invoices →</Text></TouchableOpacity>
        </View>

        {recentInvoices.map((invoice) => (
          <TouchableOpacity key={invoice.id} style={styles.invoiceItem} activeOpacity={0.7} onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: invoice.id })}>
            <View style={styles.invoiceLeft}>
              <View style={styles.invoiceNumber}><Text style={styles.invoiceNumText}>{invoice.id.slice(-3)}</Text></View>
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceCompany}>{invoice.customerName}</Text>
                <Text style={styles.invoiceGst}>{invoice.type === 'B2B' ? 'GST: ' + invoice.gstin : invoice.phone}</Text>
              </View>
            </View>
            <View style={styles.invoiceRight}>
              <Text style={styles.invoiceAmount}>{formatCurrency(invoice.total)}</Text>
              <StatusBadge status={invoice.status} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Stock Alert */}
        {stockStats.lowStockAlerts > 0 && (
          <View style={styles.stockAlert}>
            <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.stockAlertGradient}>
              <View style={styles.stockAlertHeader}><Ionicons name="cube" size={16} color={colors.warning} /><Text style={styles.stockAlertLabel}>STOCK ALERT</Text></View>
              <Text style={styles.stockAlertTitle}>{stockStats.lowStockAlerts} Items Below Threshold</Text>
              <Text style={styles.stockAlertDesc}>{stockStats.lowStockItems[0]?.name} and {Math.max(0, stockStats.lowStockAlerts - 1)} other items need restock.</Text>
              <TouchableOpacity style={styles.manageBtn} onPress={() => navigation.navigate('Stock')}><Text style={styles.manageBtnText}>Manage Inventory</Text></TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Top Customers */}
        <View style={styles.topCustomersSection}>
          <Text style={styles.sectionTitle}>Top Customers</Text>
          {topCustomers.slice(0, 4).map((customer, i) => (
            <View key={i} style={styles.customerRow}>
              <View style={[styles.customerAvatar, { backgroundColor: (colorPool[i] || '#3B5BDB') + '20' }]}>
                <Text style={[styles.customerInitials, { color: colorPool[i] || '#3B5BDB' }]}>{customer.name.substring(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerRevenue}>{formatCurrency(customer.revenue)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge },
  titleSection: { marginBottom: spacing.xl },
  sectionLabel: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  pageTitle: { ...typography.h1, color: colors.textPrimary },
  newBillBtn: { alignSelf: 'flex-start', borderRadius: borderRadius.pill, overflow: 'hidden', marginBottom: spacing.xxl },
  newBillGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: borderRadius.pill, gap: spacing.sm },
  newBillText: { ...typography.buttonSmall, color: colors.textWhite },
  revenueCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xxl, marginBottom: spacing.lg, ...shadows.md },
  revenueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  revenueIconRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  revenueLabel: { ...typography.body, color: colors.textSecondary },
  changeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successLight, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill, gap: 4 },
  changeText: { fontSize: 12, fontWeight: '700', color: colors.success },
  revenueAmount: { ...typography.metricLarge, color: colors.textPrimary, marginBottom: spacing.lg },
  progressBg: { height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.sm },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { ...typography.label, color: colors.textSecondary, textAlign: 'right' },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxl },
  statCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadows.sm },
  statIconWrap: { width: 36, height: 36, borderRadius: borderRadius.sm, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  statLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  statValue: { ...typography.metricMedium, color: colors.textPrimary, marginBottom: spacing.xs },
  busyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  busyText: { ...typography.label, color: colors.warning, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },
  viewAllText: { ...typography.label, color: colors.accent, fontWeight: '600' },
  invoiceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  invoiceLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  invoiceNumber: { backgroundColor: colors.primaryDark, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  invoiceNumText: { fontSize: 11, fontWeight: '700', color: colors.textWhite },
  invoiceInfo: { flex: 1 },
  invoiceCompany: { ...typography.bodySemiBold, color: colors.textPrimary, marginBottom: 2 },
  invoiceGst: { fontSize: 10, color: colors.textMuted },
  invoiceRight: { alignItems: 'flex-end', gap: spacing.sm },
  invoiceAmount: { ...typography.bodySemiBold, color: colors.textPrimary },
  stockAlert: { borderRadius: borderRadius.xl, overflow: 'hidden', marginTop: spacing.lg, marginBottom: spacing.xxl },
  stockAlertGradient: { padding: spacing.xxl, borderRadius: borderRadius.xl },
  stockAlertHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  stockAlertLabel: { fontSize: 10, fontWeight: '600', color: colors.warning, letterSpacing: 1, textTransform: 'uppercase' },
  stockAlertTitle: { ...typography.h4, color: colors.textWhite, marginBottom: spacing.sm },
  stockAlertDesc: { ...typography.bodySmall, color: 'rgba(255,255,255,0.7)', lineHeight: 20, marginBottom: spacing.lg },
  manageBtn: { backgroundColor: colors.textWhite, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center' },
  manageBtnText: { ...typography.buttonSmall, color: colors.primary },
  topCustomersSection: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadows.sm },
  customerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  customerAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  customerInitials: { fontSize: 13, fontWeight: '700' },
  customerName: { flex: 1, ...typography.bodySemiBold, color: colors.textPrimary },
  customerRevenue: { ...typography.bodySemiBold, color: colors.textPrimary },
});
