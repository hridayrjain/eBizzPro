import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import StockScreen from '../screens/StockScreen';
import PartiesScreen from '../screens/PartiesScreen';
import ReportsScreen from '../screens/ReportsScreen';
import CreateInvoiceScreen from '../screens/CreateInvoiceScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';
import AddPartyScreen from '../screens/AddPartyScreen';
import AddStockScreen from '../screens/AddStockScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused, label }) {
  const iconMap = {
    Home: focused ? 'home' : 'home-outline',
    Invoices: focused ? 'receipt' : 'receipt-outline',
    Stock: focused ? 'cube' : 'cube-outline',
    Parties: focused ? 'people' : 'people-outline',
    Reports: focused ? 'bar-chart' : 'bar-chart-outline',
  };

  return (
    <View style={styles.tabIconContainer}>
      {focused && <View style={styles.tabIndicator} />}
      <Ionicons name={iconMap[name]} size={22} color={focused ? colors.tabActive : colors.tabInactive} />
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.tabLabel, { color: focused ? colors.tabActive : colors.tabInactive }, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: [styles.tabBar, { height: (Platform.OS === 'ios' ? 88 : 60) + Math.max(insets.bottom, 8), paddingBottom: Math.max(insets.bottom, 8) }] }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} label="Home" /> }} />
      <Tab.Screen name="Invoices" component={InvoicesScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Invoices" focused={focused} label="Billing" /> }} />
      <Tab.Screen name="Stock" component={StockScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Stock" focused={focused} label="Stock" /> }} />
      <Tab.Screen name="Parties" component={PartiesScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Parties" focused={focused} label="Parties" /> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} />
        <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
        <Stack.Screen name="AddParty" component={AddPartyScreen} />
        <Stack.Screen name="AddStock" component={AddStockScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.sm,
    ...shadows.lg,
    elevation: 20,
  },
  tabIconContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xs },
  tabIndicator: { position: 'absolute', top: -8, width: 20, height: 3, borderRadius: 2, backgroundColor: colors.tabActive },
  tabLabel: { fontSize: 10, fontWeight: '500', marginTop: 4 },
  tabLabelActive: { fontWeight: '700' },
});
