/**
 * ImportWalletScreen.tsx
 * Import via 12/24-word mnemonic OR private key.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../../navigation/AppNavigator';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { importFromMnemonic, importFromPrivateKey } from '../../core/wallet';

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'ImportWallet'> };

export default function ImportWalletScreen({ navigation }: Props) {
  const [usePrivateKey, setUsePrivateKey] = useState(false);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);

  const handleImport = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter your recovery phrase or private key.');
      return;
    }
    setLoading(true);
    try {
      if (usePrivateKey) {
        await importFromPrivateKey(trimmed);
        navigation.navigate('SetPin', { privateKey: trimmed, isNew: false });
      } else {
        await importFromMnemonic(trimmed);
        navigation.navigate('SetPin', { mnemonic: trimmed, isNew: false });
      }
    } catch (e: any) {
      Alert.alert('Invalid Input', e.message || 'Could not import wallet. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Import Wallet</Text>
      <Text style={styles.subtitle}>
        Enter your recovery phrase or private key to restore your wallet.
      </Text>

      {/* Toggle */}
      <View style={styles.toggle}>
        <Text style={[styles.toggleLabel, !usePrivateKey && styles.toggleActive]}>
          Recovery Phrase
        </Text>
        <Switch
          value={usePrivateKey}
          onValueChange={setUsePrivateKey}
          trackColor={{ false: Colors.primary, true: Colors.bgCard }}
          thumbColor={Colors.textPrimary}
        />
        <Text style={[styles.toggleLabel, usePrivateKey && styles.toggleActive]}>
          Private Key
        </Text>
      </View>

      {/* Security warning */}
      <View style={styles.warning}>
        <Text style={styles.warningText}>
          🔒 Never share your {usePrivateKey ? 'private key' : 'recovery phrase'} with anyone.
          Enter it only in trusted apps.
        </Text>
      </View>

      {/* Input */}
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder={
          usePrivateKey
            ? 'Enter private key (0x...)'
            : 'Enter 12 or 24 words separated by spaces'
        }
        placeholderTextColor={Colors.textMuted}
        multiline={!usePrivateKey}
        numberOfLines={usePrivateKey ? 1 : 5}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={usePrivateKey}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleImport}
        disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Import Wallet</Text>
        }
      </TouchableOpacity>

      <Text style={styles.note}>
        Your keys are stored locally on this device only, encrypted with your PIN.
        We have zero access to your funds.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg },
  content:     { padding: Spacing.lg, paddingBottom: 40 },
  back:        { marginBottom: Spacing.lg },
  backText:    { color: Colors.primary, fontSize: 16 },
  title:       { ...Typography.h2, marginBottom: Spacing.sm },
  subtitle:    { ...Typography.body, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  toggle:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, justifyContent: 'center', marginBottom: Spacing.lg, backgroundColor: Colors.bgCard, padding: Spacing.md, borderRadius: Radius.md },
  toggleLabel: { ...Typography.body, color: Colors.textSecondary },
  toggleActive:{ color: Colors.primary, fontWeight: '700' },
  warning:     { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  warningText: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 18 },
  input:       { backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: 15, minHeight: 100, marginBottom: Spacing.lg, fontFamily: 'monospace' },
  btn:         { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: Radius.lg, alignItems: 'center', marginBottom: Spacing.lg },
  btnDisabled: { opacity: 0.5 },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  note:        { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});