import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert, Modal, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import GradientButton from '../components/GradientButton';
import { useApp } from '../context/AppContext';

export default function CreateInvoiceScreen({ navigation, route }) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const invoiceType = route.params?.type || 'B2B';
  const isB2B = invoiceType === 'B2B';

  const [customerName, setCustomerName] = useState('');
  const [gstin, setGstin] = useState('');
  const [phone, setPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [showStockPicker, setShowStockPicker] = useState(false);
  const [showPartyPicker, setShowPartyPicker] = useState(false);

  const addItem = (stockItem) => {
    const existing = items.find(i => i.stockId === stockItem.id);
    if (existing) {
      setItems(items.map(i => i.stockId === stockItem.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setItems([...items, {
        stockId: stockItem.id,
        name: stockItem.name,
        hsn: stockItem.hsn,
        price: stockItem.price,
        gstRate: stockItem.gstRate,
        qty: 1,
        maxQty: stockItem.quantity,
      }]);
    }
    setShowStockPicker(false);
  };

  const updateItemQty = (idx, qty) => {
    const val = parseInt(qty) || 0;
    setItems(items.map((item, i) => i === idx ? { ...item, qty: Math.min(val, item.maxQty) } : item));
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const selectParty = (party) => {
    setCustomerName(party.name);
    setGstin(party.gstin || '');
    setPhone(party.phone || '');
    setCustomerAddress(party.address || '');
    setShowPartyPicker(false);
  };

  const userGstin = state.businessProfile?.gstin || '';
  const myStateCode = userGstin.substring(0, 2);
  const partyStateCode = gstin.trim().substring(0, 2);
  const isInterState = isB2B && myStateCode && partyStateCode && myStateCode !== partyStateCode;

  let subtotal = 0;
  let gstAmount = 0;

  items.forEach(i => {
    let itemTotalStr = i.qty * i.price;
    if (i.isInclusive) {
      let basePrice = itemTotalStr / (1 + i.gstRate / 100);
      subtotal += basePrice;
      gstAmount += (itemTotalStr - basePrice);
    } else {
      subtotal += itemTotalStr;
      gstAmount += (itemTotalStr * i.gstRate / 100);
    }
  });

  const rawTotal = subtotal + gstAmount;
  const total = Math.round(rawTotal / 5) * 5;
  const roundOffAmount = total - rawTotal;

  const handleCreate = () => {
    if (!customerName.trim()) return Alert.alert('Error', 'Customer name is required');
    if (isB2B && !gstin.trim()) return Alert.alert('Error', 'GSTIN is required for B2B');
    if (!isB2B && !phone.trim()) return Alert.alert('Error', 'Phone number is required for B2C');
    if (items.length === 0) return Alert.alert('Error', 'Add at least one item');

    const invoice = {
      type: invoiceType,
      customerName: customerName.trim(),
      gstin: gstin.trim(),
      phone: phone.trim(),
      customerAddress: customerAddress.trim(),
      items: items.map(i => ({ stockId: i.stockId, name: i.name, hsn: i.hsn, qty: i.qty, price: i.price, gstRate: i.gstRate, isInclusive: i.isInclusive })),
      subtotal,
      gstAmount,
      total,
      roundOffAmount,
      isInterState,
      status: 'PENDING',
      notes,
    };

    dispatch({ type: 'ADD_INVOICE', payload: invoice });
    Alert.alert('Success', `Invoice created successfully!`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const formatCurrency = (amt) => '₹' + Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create {invoiceType} Invoice</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Type Badge */}
        <View style={[styles.typeBadge, isB2B ? styles.typeBadgeB2B : styles.typeBadgeB2C]}>
          <Ionicons name={isB2B ? 'business' : 'person'} size={16} color={isB2B ? colors.primary : colors.success} />
          <Text style={[styles.typeBadgeText, { color: isB2B ? colors.primary : colors.success }]}>
            {isB2B ? 'B2B GST Invoice' : 'B2C Retail Invoice'}
          </Text>
        </View>

        {/* Customer Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <TouchableOpacity onPress={() => setShowPartyPicker(true)} style={styles.selectPartyBtn}>
              <Ionicons name="people" size={14} color={colors.accent} />
              <Text style={styles.selectPartyText}>Select Party</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Customer Name *</Text>
          <TextInput style={styles.input} value={customerName} onChangeText={setCustomerName} placeholder="Enter customer name" placeholderTextColor={colors.textMuted} />

          {isB2B ? (
            <>
              <Text style={styles.label}>GSTIN *</Text>
              <TextInput style={styles.input} value={gstin} onChangeText={setGstin} placeholder="e.g. 27AAACR5678F1Z5" placeholderTextColor={colors.textMuted} autoCapitalize="characters" maxLength={15} />
            </>
          ) : (
            <>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />
            </>
          )}

          <Text style={styles.label}>Address</Text>
          <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top' }]} value={customerAddress} onChangeText={setCustomerAddress} placeholder="Customer address" placeholderTextColor={colors.textMuted} multiline />
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <TouchableOpacity onPress={() => setShowStockPicker(true)} style={styles.addItemBtn}>
              <Ionicons name="add-circle" size={16} color={colors.accent} />
              <Text style={styles.addItemText}>Add from Stock</Text>
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Ionicons name="cube-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>No items added yet</Text>
              <Text style={styles.emptySubtext}>Tap "Add from Stock" to select items</Text>
            </View>
          ) : (
            items.map((item, idx) => (
              <View key={idx} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => removeItem(idx)}>
                    <Ionicons name="close-circle" size={22} color={colors.danger} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemHsn}>HSN: {item.hsn} • GST: {item.gstRate}%</Text>
                <View style={styles.itemRow}>
                  <View style={styles.itemQtyContainer}>
                    <TouchableOpacity onPress={() => updateItemQty(idx, item.qty - 1)} style={styles.qtyBtn}>
                      <Ionicons name="remove" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.qtyInput}
                      value={String(item.qty)}
                      onChangeText={(v) => updateItemQty(idx, v)}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity onPress={() => updateItemQty(idx, item.qty + 1)} style={styles.qtyBtn}>
                      <Ionicons name="add" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyMax}>(max {item.maxQty})</Text>
                  </View>
                  <View style={styles.itemPriceCol}>
                    <Text style={styles.itemPrice}>{formatCurrency(item.price)}/unit</Text>
                    <Text style={styles.itemTotal}>{formatCurrency(item.qty * item.price)}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} value={notes} onChangeText={setNotes} placeholder="Additional notes..." placeholderTextColor={colors.textMuted} multiline />
        </View>

        {/* Summary */}
        {items.length > 0 && (
          <View style={styles.summaryCard}>
            <LinearGradient colors={[colors.primaryDark, colors.primaryLight]} style={styles.summaryGradient}>
              <Text style={styles.summaryTitle}>Invoice Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>GST {isB2B ? (isInterState ? '(IGST)' : '(CGST+SGST)') : ''}</Text>
                <Text style={styles.summaryValue}>{formatCurrency(gstAmount)}</Text>
              </View>
              {Math.abs(roundOffAmount) > 0.001 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Round Off</Text>
                  <Text style={styles.summaryValue}>{roundOffAmount > 0 ? '+' : ''}{formatCurrency(roundOffAmount)}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Grand Total</Text>
                <Text style={styles.summaryTotalValue}>{formatCurrency(total)}</Text>
              </View>
              <Text style={styles.summaryItems}>{items.length} item(s) • {items.reduce((s, i) => s + i.qty, 0)} unit(s)</Text>
            </LinearGradient>
          </View>
        )}

        {/* Create Button */}
        <GradientButton
          title="Generate Invoice"
          onPress={handleCreate}
          icon={<Ionicons name="checkmark-circle" size={20} color={colors.textWhite} />}
          style={styles.createBtn}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Stock Picker Modal */}
      <Modal visible={showStockPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select from Stock</Text>
              <TouchableOpacity onPress={() => setShowStockPicker(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={state.stock.filter(s => s.quantity > 0)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.stockPickerItem} onPress={() => addItem(item)} activeOpacity={0.7}>
                  <View style={styles.stockPickerInfo}>
                    <Text style={styles.stockPickerName}>{item.name}</Text>
                    <Text style={styles.stockPickerDetail}>SKU: {item.sku} • Stock: {item.quantity} • GST: {item.gstRate}%</Text>
                  </View>
                  <Text style={styles.stockPickerPrice}>{formatCurrency(item.price)}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No stock available</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* Party Picker Modal */}
      <Modal visible={showPartyPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Party</Text>
              <TouchableOpacity onPress={() => setShowPartyPicker(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={state.parties}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.stockPickerItem} onPress={() => selectParty(item)} activeOpacity={0.7}>
                  <View style={styles.stockPickerInfo}>
                    <Text style={styles.stockPickerName}>{item.name}</Text>
                    <Text style={styles.stockPickerDetail}>{item.gstin || item.phone}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No parties found</Text>}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.huge, paddingBottom: spacing.md },
  backBtn: { padding: spacing.xs },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  scroll: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge },
  typeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.pill, gap: spacing.sm, marginBottom: spacing.xxl },
  typeBadgeB2B: { backgroundColor: '#EEF2FF' },
  typeBadgeB2C: { backgroundColor: '#DCFCE7' },
  typeBadgeText: { ...typography.bodySemiBold, fontSize: 13 },
  section: { marginBottom: spacing.xxl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },
  selectPartyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectPartyText: { ...typography.label, color: colors.accent, fontWeight: '600' },
  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addItemText: { ...typography.label, color: colors.accent, fontWeight: '600' },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, ...typography.body, color: colors.textPrimary, borderWidth: 1, borderColor: colors.borderLight },
  emptyItems: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyText: { ...typography.bodySemiBold, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  emptySubtext: { ...typography.bodySmall, color: colors.textMuted },
  itemCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  itemName: { ...typography.bodySemiBold, color: colors.textPrimary, flex: 1 },
  itemHsn: { ...typography.label, color: colors.textMuted, marginBottom: spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemQtyContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  qtyInput: { width: 50, height: 35, textAlign: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight, borderRadius: borderRadius.sm, ...typography.bodySemiBold, color: colors.textPrimary },
  qtyMax: { ...typography.label, color: colors.textMuted, fontSize: 10 },
  itemPriceCol: { alignItems: 'flex-end' },
  itemPrice: { ...typography.label, color: colors.textMuted },
  itemTotal: { ...typography.bodySemiBold, color: colors.textPrimary },
  summaryCard: { borderRadius: borderRadius.xl, overflow: 'hidden', marginBottom: spacing.xxl },
  summaryGradient: { padding: spacing.xxl, borderRadius: borderRadius.xl },
  summaryTitle: { ...typography.h4, color: colors.textWhite, marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  summaryLabel: { ...typography.body, color: 'rgba(255,255,255,0.7)' },
  summaryValue: { ...typography.bodySemiBold, color: colors.textWhite },
  summaryTotal: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: spacing.md, marginTop: spacing.sm },
  summaryTotalLabel: { ...typography.h4, color: colors.textWhite },
  summaryTotalValue: { fontSize: 22, fontWeight: '800', color: colors.textWhite },
  summaryItems: { ...typography.label, color: 'rgba(255,255,255,0.5)', marginTop: spacing.sm },
  createBtn: { marginTop: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '70%', padding: spacing.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { ...typography.h4, color: colors.textPrimary },
  stockPickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  stockPickerInfo: { flex: 1 },
  stockPickerName: { ...typography.bodySemiBold, color: colors.textPrimary },
  stockPickerDetail: { ...typography.label, color: colors.textMuted, marginTop: 2 },
  stockPickerPrice: { ...typography.bodySemiBold, color: colors.primary },
});
