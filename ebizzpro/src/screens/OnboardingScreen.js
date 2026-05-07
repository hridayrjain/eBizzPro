import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import GradientButton from '../components/GradientButton';
import { useApp } from '../context/AppContext';
import { fetchGstinDetails } from '../utils/gstApi';

export default function OnboardingScreen({ navigation }) {
  const { dispatch } = useApp();
  const [gstin, setGstin] = useState('');
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bizData, setBizData] = useState(null);

  const handleFetch = async () => {
    if (gstin.trim().length !== 15) {
      Alert.alert('Error', 'Please enter a complete 15-character GSTIN');
      return;
    }
    setLoading(true);
    const result = await fetchGstinDetails(gstin.trim());
    setLoading(false);
    
    if (result.success) {
      setBizData(result.data);
      setFetched(true);
    } else {
      Alert.alert('Error', result.error);
      setFetched(false);
    }
  };

  const handleConfirm = () => {
    if (bizData) {
      dispatch({ type: 'COMPLETE_ONBOARDING', payload: bizData });
      navigation.replace('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity><Ionicons name="menu" size={24} color={colors.textPrimary} /></TouchableOpacity>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}><Ionicons name="cube" size={14} color={colors.textWhite} /></View>
              <Text style={styles.logoText}>eBizz Pro</Text>
            </View>
            <View style={styles.avatar}><Ionicons name="person" size={16} color={colors.textWhite} /></View>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Architecting Your{'\n'}<Text style={styles.heroHighlight}>Digital Ledger.</Text></Text>
          <Text style={styles.heroSubtitle}>Begin your journey with eBizz Pro by linking your GST identity. Our system uses architectural logic to pre-fill your business parameters.</Text>
        </View>

        <View style={styles.verificationCard}>
          <Text style={styles.verificationLabel}>COMPLIANCE READY</Text>
          <Text style={styles.verificationTitle}>Automated Verification</Text>
          <Text style={styles.verificationDesc}>Once you enter your GSTIN, we fetch authenticated records from the GST portal to ensure 100% precision in your invoicing.</Text>
          <View style={styles.verificationBg}><Ionicons name="shield-checkmark" size={60} color={colors.border} /></View>
        </View>

        <View style={styles.gstinSection}>
          <Text style={styles.sectionLabel}>Enter GSTIN</Text>
          <View style={styles.gstinRow}>
            <TextInput style={styles.gstinInput} placeholder="e.g. 27AAAA..." placeholderTextColor={colors.textMuted} value={gstin} onChangeText={setGstin} autoCapitalize="characters" maxLength={15} />
            <TouchableOpacity onPress={handleFetch} activeOpacity={0.85} disabled={loading}>
              <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.fetchBtn}>
                {loading ? <ActivityIndicator color={colors.textWhite} size="small" /> : (
                  <>
                    <Ionicons name="cloud-download" size={20} color={colors.textWhite} />
                    <Text style={styles.fetchText}>Fetch{'\n'}Data</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.gstinNote}>All business data is retrieved from official GST records.</Text>
        </View>

        {fetched && bizData && (
          <View style={styles.dataSection}>
            <View style={styles.dataCard}><Text style={styles.dataLabel}>LEGAL BUSINESS NAME</Text><Text style={styles.dataValue}>{bizData.businessName}</Text></View>
            <View style={styles.dataCard}><Text style={styles.dataLabel}>REGISTRATION TYPE</Text><Text style={styles.dataValue}>{bizData.registrationType}</Text></View>
            <View style={styles.dataCard}><Text style={styles.dataLabel}>STATE JURISDICTION</Text><Text style={styles.dataValue}>{bizData.state}</Text></View>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>PRINCIPAL PLACE OF BUSINESS</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
                <Ionicons name="location" size={16} color={colors.accent} />
                <Text style={[styles.dataValue, { flex: 1 }]}>{bizData.address}</Text>
              </View>
            </View>
            <GradientButton title="Confirm & Initialize Business Profile" onPress={handleConfirm} icon={<Ionicons name="arrow-forward" size={20} color={colors.textWhite} />} style={{ marginTop: spacing.lg, marginBottom: spacing.lg }} />
            <TouchableOpacity style={{ alignItems: 'center', paddingVertical: spacing.md }} onPress={handleConfirm}>
              <Text style={{ ...typography.bodySemiBold, color: colors.textSecondary }}>Enter Details Manually</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.huge },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.huge, paddingBottom: spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoIcon: { width: 26, height: 26, borderRadius: 7, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  hero: { paddingHorizontal: spacing.xxl, marginBottom: spacing.xxl },
  heroTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  heroHighlight: { color: colors.accent },
  heroSubtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  verificationCard: { marginHorizontal: spacing.xxl, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.xl, marginBottom: spacing.xxl, ...shadows.sm, overflow: 'hidden', position: 'relative' },
  verificationLabel: { fontSize: 10, fontWeight: '600', color: colors.accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  verificationTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.sm },
  verificationDesc: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20, maxWidth: '80%' },
  verificationBg: { position: 'absolute', right: -10, bottom: -10, opacity: 0.15 },
  gstinSection: { paddingHorizontal: spacing.xxl, marginBottom: spacing.xxl },
  sectionLabel: { ...typography.bodySemiBold, color: colors.textPrimary, marginBottom: spacing.md },
  gstinRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  gstinInput: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: borderRadius.md, paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, ...typography.body, color: colors.textPrimary, borderWidth: 1, borderColor: colors.borderLight },
  fetchBtn: { width: 72, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.xs },
  fetchText: { fontSize: 11, fontWeight: '700', color: colors.textWhite, textAlign: 'center' },
  gstinNote: { ...typography.label, color: colors.textMuted, fontStyle: 'italic' },
  dataSection: { paddingHorizontal: spacing.xxl },
  dataCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  dataLabel: { fontSize: 10, fontWeight: '600', color: colors.accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  dataValue: { ...typography.bodySemiBold, color: colors.textPrimary, lineHeight: 22 },
});
