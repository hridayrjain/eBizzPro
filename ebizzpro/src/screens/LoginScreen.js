import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import GradientButton from '../components/GradientButton';
import { useApp } from '../context/AppContext';

export default function LoginScreen({ navigation }) {
  const { dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);

  const handleLogin = () => {
    dispatch({ type: 'LOGIN' });
    navigation.replace('Onboarding');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="cube" size={22} color={colors.textWhite} />
            </View>
            <Text style={styles.logoText}>eBizz Pro</Text>
          </View>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            The Architectural{'\n'}Ledger for{' '}
            <Text style={styles.heroHighlight}>Global{'\n'}Trade.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Precision billing, real-time inventory, and compliance tracking engineered for institutional trust and modern scale.
          </Text>
        </View>

        <View style={styles.featureCards}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#EEF2FF' }]}>
              <MaterialCommunityIcons name="receipt" size={22} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>GST Billing</Text>
              <Text style={styles.featureDesc}>Automated compliance with regional tax jurisdictions and real-time reporting.</Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#EEF2FF' }]}>
              <MaterialCommunityIcons name="clipboard-text" size={22} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Inventory</Text>
              <Text style={styles.featureDesc}>Intelligent stock forecasting and multi-warehouse logistics management.</Text>
            </View>
          </View>
        </View>

        <View style={styles.authSection}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to access your business command center.</Text>

          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.7} onPress={handleLogin}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR EMAIL LOGIN</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.inputLabel}>Work Email</Text>
          <TextInput style={styles.input} placeholder="admin@ebizzpro.com" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <View style={styles.pinHeader}>
            <Text style={styles.inputLabel}>Security Pin</Text>
            <TouchableOpacity activeOpacity={0.7}><Text style={styles.forgotText}>Forgot?</Text></TouchableOpacity>
          </View>
          <View style={styles.pinInputContainer}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="••••••••••" placeholderTextColor={colors.textMuted} value={pin} onChangeText={setPin} secureTextEntry={secureEntry} />
            <TouchableOpacity onPress={() => setSecureEntry(!secureEntry)} style={styles.eyeBtn} activeOpacity={0.7}>
              <Ionicons name={secureEntry ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <GradientButton title="Enter Ledger" onPress={handleLogin} style={{ marginTop: spacing.lg }} />
        </View>

        <View style={styles.securityBadge}>
          <View style={styles.securityIcon}><Ionicons name="shield-checkmark" size={20} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>ENTERPRISE GRADE SECURITY</Text>
            <Text style={styles.securityDesc}>Bank-level 256-bit AES encryption & MFA protocols.</Text>
          </View>
        </View>

        <View style={styles.requestAccess}>
          <Text style={styles.requestText}>Don't have an account yet? </Text>
          <TouchableOpacity activeOpacity={0.7}><Text style={styles.requestLink}>Request Access</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xxl, paddingTop: spacing.huge, paddingBottom: spacing.xxxl },
  logoSection: { marginBottom: spacing.xxxl },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  heroSection: { marginBottom: spacing.xxxl },
  heroTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  heroHighlight: { color: colors.accent },
  heroSubtitle: { ...typography.bodyLarge, color: colors.textSecondary, lineHeight: 24 },
  featureCards: { gap: spacing.md, marginBottom: spacing.huge },
  featureCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadows.sm, gap: spacing.md },
  featureIcon: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  featureContent: { flex: 1 },
  featureTitle: { ...typography.bodySemiBold, color: colors.textPrimary, marginBottom: spacing.xs },
  featureDesc: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 18 },
  authSection: { marginBottom: spacing.xxxl },
  welcomeTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  welcomeSubtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xxl },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingVertical: spacing.lg, ...shadows.sm, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  googleG: { fontSize: 18, fontWeight: '700', color: '#4285F4' },
  googleText: { ...typography.bodySemiBold, color: colors.textPrimary },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xxl, gap: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 10, fontWeight: '600', color: colors.textMuted, letterSpacing: 1 },
  inputLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surfaceAlt, borderRadius: borderRadius.md, paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, ...typography.body, color: colors.textPrimary, borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.lg },
  pinHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  forgotText: { ...typography.label, color: colors.accent, fontWeight: '600' },
  pinInputContainer: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: spacing.lg, padding: spacing.xs },
  securityBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xxl },
  securityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  securityTitle: { fontSize: 10, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.5, marginBottom: 2 },
  securityDesc: { ...typography.label, color: colors.textSecondary },
  requestAccess: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  requestText: { ...typography.body, color: colors.textSecondary },
  requestLink: { ...typography.bodySemiBold, color: colors.accent },
});
