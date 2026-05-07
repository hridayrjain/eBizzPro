import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

export default function InvoicesScreen({ navigation }) {
  const { state, getInvoiceStats } = useApp();
  const stats = getInvoiceStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('ALL');

  const filtered = state.invoices.filter(inv => {
    const matchesSearch = inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || inv.type === filterType;
    return matchesSearch && matchesType;
  });

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const formatCurrency = (amt) => '₹' + Number(amt).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const totalBilled = state.invoices.reduce((s, i) => s + i.total, 0);
  const pendingCount = state.invoices.filter(i => i.status === 'PENDING').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header showMenu showNotification showAvatar />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.sectionLabel}>BILLING ENGINE</Text>
          <Text style={styles.pageTitle}>Invoice Generator</Text>
        </View>

        <TouchableOpacity style={styles.createBtn} activeOpacity={0.85} onPress={() => navigation.navigate('CreateInvoice', { type: 'B2B' })}>
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtnGradient}>
            <Text style={styles.createBtnText}>Create New</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* B2B Card */}
        <View style={styles.billCard}>
          <View style={[styles.billIcon, { backgroundColor: '#EEF2FF' }]}><MaterialCommunityIcons name="file-document-outline" size={28} color={colors.primary} /></View>
          <Text style={styles.billTitle}>B2B Bill</Text>
          <Text style={styles.billDesc}>Create fully GST-compliant invoices for registered businesses with tax breakdown.</Text>
          <View style={styles.billFeatures}>
            <View style={styles.featureRow}><View style={styles.featureDot} /><Text style={styles.featureText}>GSTIN Validation</Text></View>
            <View style={styles.featureRow}><View style={styles.featureDot} /><Text style={styles.featureText}>Multi-tax Support</Text></View>
          </View>
          <TouchableOpacity style={styles.selectFlowBtn} onPress={() => navigation.navigate('CreateInvoice', { type: 'B2B' })} activeOpacity={0.7}>
            <Text style={styles.selectFlowText}>Select B2B Flow</Text>
          </TouchableOpacity>
        </View>

        {/* B2C Card */}
        <View style={styles.billCard}>
          <View style={[styles.billIcon, { backgroundColor: '#F0FDF4' }]}><MaterialCommunityIcons name="account-outline" size={28} color={colors.success} /></View>
          <Text style={styles.billTitle}>B2C Bill</Text>
          <Text style={styles.billDesc}>Fast checkout for retail customers. Requires only name and phone number.</Text>
          <View style={styles.billFeatures}>
            <View style={styles.featureRow}><View style={[styles.featureDot, { backgroundColor: colors.success }]} /><Text style={styles.featureText}>30-sec Generation</Text></View>
            <View style={styles.featureRow}><View style={[styles.featureDot, { backgroundColor: colors.success }]} /><Text style={styles.featureText}>Instant WhatsApp</Text></View>
          </View>
          <TouchableOpacity style={styles.selectFlowBtn} onPress={() => navigation.navigate('CreateInvoice', { type: 'B2C' })} activeOpacity={0.7}>
            <Text style={styles.selectFlowText}>Select B2C Flow</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}><LinearGradient colors={[colors.primaryDark, colors.primaryLight]} style={styles.summaryGradient}>
          <Text style={styles.summaryLabel}>TOTAL BILLED</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalBilled)}</Text>
          <View style={styles.summaryStats}>
            <View><Text style={styles.summaryStatLabel}>INVOICES</Text><Text style={styles.summaryStatValue}>{state.invoices.length}</Text></View>
            <View><Text style={styles.summaryStatLabel}>PENDING</Text><Text style={styles.summaryStatValue}>{pendingCount}</Text></View>
          </View>
        </LinearGradient></View>

        {/* Recent Invoices */}
        <View style={styles.tableSection}>
          <View style={styles.tableHeader}>
            <Text style={styles.sectionTitle}>Recent Invoices</Text>
            <View style={styles.tableActions}>
              <TouchableOpacity style={[styles.tableActionBtn, filterType === 'B2B' && { backgroundColor: '#EEF2FF' }]} onPress={() => setFilterType(filterType === 'B2B' ? 'ALL' : 'B2B')}>
                <Text style={styles.tableActionText}>B2B</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tableActionBtn, filterType === 'B2C' && { backgroundColor: '#DCFCE7' }]} onPress={() => setFilterType(filterType === 'B2C' ? 'ALL' : 'B2C')}>
                <Text style={styles.tableActionText}>B2C</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput style={styles.searchInput} placeholder="Search invoices..." placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
          </View>

          {paginated.map(inv => (
            <TouchableOpacity key={inv.id} style={styles.tableRow} activeOpacity={0.7} onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.invNumber}>{inv.id}</Text>
                <StatusBadge status={inv.type === 'B2B' ? 'B2B GST' : 'B2C'} style={{ marginTop: 4 }} />
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.invEntity}>{inv.customerName}</Text>
                <Text style={styles.invGstin}>{inv.gstin || inv.phone}</Text>
              </View>
              <View style={{ flex: 0.7, alignItems: 'flex-end' }}>
                <Text style={styles.invDate}>{new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
                <StatusBadge status={inv.status} style={{ marginTop: 4 }} />
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.pagination}>
            <Text style={styles.paginationInfo}>Showing {paginated.length} of {filtered.length} invoices</Text>
            <View style={styles.paginationControls}>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(page => (
                <TouchableOpacity key={page} style={[styles.pageBtn, currentPage === page && styles.pageBtnActive]} onPress={() => setCurrentPage(page)}>
                  <Text style={[styles.pageText, currentPage === page && styles.pageTextActive]}>{page}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => navigation.navigate('CreateInvoice', { type: 'B2B' })}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color={colors.textWhite} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xxl, paddingBottom: 100 },
  titleSection: { marginBottom: spacing.lg },
  sectionLabel: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  pageTitle: { ...typography.h2, color: colors.textPrimary },
  createBtn: { borderRadius: borderRadius.pill, overflow: 'hidden', marginBottom: spacing.xxl },
  createBtnGradient: { paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, borderRadius: borderRadius.pill, alignItems: 'center' },
  createBtnText: { ...typography.buttonSmall, color: colors.textWhite },
  billCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xxl, marginBottom: spacing.lg, ...shadows.sm },
  billIcon: { width: 56, height: 56, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  billTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  billDesc: { ...typography.body, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.lg },
  billFeatures: { gap: spacing.sm, marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  featureText: { ...typography.body, color: colors.textPrimary },
  selectFlowBtn: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.lg, paddingVertical: spacing.md, alignItems: 'center' },
  selectFlowText: { ...typography.buttonSmall, color: colors.primary },
  summaryCard: { borderRadius: borderRadius.xl, overflow: 'hidden', marginBottom: spacing.xxl },
  summaryGradient: { padding: spacing.xxl, borderRadius: borderRadius.xl },
  summaryLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  summaryAmount: { fontSize: 34, fontWeight: '800', color: colors.textWhite, marginBottom: spacing.xl },
  summaryStats: { flexDirection: 'row', gap: spacing.xxxl },
  summaryStatLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.xs },
  summaryStatValue: { ...typography.metricMedium, color: colors.textWhite },
  tableSection: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.lg, ...shadows.sm },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },
  tableActions: { flexDirection: 'row', gap: spacing.sm },
  tableActionBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.pill },
  tableActionText: { ...typography.label, color: colors.textSecondary },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md, gap: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
  tableRow: { flexDirection: 'row', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight, alignItems: 'center' },
  invNumber: { ...typography.bodySemiBold, color: colors.textPrimary },
  invEntity: { ...typography.bodySemiBold, color: colors.textPrimary, marginBottom: 2 },
  invGstin: { ...typography.label, color: colors.textMuted, fontSize: 10 },
  invDate: { ...typography.bodySmall, color: colors.textSecondary },
  pagination: { alignItems: 'center', paddingTop: spacing.lg, gap: spacing.md },
  paginationInfo: { ...typography.label, color: colors.textMuted },
  paginationControls: { flexDirection: 'row', gap: spacing.sm },
  pageBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  pageBtnActive: { backgroundColor: colors.primary },
  pageText: { ...typography.bodySemiBold, color: colors.textSecondary, fontSize: 13 },
  pageTextActive: { color: colors.textWhite },
  fab: { position: 'absolute', bottom: spacing.xxl, right: spacing.xxl, borderRadius: 30, overflow: 'hidden', ...shadows.lg },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
