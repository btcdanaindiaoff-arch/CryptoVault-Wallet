/**
 * OnboardingScreen.tsx — Welcome screen
 * Play Store compliance: NO promises of financial returns, no exchange language.
 */
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Image, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../../navigation/AppNavigator';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'Onboarding'> };

const { height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <LinearGradient colors={[Colors.bg, '#0a1628']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Logo / Hero */}
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>🔐</Text>
        </View>
        <Text style={styles.appName}>CryptoVault</Text>
        <Text style={styles.tagline}>Your keys. Your crypto.</Text>
        <Text style={styles.subtitle}>
          A self-custody wallet — you always control your private keys.
          No account. No signup. 100% on-chain.
        </Text>
      </View>

      {/* Feature bullets */}
      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('CreateWallet')}
          activeOpacity={0.85}>
          <Text style={styles.btnPrimaryText}>Create New Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('ImportWallet')}
          activeOpacity={0.85}>
          <Text style={styles.btnSecondaryText}>I Already Have a Wallet</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        By continuing you agree to our Terms of Service and Privacy Policy.
        This app is a non-custodial wallet. We never store your keys.
      </Text>
    </LinearGradient>
  );
}

const FEATURES = [
  { icon: '🔑', label: 'Self-Custody', desc: 'You own your private keys — always' },
  { icon: '⛓️', label: 'Multi-Chain', desc: 'Ethereum, BNB Chain, Polygon & more' },
  { icon: '🌐', label: 'DApp Browser', desc: 'Connect to any Web3 app securely' },
];

const styles = StyleSheet.create({
  container:      { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl },
  hero:           { alignItems: 'center', marginTop: height * 0.04 },
  logoCircle:     { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  logoText:       { fontSize: 36 },
  appName:        { ...Typography.h1, fontSize: 32, marginBottom: 4 },
  tagline:        { ...Typography.h3, color: Colors.primary, marginBottom: Spacing.sm },
  subtitle:       { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.md },
  features:       { marginTop: Spacing.xl, gap: Spacing.md },
  featureRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.bgCard, padding: Spacing.md, borderRadius: Radius.md },
  featureIcon:    { fontSize: 24 },
  featureLabel:   { ...Typography.body, fontWeight: '600' },
  featureDesc:    { ...Typography.caption, marginTop: 2 },
  actions:        { marginTop: Spacing.xl, gap: Spacing.sm },
  btnPrimary:     { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: Radius.lg, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnSecondary:   { backgroundColor: Colors.bgCard, paddingVertical: 16, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  btnSecondaryText:{ color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  disclaimer:     { marginTop: Spacing.lg, ...Typography.caption, textAlign: 'center', lineHeight: 18, paddingBottom: Spacing.lg },
});