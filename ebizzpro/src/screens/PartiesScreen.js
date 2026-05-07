import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

export default function PartiesScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = state.parties.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.gstin || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const invoiceCount = (partyName) => state.invoices.filter(i => i.customerName === partyName).length;
  const partyRevenue = (partyName) => state.invoices.filter(i => i.customerName === partyName).reduce((s, i) => s + i.total, 0);
  const formatCurrency = (amt) => '₹' + Number(amt).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const handleDelete = (party) => {
    Alert.alert('Delete Party', `Remove ${party.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_PARTY', payload: party.id }) },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header showMenu showAvatar />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Parties &{'\n'}Customers</Text>
          <Text style={styles.pageSubtitle}>Manage your business connections and tax profiles.</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={() => navigation.navigate('AddParty')}>
          <Ionicons name="person-add" size={16} color={colors.textWhite} />
          <Text style={styles.addBtnText}>Add Customer</Text>
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search parties or GSTIN..." placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{state.parties.length}</Text>
            <Text style={styles.statLabel}>Total Parties</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{state.parties.filter(p => p.status === 'ACTIVE').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* Party List */}
        {filtered.map((party) => {
          const count = invoiceCount(party.name);
          const revenue = partyRevenue(party.name);
          return (
            <TouchableOpacity key={party.id} style={styles.partyCard} activeOpacity={0.7} onPress={() => navigation.navigate('AddParty', { party })}>
              <View style={styles.partyHeader}>
                <View style={styles.partyIcon}>
                  <MaterialCommunityIcons name="domain" size={22} color={colors.primary} />
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <StatusBadge status={party.status} />
                  <TouchableOpacity onPress={() => handleDelete(party)}><Ionicons name="trash-outline" size={16} color={colors.danger} /></TouchableOpacity>
                </View>
              </View>
              <Text style={styles.partyName}>{party.name}</Text>
              {party.gstin ? (
                <View style={styles.partyGstinRow}>
                  <Ionicons name="document-text-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.partyGstin}>GSTIN: {party.gstin}</Text>
                </View>
              ) : null}
              {party.phone ? <Text style={styles.partyPhone}>{party.phone}</Text> : null}
              <View style={styles.partyStats}>
                <View style={styles.partyStatBadge}><Ionicons name="receipt-outline" size={12} color={colors.accent} /><Text style={styles.partyStatText}>{count} invoices</Text></View>
                {revenue > 0 && <Text style={styles.partyRevenue}>{formatCurrency(revenue)}</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.empty}><Ionicons name="people-outline" size={48} color={colors.textMuted} /><Text style={styles.emptyText}>No parties found</Text></View>
        )}

        <TouchableOpacity style={styles.addNewBtn} onPress={() => navigation.navigate('AddParty')}>
          <View style={styles.addNewIcon}><Ionicons name="add" size={28} color={colors.textSecondary} /></View>
          <Text style={styles.addNewText}>Add New Party</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge },
  titleSection: { marginBottom: spacing.xl },
  pageTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  pageSubtitle: { ...typography.body, color: colors.textSecondary },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: borderRadius.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignSelf: 'flex-start', marginBottom: spacing.xl, gap: spacing.sm },
  addBtnText: { ...typography.buttonSmall, color: colors.textWhite },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.borderLight },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxl },
  statBox: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', ...shadows.sm },
  statValue: { ...typography.metricMedium, color: colors.textPrimary },
  statLabel: { ...typography.label, color: colors.textSecondary },
  partyCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xl, marginBottom: spacing.md, ...shadows.sm },
  partyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  partyIcon: { width: 48, height: 48, borderRadius: borderRadius.md, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  partyName: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.sm },
  partyGstinRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  partyGstin: { ...typography.label, color: colors.textMuted },
  partyPhone: { ...typography.label, color: colors.textMuted, marginTop: 2 },
  partyStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  partyStatBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill },
  partyStatText: { ...typography.label, color: colors.accent, fontWeight: '600' },
  partyRevenue: { ...typography.bodySemiBold, color: colors.primary },
  empty: { alignItems: 'center', paddingVertical: spacing.huge, gap: spacing.md },
  emptyText: { ...typography.bodySemiBold, color: colors.textMuted },
  addNewBtn: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  addNewIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  addNewText: { ...typography.bodySemiBold, color: colors.textSecondary },
});
