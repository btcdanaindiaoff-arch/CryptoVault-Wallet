/**
 * CreateWalletScreen.tsx
 * Generates a 12-word mnemonic, shows it for backup, then routes to SetPin.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../../navigation/AppNavigator';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { generateWallet } from '../../core/wallet';

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'CreateWallet'> };

export default function CreateWalletScreen({ navigation }: Props) {
  const [mnemonic, setMnemonic]   = useState<string[]>([]);
  const [address, setAddress]     = useState('');
  const [revealed, setRevealed]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading]     = useState(true);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const { mnemonic: m, address: a } = await generateWallet();
      setMnemonic(m.split(' '));
      setAddress(a);
    } catch {
      Alert.alert('Error', 'Failed to generate wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { generate(); }, [generate]);

  const copyToClipboard = () => {
    Clipboard.setString(mnemonic.join(' '));
    Alert.alert('Copied', 'Recovery phrase copied. Store it somewhere safe offline.');
  };

  const proceed = () => {
    if (!confirmed) {
      Alert.alert(
        'Have you backed up?',
        'Without your recovery phrase you will permanently lose access to your funds.',
        [
          { text: 'Not yet', style: 'cancel' },
          { text: 'Yes, I saved it', onPress: () => navigation.navigate('SetPin', { mnemonic: mnemonic.join(' '), isNew: true }) },
        ],
      );
      return;
    }
    navigation.navigate('SetPin', { mnemonic: mnemonic.join(' '), isNew: true });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Generating secure wallet…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Recovery Phrase</Text>
      <Text style={styles.subtitle}>
        Write down these 12 words in order and store them somewhere safe.
        Never share them with anyone.
      </Text>

      {/* Warning banner */}
      <View style={styles.warning}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>
          If you lose this phrase, your funds cannot be recovered. Not even by us.
        </Text>
      </View>

      {/* Mnemonic grid */}
      <View style={styles.grid}>
        {mnemonic.map((word, i) => (
          <View key={i} style={[styles.wordCard, revealed ? {} : styles.blurred]}>
            <Text style={styles.wordIndex}>{i + 1}</Text>
            <Text style={styles.word}>{revealed ? word : '•••'}</Text>
          </View>
        ))}
      </View>

      {!revealed && (
        <TouchableOpacity style={styles.revealBtn} onPress={() => setRevealed(true)}>
          <Text style={styles.revealBtnText}>👁 Tap to reveal</Text>
        </TouchableOpacity>
      )}

      {revealed && (
        <>
          <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
            <Text style={styles.copyBtnText}>📋 Copy to clipboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setConfirmed(!confirmed)}>
            <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
              {confirmed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>
              I have written down my recovery phrase
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnPrimary, !confirmed && styles.btnDisabled]}
            onPress={proceed}
            disabled={!confirmed}>
            <Text style={styles.btnPrimaryText}>Continue →</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.bg },
  content:        { padding: Spacing.lg, paddingBottom: 40 },
  center:         { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  loadingText:    { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.md },
  back:           { marginBottom: Spacing.lg },
  backText:       { color: Colors.primary, fontSize: 16 },
  title:          { ...Typography.h2, marginBottom: Spacing.sm },
  subtitle:       { ...Typography.body, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  warning:        { flexDirection: 'row', backgroundColor: '#2d1b00', borderWidth: 1, borderColor: Colors.warning, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.lg },
  warningIcon:    { fontSize: 18 },
  warningText:    { ...Typography.caption, color: Colors.warning, flex: 1, lineHeight: 18 },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  wordCard:       { width: '30%', backgroundColor: Colors.bgCard, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  blurred:        { opacity: 0.3 },
  wordIndex:      { ...Typography.caption, color: Colors.textMuted, marginBottom: 2 },
  word:           { ...Typography.body, fontWeight: '600', fontFamily: 'monospace' },
  revealBtn:      { backgroundColor: Colors.bgCard, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.primary },
  revealBtnText:  { color: Colors.primary, fontWeight: '600', fontSize: 15 },
  copyBtn:        { padding: Spacing.sm, alignItems: 'center', marginBottom: Spacing.lg },
  copyBtnText:    { color: Colors.textSecondary, fontSize: 14 },
  checkRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  checkbox:       { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked:{ backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark:      { color: '#fff', fontWeight: '700', fontSize: 13 },
  checkLabel:     { ...Typography.body, flex: 1 },
  btnPrimary:     { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: Radius.lg, alignItems: 'center' },
  btnDisabled:    { opacity: 0.4 },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});