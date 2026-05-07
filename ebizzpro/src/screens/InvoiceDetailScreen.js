import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { printInvoice, shareInvoice } from '../utils/invoiceGenerator';

export default function InvoiceDetailScreen({ navigation, route }) {
  const { state, dispatch } = useApp();
  const invoice = state.invoices.find(i => i.id === route.params?.invoiceId);

  if (!invoice) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ ...typography.bodySemiBold, color: colors.textMuted }}>Invoice not found</Text>
      </View>
    );
  }

  const isB2B = invoice.type === 'B2B';
  const invoiceDate = new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatCurrency = (amt) => '₹' + Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const handlePrint = async () => {
    try { await printInvoice(invoice, state.businessProfile); } catch (e) { Alert.alert('Error', 'Could not print invoice'); }
  };

  const handleShare = async () => {
    try { await shareInvoice(invoice, state.businessProfile); } catch (e) { Alert.alert('Error', 'Could not share invoice'); }
  };

  const handleMarkPaid = () => {
    Alert.alert('Mark as Paid', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => dispatch({ type: 'UPDATE_INVOICE_STATUS', payload: { id: invoice.id, status: 'PAID' } }) },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.idCard}><LinearGradient colors={[colors.primaryDark, colors.primaryLight]} style={styles.idCardGradient}>
          <View style={styles.idCardTop}>
            <View><Text style={styles.idLabel}>INVOICE</Text><Text style={styles.idNumber}>{invoice.id}</Text></View>
            <View style={styles.idBadges}><StatusBadge status={invoice.type === 'B2B' ? 'B2B GST' : 'B2C'} /><StatusBadge status={invoice.status} /></View>
          </View>
          <View style={styles.idCardBottom}>
            <View><Text style={styles.idMetaLabel}>DATE</Text><Text style={styles.idMetaValue}>{invoiceDate}</Text></View>
            <View style={{ alignItems: 'flex-end' }}><Text style={styles.idMetaLabel}>TOTAL AMOUNT</Text><Text style={styles.idTotalAmount}>{formatCurrency(invoice.total)}</Text></View>
          </View>
        </LinearGradient></View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>BILL TO</Text>
          <Text style={styles.customerName}>{invoice.customerName}</Text>
          {isB2B && <Text style={styles.customerDetail}>GSTIN: {invoice.gstin}</Text>}
          {invoice.phone ? <Text style={styles.customerDetail}>Phone: {invoice.phone}</Text> : null}
          {invoice.customerAddress ? <Text style={styles.customerDetail}>{invoice.customerAddress}</Text> : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>ITEMS ({invoice.items.length})</Text>
          {invoice.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>HSN: {item.hsn} • GST: {item.gstRate}%</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.itemQty}>{item.qty} × {formatCurrency(item.price)}</Text>
                <Text style={styles.itemTotal}>{formatCurrency(item.qty * item.price)}</Text>
              </View>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text></View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>GST</Text><Text style={styles.totalValue}>{formatCurrency(invoice.gstAmount)}</Text></View>
          <View style={[styles.totalRow, styles.grandTotal]}><Text style={styles.grandTotalLabel}>Grand Total</Text><Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text></View>
        </View>

        {invoice.notes ? <View style={styles.sectionCard}><Text style={styles.sectionLabel}>NOTES</Text><Text style={{ ...typography.body, color: colors.textSecondary }}>{invoice.notes}</Text></View> : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={20} color={colors.accent} /><Text style={styles.actionText}>Share PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handlePrint} activeOpacity={0.7}>
            <Ionicons name="print-outline" size={20} color={colors.accent} /><Text style={styles.actionText}>Print</Text>
          </TouchableOpacity>
        </View>

        {invoice.status === 'PENDING' && (
          <TouchableOpacity style={styles.markPaidBtn} onPress={handleMarkPaid} activeOpacity={0.7}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} /><Text style={styles.markPaidText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.huge, paddingBottom: spacing.md },
  backBtn: { padding: spacing.xs },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  scroll: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge },
  idCard: { borderRadius: borderRadius.xl, overflow: 'hidden', marginBottom: spacing.xl },
  idCardGradient: { padding: spacing.xxl },
  idCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xxl },
  idLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.xs },
  idNumber: { fontSize: 24, fontWeight: '800', color: colors.textWhite },
  idBadges: { flexDirection: 'row', gap: spacing.sm },
  idCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  idMetaLabel: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.xs },
  idMetaValue: { ...typography.bodySemiBold, color: colors.textWhite },
  idTotalAmount: { fontSize: 22, fontWeight: '800', color: colors.textWhite },
  sectionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, marginBottom: spacing.lg, ...shadows.sm },
  sectionLabel: { fontSize: 10, fontWeight: '600', color: colors.accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.md },
  customerName: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.xs },
  customerDetail: { ...typography.body, color: colors.textSecondary, marginBottom: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  itemName: { ...typography.bodySemiBold, color: colors.textPrimary },
  itemMeta: { ...typography.label, color: colors.textMuted, marginTop: 2 },
  itemQty: { ...typography.label, color: colors.textMuted },
  itemTotal: { ...typography.bodySemiBold, color: colors.textPrimary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  totalLabel: { ...typography.body, color: colors.textSecondary },
  totalValue: { ...typography.bodySemiBold, color: colors.textPrimary },
  grandTotal: { borderTopWidth: 2, borderTopColor: colors.primary, paddingTop: spacing.md, marginTop: spacing.sm },
  grandTotalLabel: { ...typography.h4, color: colors.textPrimary },
  grandTotalValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingVertical: spacing.lg, gap: spacing.sm, ...shadows.sm, borderWidth: 1, borderColor: colors.accent },
  actionText: { ...typography.buttonSmall, color: colors.accent },
  markPaidBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successLight, borderRadius: borderRadius.lg, paddingVertical: spacing.lg, gap: spacing.sm },
  markPaidText: { ...typography.buttonSmall, color: colors.success },
});
