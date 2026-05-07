import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import GradientButton from '../components/GradientButton';
import { useApp } from '../context/AppContext';
import { fetchGstinDetails } from '../utils/gstApi';

export default function AddPartyScreen({ navigation, route }) {
  const { dispatch } = useApp();
  const editParty = route.params?.party;

  const [name, setName] = useState(editParty?.name || '');
  const [gstin, setGstin] = useState(editParty?.gstin || '');
  const [phone, setPhone] = useState(editParty?.phone || '');
  const [email, setEmail] = useState(editParty?.email || '');
  const [address, setAddress] = useState(editParty?.address || '');
  const [type, setType] = useState(editParty?.type || 'B2B');
  const [loadingGstin, setLoadingGstin] = useState(false);

  const handleVerifyGstin = async () => {
    if (gstin.trim().length !== 15) {
      return Alert.alert('Error', 'Please enter a valid 15-character GSTIN');
    }
    setLoadingGstin(true);
    const result = await fetchGstinDetails(gstin.trim());
    setLoadingGstin(false);
    
    if (result.success) {
      if (!name) setName(result.data.businessName || result.data.tradeName || '');
      if (!address) setAddress(result.data.address || '');
      Alert.alert('Success', 'GSTIN Verified! Party details auto-filled.');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return Alert.alert('Error', 'Party name is required');
    const party = { ...(editParty || {}), name: name.trim(), gstin: gstin.trim(), phone: phone.trim(), email: email.trim(), address: address.trim(), type, status: 'ACTIVE' };
    if (editParty) { dispatch({ type: 'UPDATE_PARTY', payload: party }); }
    else { dispatch({ type: 'ADD_PARTY', payload: party }); }
    Alert.alert('Success', editParty ? 'Party updated!' : 'Party added!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{editParty ? 'Edit Party' : 'Add New Party'}</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.typeToggle}>
          <TouchableOpacity style={[styles.typeBtn, type === 'B2B' && styles.typeBtnActive]} onPress={() => setType('B2B')}><Text style={[styles.typeText, type === 'B2B' && styles.typeTextActive]}>B2B Business</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, type === 'B2C' && styles.typeBtnActive]} onPress={() => setType('B2C')}><Text style={[styles.typeText, type === 'B2C' && styles.typeTextActive]}>B2C Customer</Text></TouchableOpacity>
        </View>
        <Text style={styles.label}>Business / Customer Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter name" placeholderTextColor={colors.textMuted} />
        
        {type === 'B2B' && (
          <View>
            <Text style={styles.label}>GSTIN</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={gstin} onChangeText={setGstin} placeholder="e.g. 27AAACR5678F1Z5" placeholderTextColor={colors.textMuted} autoCapitalize="characters" maxLength={15} />
              <TouchableOpacity onPress={handleVerifyGstin} disabled={loadingGstin} style={{ backgroundColor: colors.accent, borderRadius: borderRadius.md, justifyContent: 'center', paddingHorizontal: spacing.lg }}>
                {loadingGstin ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={{ color: colors.textWhite, fontWeight: '700' }}>Verify</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" />
        <Text style={styles.label}>Address</Text>
        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={address} onChangeText={setAddress} placeholder="Full address" placeholderTextColor={colors.textMuted} multiline />
        <GradientButton title={editParty ? 'Update Party' : 'Add Party'} onPress={handleSave} style={{ marginTop: spacing.xxxl }} icon={<Ionicons name="checkmark" size={20} color={colors.textWhite} />} />
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
  typeToggle: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.xs, marginBottom: spacing.xxl, ...shadows.sm },
  typeBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  typeBtnActive: { backgroundColor: colors.primary },
  typeText: { ...typography.bodySemiBold, color: colors.textSecondary },
  typeTextActive: { color: colors.textWhite },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.lg },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, ...typography.body, color: colors.textPrimary, borderWidth: 1, borderColor: colors.borderLight },
});
