/**
 * SendScreen.tsx — Send native tokens or ERC-20 tokens across chains
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { CHAINS, ChainKey } from '../../constants/chains';
import { useWalletStore } from '../../store/walletStore';
import { sendNative } from '../../core/wallet';
import { RootStackParams } from '../../navigation/AppNavigator';

type RouteType = RouteProp<RootStackParams, 'Send'>;

const PIN_LENGTH = 6;
const PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function SendScreen() {
  const navigation = useNavigation();
  const route      = useRoute<RouteType>();

  const { meta, activeChain, nativeBalances, addTransaction } = useWalletStore();

  const [toAddress, setToAddress]   = useState('');
  const [amount, setAmount]         = useState('');
  const [selectedChain, setChain]   = useState<ChainKey>(activeChain);
  const [step, setStep]             = useState<'form' | 'pin' | 'sending'>('form');
  const [pin, setPin]               = useState('');
  const [loading, setLoading]       = useState(false);

  const chain   = CHAINS[selectedChain];
  const balance = nativeBalances[selectedChain] ?? '0';

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      Alert.alert('Invalid Address', 'Please enter a valid EVM wallet address.');
      return false;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return false;
    }
    if (Number(amount) > Number(balance)) {
      Alert.alert('Insufficient Balance', `You only have ${parseFloat(balance).toFixed(6)} ${chain.symbol}`);
      return false;
    }
    return true;
  };

  // ── PIN pad handler ─────────────────────────────────────────────────────────
  const handlePinKey = async (key: string) => {
    if (key === '⌫') { setPin(p => p.slice(0, -1)); return; }
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      await executeSend(next);
    }
  };

  // ── Execute transaction ─────────────────────────────────────────────────────
  const executeSend = async (enteredPin: string) => {
    setStep('sending');
    setLoading(true);
    try {
      const tx = await sendNative(toAddress, amount, selectedChain, enteredPin);
      addTransaction({
        hash: tx.hash,
        from: meta!.address,
        to: toAddress,
        value: `${amount} ${chain.symbol}`,
        timestamp: Date.now(),
        status: 'pending',
        type: 'send',
        chainKey: selectedChain,
      });
      Alert.alert(
        '✅ Sent!',
        `Transaction submitted.\nHash: ${tx.hash.slice(0, 20)}…`,
        [{ text: 'Done', onPress: () => navigation.goBack() }],
      );
    } catch (e: any) {
      Alert.alert('Transaction Failed', e.message || 'Unknown error');
      setStep('form');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  // ── PIN confirmation screen ─────────────────────────────────────────────────
  if (step === 'pin' || step === 'sending') {
    return (
      <View style={styles.pinContainer}>
        <TouchableOpacity onPress={() => { setStep('form'); setPin(''); }} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pinTitle}>Confirm with PIN</Text>
        <Text style={styles.pinSubtitle}>
          Sending {amount} {chain.symbol} to{'\n'}{toAddress.slice(0,8)}…{toAddress.slice(-6)}
        </Text>
        <View style={styles.dots}>
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
          ))}
        </View>
        {loading
          ? <ActivityIndicator color={Colors.primary} size="large" style={{ marginVertical: Spacing.xl }} />
          : (
            <View style={styles.pad}>
              {PAD.map((key, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.key, key === '' && styles.keyEmpty]}
                  onPress={() => key && handlePinKey(key)}
                  disabled={!key}
                  activeOpacity={0.7}>
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
      </View>
    );
  }

  // ── Form screen ─────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Chain selector */}
        <Text style={styles.label}>Network</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
          {(['ethereum', 'bsc', 'polygon'] as ChainKey[]).map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.chainPill, selectedChain === key && styles.chainPillActive]}
              onPress={() => setChain(key)}>
              <View style={[styles.chainDot, { backgroundColor: CHAINS[key].iconColor }]} />
              <Text style={[styles.chainPillText, selectedChain === key && { color: Colors.primary }]}>
                {CHAINS[key].name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* To address */}
        <Text style={styles.label}>To Address</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={toAddress}
            onChangeText={setToAddress}
            placeholder="0x..."
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.scanIcon}>
            <Text>📷</Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <Text style={styles.label}>Amount</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={styles.maxBtn}
            onPress={() => setAmount(parseFloat(balance).toFixed(6))}>
            <Text style={styles.maxBtnText}>MAX</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceHint}>
          Available: {parseFloat(balance).toFixed(6)} {chain.symbol}
        </Text>

        {/* Fee estimate */}
        <View style={styles.feeCard}>
          <Text style={styles.feeLabel}>Estimated Gas Fee</Text>
          <Text style={styles.feeValue}>~0.0001 {chain.symbol}</Text>
        </View>

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => { if (validate()) { setStep('pin'); setPin(''); } }}>
          <Text style={styles.sendBtnText}>Review Transaction →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.bg },
  content:         { padding: Spacing.lg, paddingBottom: 40 },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  backText:        { color: Colors.primary, fontSize: 20 },
  headerTitle:     { ...Typography.h3 },
  label:           { ...Typography.label, marginBottom: 6, marginTop: Spacing.md },
  inputRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input:           { backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: 15 },
  scanIcon:        { padding: Spacing.md, backgroundColor: Colors.bgCard, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  maxBtn:          { padding: Spacing.md, backgroundColor: Colors.primary + '22', borderRadius: Radius.md },
  maxBtnText:      { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  balanceHint:     { ...Typography.caption, color: Colors.textMuted, marginTop: 4, marginBottom: Spacing.md },
  chainPill:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bgCard, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
  chainPillActive: { borderColor: Colors.primary },
  chainDot:        { width: 8, height: 8, borderRadius: 4 },
  chainPillText:   { ...Typography.caption, color: Colors.textSecondary },
  feeCard:         { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  feeLabel:        { ...Typography.caption, color: Colors.textSecondary },
  feeValue:        { ...Typography.caption, color: Colors.warning },
  sendBtn:         { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: Radius.lg, alignItems: 'center' },
  sendBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  // PIN styles
  pinContainer:    { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center' },
  back:            { position: 'absolute', top: 56, left: Spacing.lg },
  pinTitle:        { ...Typography.h2, marginBottom: Spacing.sm },
  pinSubtitle:     { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  dots:            { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  dot:             { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: Colors.border },
  dotFilled:       { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pad:             { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, width: '80%' },
  key:             { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center' },
  keyEmpty:        { backgroundColor: 'transparent' },
  keyText:         { ...Typography.h2 },
});
