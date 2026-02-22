/**
 * UnlockScreen.tsx — PIN entry to decrypt wallet on app resume
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Vibration, ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../../navigation/AppNavigator';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { loadMnemonic } from '../../core/wallet';
import { useWalletStore } from '../../store/walletStore';

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'Unlock'> };

const PIN_LENGTH = 6;
const PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function UnlockScreen({ navigation }: Props) {
  const [pin, setPin]       = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const setUnlocked = useWalletStore(s => s.setUnlocked);

  const handleKey = async (key: string) => {
    if (loading) return;
    if (key === '⌫') { setPin(p => p.slice(0, -1)); return; }
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      await tryUnlock(next);
    }
  };

  const tryUnlock = async (enteredPin: string) => {
    setLoading(true);
    try {
      await loadMnemonic(enteredPin); // throws if wrong pin
      setUnlocked(true);
      navigation.getParent()?.navigate('Main');
    } catch {
      Vibration.vibrate([0, 80, 80, 80]);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        Alert.alert(
          'Too many attempts',
          'Use your recovery phrase to reset access.',
          [{ text: 'OK' }],
        );
      } else {
        Alert.alert('Wrong PIN', `${5 - newAttempts} attempts remaining`);
      }
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const dots = Array.from({ length: PIN_LENGTH }, (_, i) => i);

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.logoCircle}>
          <Text style={{ fontSize: 36 }}>🔐</Text>
        </View>
        <Text style={styles.appName}>CryptoVault</Text>
      </View>

      <Text style={styles.title}>Enter PIN</Text>

      <View style={styles.dots}>
        {dots.map(i => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
        ))}
      </View>

      {loading && <ActivityIndicator color={Colors.primary} style={{ marginBottom: Spacing.lg }} />}

      <View style={styles.pad}>
        {PAD.map((key, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.key, key === '' && styles.keyEmpty]}
            onPress={() => key && handleKey(key)}
            disabled={!key || loading}
            activeOpacity={0.7}>
            <Text style={[styles.keyText, key === '⌫' && styles.keyDelete]}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('ImportWallet')}
        style={styles.resetLink}>
        <Text style={styles.resetText}>Forgot PIN? Restore with recovery phrase</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center' },
  logoArea:   { alignItems: 'center', marginBottom: Spacing.xl },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  appName:    { ...Typography.h3, color: Colors.textSecondary },
  title:      { ...Typography.h2, marginBottom: Spacing.xl },
  dots:       { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  dot:        { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: Colors.border },
  dotFilled:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pad:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: Spacing.xl, width: '80%' },
  key:        { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center' },
  keyEmpty:   { backgroundColor: 'transparent' },
  keyText:    { ...Typography.h2 },
  keyDelete:  { fontSize: 22 },
  resetLink:  { marginTop: Spacing.md },
  resetText:  { color: Colors.primary, fontSize: 14, textDecorationLine: 'underline' },
});