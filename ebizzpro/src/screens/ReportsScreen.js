import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateReportHTML } from '../utils/invoiceGenerator';

export default function ReportsScreen() {
  const { state, getInvoiceStats, getGstSummary, getTopCustomers } = useApp();
  const [activeTab, setActiveTab] = useState('revenue');

  const invoiceStats = getInvoiceStats();
  const gstSummary = getGstSummary();
  const topCustomers = getTopCustomers();

  const formatCurrency = (amt) => '₹' + Number(amt).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  // Build monthly revenue from real invoice data
  const months = {};
  state.invoices.forEach(inv => {
    const m = new Date(inv.date).toLocaleDateString('en-US', { month: 'short' });
    months[m] = (months[m] || 0) + inv.total;
  });
  const monthlyRevenue = Object.entries(months).map(([month, amount]) => ({ month, amount }));
  const maxRevenue = Math.max(...monthlyRevenue.map(d => d.amount), 1);

  // Category breakdown from items
  const categories = {};
  state.invoices.forEach(inv => {
    inv.items.forEach(item => {
      const cat = item.name;
      categories[cat] = (categories[cat] || 0) + (item.qty * item.price);
    });
  });
  const catTotal = Object.values(categories).reduce((s, v) => s + v, 0) || 1;
  const topCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, amount]) => ({
    name,
    amount,
    percentage: Math.round((amount / catTotal) * 100),
  }));

  const handleDownloadReport = async (reportTitle) => {
    try {
      let tableRows = '';
      if (activeTab === 'revenue') {
        tableRows = state.invoices.map(inv =>
          `<tr><td>${inv.id}</td><td>${inv.customerName}</td><td>${inv.date}</td><td style="text-align:right">${formatCurrency(inv.total)}</td><td>${inv.status}</td></tr>`
        ).join('');
        const data = `<table><thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>${tableRows}<tr class="total"><td colspan="3">Total</td><td style="text-align:right">${formatCurrency(state.invoices.reduce((s, i) => s + i.total, 0))}</td><td></td></tr></tbody></table>`;
        const html = generateReportHTML('Revenue Report', data, state.businessProfile);
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      } else if (activeTab === 'gst') {
        const data = `
          <table><thead><tr><th>Tax Type</th><th style="text-align:right">Amount</th></tr></thead>
          <tbody>
            <tr><td>Total GST Collected</td><td style="text-align:right">${formatCurrency(gstSummary.totalGstCollected)}</td></tr>
            <tr><td>IGST</td><td style="text-align:right">${formatCurrency(gstSummary.igst)}</td></tr>
            <tr><td>CGST</td><td style="text-align:right">${formatCurrency(gstSummary.cgst)}</td></tr>
            <tr><td>SGST</td><td style="text-align:right">${formatCurrency(gstSummary.sgst)}</td></tr>
          </tbody></table>`;
        const html = generateReportHTML('GST Summary Report', data, state.businessProfile);
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      } else {
        tableRows = topCustomers.map((c, i) =>
          `<tr><td>${i + 1}</td><td>${c.name}</td><td>${c.invoices}</td><td style="text-align:right">${formatCurrency(c.revenue)}</td></tr>`
        ).join('');
        const data = `<table><thead><tr><th>#</th><th>Customer</th><th>Invoices</th><th>Revenue</th></tr></thead><tbody>${tableRows}</tbody></table>`;
        const html = generateReportHTML('Customer Report', data, state.businessProfile);
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not generate report');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header showMenu showAvatar />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.sectionLabel}>ANALYTICS</Text>
          <Text style={styles.pageTitle}>Business{'\n'}Reports</Text>
          <Text style={styles.pageSubtitle}>Comprehensive insights into your business performance, GST compliance, and growth metrics.</Text>
        </View>

        {/* Download Report Button */}
        <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.7} onPress={() => handleDownloadReport(activeTab)}>
          <Ionicons name="share-outline" size={16} color={colors.textWhite} />
          <Text style={styles.downloadText}>Share Report PDF</Text>
        </TouchableOpacity>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {['revenue', 'gst', 'customers'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'revenue' ? 'Revenue' : tab === 'gst' ? 'GST' : 'Customers'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Revenue by Month</Text>
              <View style={styles.barChart}>
                {monthlyRevenue.map((item, index) => {
                  const height = Math.max(20, (item.amount / maxRevenue) * 140);
                  const isLast = index === monthlyRevenue.length - 1;
                  return (
                    <View key={item.month} style={styles.barContainer}>
                      <Text style={styles.barAmount}>{formatCurrency(item.amount)}</Text>
                      <LinearGradient colors={isLast ? [colors.accent, colors.gradientEnd] : [colors.borderLight, colors.border]} style={[styles.bar, { height }]} />
                      <Text style={[styles.barLabel, isLast && styles.barLabelActive]}>{item.month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Revenue by Product</Text>
            {topCategories.map((cat, i) => (
              <View key={i} style={styles.categoryCard}>
                <View style={styles.categoryHeader}><Text style={styles.categoryName}>{cat.name}</Text><Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text></View>
                <View style={styles.categoryBarBg}><LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.categoryBarFill, { width: `${cat.percentage}%` }]} /></View>
                <Text style={styles.categoryPercent}>{cat.percentage}%</Text>
              </View>
            ))}
          </>
        )}

        {/* GST Tab */}
        {activeTab === 'gst' && (
          <>
            <View style={styles.gstOverview}><LinearGradient colors={[colors.primaryDark, colors.primaryLight]} style={styles.gstGradient}>
              <Text style={styles.gstOverviewLabel}>TOTAL GST COLLECTED</Text>
              <Text style={styles.gstOverviewAmount}>{formatCurrency(gstSummary.totalGstCollected)}</Text>
              <View style={styles.gstBreakdown}>
                <View><Text style={styles.gstBreakdownLabel}>IGST</Text><Text style={styles.gstBreakdownValue}>{formatCurrency(gstSummary.igst)}</Text></View>
                <View><Text style={styles.gstBreakdownLabel}>CGST</Text><Text style={styles.gstBreakdownValue}>{formatCurrency(gstSummary.cgst)}</Text></View>
                <View><Text style={styles.gstBreakdownLabel}>SGST</Text><Text style={styles.gstBreakdownValue}>{formatCurrency(gstSummary.sgst)}</Text></View>
              </View>
            </LinearGradient></View>

            <Text style={styles.sectionTitle}>Filing Status</Text>
            <View style={styles.filingCard}>
              <View style={styles.filingRow}>
                <View style={styles.filingInfo}><MaterialCommunityIcons name="file-document-check" size={20} color={colors.success} /><Text style={styles.filingLabel}>GSTR-1</Text></View>
                <StatusBadge status="PAID" />
              </View>
              <View style={styles.filingDivider} />
              <View style={styles.filingRow}>
                <View style={styles.filingInfo}><MaterialCommunityIcons name="file-clock" size={20} color="#F59E0B" /><Text style={styles.filingLabel}>GSTR-3B</Text></View>
                <StatusBadge status="PENDING" />
              </View>
            </View>

            <View style={styles.quickActionsCard}>
              <Text style={styles.quickTitle}>Quick Actions</Text>
              <TouchableOpacity style={styles.quickItem} onPress={() => handleDownloadReport('gst')}><Ionicons name="download-outline" size={18} color={colors.accent} /><Text style={styles.quickText}>Download GSTR-1 Report</Text><Ionicons name="chevron-forward" size={16} color={colors.textMuted} /></TouchableOpacity>
              <TouchableOpacity style={styles.quickItem} onPress={() => handleDownloadReport('gst')}><Ionicons name="download-outline" size={18} color={colors.accent} /><Text style={styles.quickText}>Download GSTR-3B Report</Text><Ionicons name="chevron-forward" size={16} color={colors.textMuted} /></TouchableOpacity>
            </View>
          </>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <>
            <Text style={styles.sectionTitle}>Top Customers by Revenue</Text>
            {topCustomers.map((cust, i) => (
              <View key={i} style={styles.customerCard}>
                <View style={styles.customerRank}><Text style={styles.customerRankText}>#{i + 1}</Text></View>
                <View style={styles.customerInfo}><Text style={styles.customerName}>{cust.name}</Text><Text style={styles.customerInvoices}>{cust.invoices} invoices</Text></View>
                <Text style={styles.customerAmount}>{formatCurrency(cust.revenue)}</Text>
              </View>
            ))}

            <View style={styles.insightsCard}><LinearGradient colors={[colors.primaryDark, colors.primaryLight]} style={styles.insightsGradient}>
              <View style={styles.insightsHeader}><Ionicons name="bulb" size={18} color="#F59E0B" /><Text style={styles.insightsLabel}>INSIGHTS</Text></View>
              <Text style={styles.insightsTitle}>Customer Growth</Text>
              <Text style={styles.insightsDesc}>Your top {Math.min(topCustomers.length, 4)} customers contribute {topCustomers.length > 0 ? Math.round((topCustomers.slice(0, 4).reduce((s, c) => s + c.revenue, 0) / Math.max(1, state.invoices.reduce((s, i) => s + i.total, 0))) * 100) : 0}% of your total revenue.</Text>
              <View style={styles.insightsStats}>
                <View style={styles.insightsStat}><Text style={styles.insightsStatValue}>{state.parties.length}</Text><Text style={styles.insightsStatLabel}>Active Clients</Text></View>
                <View style={styles.insightsStat}><Text style={styles.insightsStatValue}>{state.invoices.length}</Text><Text style={styles.insightsStatLabel}>Total Invoices</Text></View>
                <View style={styles.insightsStat}><Text style={styles.insightsStatValue}>{formatCurrency(state.invoices.reduce((s, i) => s + i.total, 0))}</Text><Text style={styles.insightsStatLabel}>Revenue</Text></View>
              </View>
            </LinearGradient></View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge },
  titleSection: { marginBottom: spacing.xl },
  sectionLabel: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  pageTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  pageSubtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: borderRadius.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.xxl },
  downloadText: { ...typography.buttonSmall, color: colors.textWhite },
  tabContainer: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.xs, marginBottom: spacing.xxl, ...shadows.sm },
  tab: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.bodySemiBold, color: colors.textSecondary },
  tabTextActive: { color: colors.textWhite },
  chartCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xxl, marginBottom: spacing.xxl, ...shadows.sm },
  chartTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.xxl },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 200, paddingTop: spacing.xxl },
  barContainer: { alignItems: 'center', flex: 1 },
  barAmount: { fontSize: 8, color: colors.textMuted, marginBottom: 4 },
  bar: { width: 28, borderRadius: 6 },
  barLabel: { fontSize: 10, color: colors.textMuted, marginTop: spacing.sm },
  barLabelActive: { color: colors.accent, fontWeight: '700' },
  sectionTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.lg },
  categoryCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  categoryName: { ...typography.bodySemiBold, color: colors.textPrimary, flex: 1 },
  categoryAmount: { ...typography.bodySemiBold, color: colors.textPrimary },
  categoryBarBg: { height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.xs },
  categoryBarFill: { height: '100%', borderRadius: 4 },
  categoryPercent: { ...typography.label, color: colors.textMuted },
  gstOverview: { borderRadius: borderRadius.xl, overflow: 'hidden', marginBottom: spacing.xxl },
  gstGradient: { padding: spacing.xxl, borderRadius: borderRadius.xl },
  gstOverviewLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  gstOverviewAmount: { fontSize: 34, fontWeight: '800', color: colors.textWhite, marginBottom: spacing.xxl },
  gstBreakdown: { flexDirection: 'row', justifyContent: 'space-between' },
  gstBreakdownLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.xs },
  gstBreakdownValue: { ...typography.metricSmall, color: colors.textWhite },
  filingCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, marginBottom: spacing.xxl, ...shadows.sm },
  filingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  filingInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  filingLabel: { ...typography.bodySemiBold, color: colors.textPrimary },
  filingDivider: { height: 1, backgroundColor: colors.borderLight },
  quickActionsCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, ...shadows.sm, marginBottom: spacing.xxl },
  quickTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.lg },
  quickItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  quickText: { flex: 1, ...typography.bodySemiBold, color: colors.textPrimary, fontSize: 13 },
  customerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm, gap: spacing.md },
  customerRank: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  customerRankText: { fontSize: 12, fontWeight: '700', color: colors.textWhite },
  customerInfo: { flex: 1 },
  customerName: { ...typography.bodySemiBold, color: colors.textPrimary, marginBottom: 2 },
  customerInvoices: { ...typography.label, color: colors.textMuted },
  customerAmount: { ...typography.bodySemiBold, color: colors.textPrimary },
  insightsCard: { borderRadius: borderRadius.xl, overflow: 'hidden', marginTop: spacing.lg },
  insightsGradient: { padding: spacing.xxl, borderRadius: borderRadius.xl },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  insightsLabel: { fontSize: 10, fontWeight: '600', color: '#F59E0B', letterSpacing: 1, textTransform: 'uppercase' },
  insightsTitle: { ...typography.h4, color: colors.textWhite, marginBottom: spacing.sm },
  insightsDesc: { ...typography.bodySmall, color: 'rgba(255,255,255,0.7)', lineHeight: 20, marginBottom: spacing.xxl },
  insightsStats: { flexDirection: 'row', justifyContent: 'space-between' },
  insightsStat: { alignItems: 'center' },
  insightsStatValue: { ...typography.metricSmall, color: colors.textWhite, marginBottom: spacing.xs },
  insightsStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
});
