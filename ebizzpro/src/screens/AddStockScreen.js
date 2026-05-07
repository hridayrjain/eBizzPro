import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import GradientButton from '../components/GradientButton';
import { useApp } from '../context/AppContext';

export default function AddStockScreen({ navigation, route }) {
  const { dispatch } = useApp();
  const editItem = route.params?.item;

  const [name, setName] = useState(editItem?.name || '');
  const [sku, setSku] = useState(editItem?.sku || '');
  const [hsn, setHsn] = useState(editItem?.hsn || '');
  const [quantity, setQuantity] = useState(editItem ? String(editItem.quantity) : '');
  const [price, setPrice] = useState(editItem ? String(editItem.price) : '');
  const [gstRate, setGstRate] = useState(editItem ? String(editItem.gstRate) : '18');
  const [gstType, setGstType] = useState(editItem?.gstType || 'IGST');
  const [threshold, setThreshold] = useState(editItem ? String(editItem.lowStockThreshold) : '20');
  const [isInclusive, setIsInclusive] = useState(editItem?.isInclusive || false);

  const handleSave = () => {
    if (!name.trim()) return Alert.alert('Error', 'Product name is required');
    if (!sku.trim()) return Alert.alert('Error', 'SKU is required');
    if (!price || isNaN(price)) return Alert.alert('Error', 'Valid price is required');
    if (!quantity || isNaN(quantity)) return Alert.alert('Error', 'Valid quantity is required');

    const item = { ...(editItem || {}), name: name.trim(), sku: sku.trim(), hsn: hsn.trim(), quantity: parseInt(quantity), price: parseFloat(price), gstRate: parseFloat(gstRate) || 18, gstType, lowStockThreshold: parseInt(threshold) || 20, isInclusive };

    if (editItem) { dispatch({ type: 'UPDATE_STOCK', payload: item }); }
    else { dispatch({ type: 'ADD_STOCK', payload: item }); }
    Alert.alert('Success', editItem ? 'Item updated!' : 'Item added!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  const gstRates = ['0', '5', '12', '18', '28'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{editItem ? 'Edit Stock Item' : 'Add Stock Item'}</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Product Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. ProX Wireless Headphones" placeholderTextColor={colors.textMuted} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}><Text style={styles.label}>SKU Code *</Text><TextInput style={styles.input} value={sku} onChangeText={setSku} placeholder="EB-AUD-001" placeholderTextColor={colors.textMuted} autoCapitalize="characters" /></View>
          <View style={{ flex: 1 }}><Text style={styles.label}>HSN Code</Text><TextInput style={styles.input} value={hsn} onChangeText={setHsn} placeholder="8518" placeholderTextColor={colors.textMuted} keyboardType="numeric" /></View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}><Text style={styles.label}>Quantity *</Text><TextInput style={styles.input} value={quantity} onChangeText={setQuantity} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><Text style={styles.label}>Price (₹) *</Text><TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0.00" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" /></View>
        </View>

        <Text style={styles.label}>GST Rate</Text>
        <View style={styles.gstRow}>
          {gstRates.map(rate => (
            <TouchableOpacity key={rate} style={[styles.gstBtn, gstRate === rate && styles.gstBtnActive]} onPress={() => setGstRate(rate)}>
              <Text style={[styles.gstText, gstRate === rate && styles.gstTextActive]}>{rate}%</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.sm }}>
          <View>
            <Text style={{ ...typography.bodySemiBold, color: colors.textPrimary }}>Pricing is Tax Inclusive?</Text>
            <Text style={{ ...typography.label, color: colors.textMuted }}>If yes, GST will be deducted backward at billing</Text>
          </View>
          <Switch value={isInclusive} onValueChange={setIsInclusive} />
        </View>

        <Text style={styles.label}>GST Type</Text>
        <View style={styles.gstRow}>
          {['IGST', 'CGST/SGST'].map(t => (
            <TouchableOpacity key={t} style={[styles.gstBtn, gstType === t && styles.gstBtnActive, { flex: 1 }]} onPress={() => setGstType(t)}>
              <Text style={[styles.gstText, gstType === t && styles.gstTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Low Stock Threshold</Text>
        <TextInput style={styles.input} value={threshold} onChangeText={setThreshold} placeholder="20" placeholderTextColor={colors.textMuted} keyboardType="numeric" />

        <GradientButton title={editItem ? 'Update Item' : 'Add to Stock'} onPress={handleSave} style={{ marginTop: spacing.xxxl }} icon={<Ionicons name="checkmark" size={20} color={colors.textWhite} />} />

        {editItem && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => {
            Alert.alert('Delete', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { dispatch({ type: 'DELETE_STOCK', payload: editItem.id }); navigation.goBack(); } }]);
          }}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} /><Text style={styles.deleteText}>Delete Item</Text>
          </TouchableOpacity>
        )}
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
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.lg },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, ...typography.body, color: colors.textPrimary, borderWidth: 1, borderColor: colors.borderLight },
  row: { flexDirection: 'row', gap: spacing.md },
  gstRow: { flexDirection: 'row', gap: spacing.sm },
  gstBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  gstBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  gstText: { ...typography.bodySemiBold, color: colors.textSecondary },
  gstTextActive: { color: colors.textWhite },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg, marginTop: spacing.lg },
  deleteText: { ...typography.bodySemiBold, color: colors.danger },
});
