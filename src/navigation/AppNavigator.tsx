/**
 * AppNavigator.tsx — Root navigation tree
 * Stack: Auth (Onboarding/CreateWallet/ImportWallet/SetPin) → Main (Tabs)
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { Colors } from '../constants/theme';
import { useWalletStore } from '../store/walletStore';

// ── Auth Screens ────────────────────────────────────────────────────────────────
import OnboardingScreen   from '../screens/auth/OnboardingScreen';
import CreateWalletScreen from '../screens/auth/CreateWalletScreen';
import ImportWalletScreen from '../screens/auth/ImportWalletScreen';
import SetPinScreen       from '../screens/auth/SetPinScreen';
import UnlockScreen       from '../screens/auth/UnlockScreen';

// ── Main Screens ────────────────────────────────────────────────────────────────
import HomeScreen    from '../screens/main/HomeScreen';
import SendScreen    from '../screens/main/SendScreen';
import ReceiveScreen from '../screens/main/ReceiveScreen';
import SwapScreen    from '../screens/main/SwapScreen';
import DAppScreen    from '../screens/main/DAppScreen';
import NFTScreen     from '../screens/main/NFTScreen';
import StakingScreen from '../screens/main/StakingScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

// ── Types ─────────────────────────────────────────────────────────────────────
export type AuthStackParams = {
  Onboarding: undefined;
  CreateWallet: undefined;
  ImportWallet: undefined;
  SetPin: { mnemonic?: string; privateKey?: string; isNew: boolean };
  Unlock: undefined;
};

export type MainTabParams = {
  Home: undefined;
  Swap: undefined;
  DApp: undefined;
  NFT: undefined;
  Settings: undefined;
};

export type RootStackParams = {
  Auth: undefined;
  Main: undefined;
  Send: { chainKey?: string };
  Receive: undefined;
  Staking: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const MainTab   = createBottomTabNavigator<MainTabParams>();
const RootStack = createNativeStackNavigator<RootStackParams>();

// ── Tab Icon component (simple text icon) ─────────────────────────────────────────
const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ fontSize: 20, color: focused ? Colors.primary : Colors.textMuted }}>
    {label}
  </Text>
);

// ── Bottom Tab Navigator ───────────────────────────────────────────────────────
function MainTabs() {
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}>
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="💼" focused={focused} />, tabBarLabel: 'Wallet' }}
      />
      <MainTab.Screen
        name="Swap"
        component={SwapScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="🔄" focused={focused} />, tabBarLabel: 'Swap' }}
      />
      <MainTab.Screen
        name="DApp"
        component={DAppScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="🌐" focused={focused} />, tabBarLabel: 'Browser' }}
      />
      <MainTab.Screen
        name="NFT"
        component={NFTScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="🖼️" focused={focused} />, tabBarLabel: 'NFTs' }}
      />
      <MainTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="⚙️" focused={focused} />, tabBarLabel: 'Settings' }}
      />
    </MainTab.Navigator>
  );
}

// ── Auth Stack ──────────────────────────────────────────────────────────────────
function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AuthStack.Screen name="Onboarding"   component={OnboardingScreen} />
      <AuthStack.Screen name="CreateWallet" component={CreateWalletScreen} />
      <AuthStack.Screen name="ImportWallet" component={ImportWalletScreen} />
      <AuthStack.Screen name="SetPin"       component={SetPinScreen} />
      <AuthStack.Screen name="Unlock"       component={UnlockScreen} />
    </AuthStack.Navigator>
  );
}

// ── Root Navigator ───────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { meta, isUnlocked, isLoading } = useWalletStore();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Determine initial route
  const hasWallet = !!meta;
  const initialRoute: keyof RootStackParams =
    !hasWallet ? 'Auth' : !isUnlocked ? 'Auth' : 'Main';

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Auth"    component={AuthFlow} />
        <RootStack.Screen name="Main"    component={MainTabs} />
        <RootStack.Screen
          name="Send"
          component={SendScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <RootStack.Screen
          name="Receive"
          component={ReceiveScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <RootStack.Screen
          name="Staking"
          component={StakingScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
});