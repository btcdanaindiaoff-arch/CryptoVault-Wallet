/**
 * ReceiveScreen.tsx — Show QR code + address for receiving crypto
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Share, Alert, ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useWalletStore } from '../../store/walletStore';
import { CHAINS, ChainKey } from '../../constants/chains';

const CHAIN_ORDER: ChainKey[] = ['ethereum', 'bsc', 'polygon'];

export default function ReceiveScreen() {
  const navigation = useNavigation();
  const { meta, activeChain } = useWalletStore();
  const [selectedChain, setSelectedChain] = useState<ChainKey>(activeChain);

  const address = meta?.address ?? '';
  const chain   = CHAINS[selectedChain];

  const copyAddress = () => {
    Clipboard.setString(address);
    Alert.alert('Copied!', 'Wallet address copied to clipboard.');
  };

  const shareAddress = async () => {
    await Share.share({
      message: `My ${chain.name} address:\n${address}`,
      title: 'Share Wallet Address',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Receive</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Network selector */}
      <Text style={styles.label}>Network</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainRow}>
        {CHAIN_ORDER.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.chainPill, selectedChain === key && styles.chainPillActive]}
            onPress={() => setSelectedChain(key)}>
            <View style={[styles.chainDot, { backgroundColor: CHAINS[key].iconColor }]} />
            <Text style={[styles.chainPillText, selectedChain === key && styles.chainPillTextActive]}>
              {CHAINS[key].name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Warning */}
      <View style={styles.warning}>
        <Text style={styles.warningText}>
          ⚠️ Only send {chain.symbol} and {chain.name}-compatible tokens to this address.
          Sending other assets may result in permanent loss.
        </Text>
      </View>

      {/* QR Code */}
      <View style={styles.qrCard}>
        <View style={styles.qrWrapper}>
          {address ? (
            <QRCode
              value={address}
              size={200}
              backgroundColor="white"
              color="black"
            />
          ) : (
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrPlaceholderText}>No wallet loaded</Text>
            </View>
          )}
        </View>

        <View style={[styles.networkBadge, { borderColor: chain.iconColor }]}>
          <View style={[styles.chainDot, { backgroundColor: chain.iconColor }]} />
          <Text style={[styles.networkBadgeText, { color: chain.iconColor }]}>{chain.name}</Text>
        </View>

        <Text style={styles.addressLabel}>Your {chain.name} Address</Text>
        <Text style={styles.addressText} selectable>{address}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={copyAddress}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={shareAddress}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        This is a non-custodial wallet. Only you control your funds.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: Colors.bg },
  content:             { padding: Spacing.lg, paddingBottom: 40, alignItems: 'center' },
  headerRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: Spacing.xl },
  closeText:           { color: Colors.primary, fontSize: 20 },
  title:               { ...Typography.h3 },
  label:               { ...Typography.label, alignSelf: 'flex-start', marginBottom: 8 },
  chainRow:            { width: '100%', marginBottom: Spacing.md },
  chainPill:           { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bgCard, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
  chainPillActive:     { borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  chainDot:            { width: 8, height: 8, borderRadius: 4 },
  chainPillText:       { ...Typography.caption, color: Colors.textSecondary },
  chainPillTextActive: { color: Colors.primary, fontWeight: '600' },
  warning:             { backgroundColor: '#2d1b00', borderWidth: 1, borderColor: Colors.warning, borderRadius: Radius.md, padding: Spacing.md, width: '100%', marginBottom: Spacing.lg },
  warningText:         { ...Typography.caption, color: Colors.warning, lineHeight: 18 },
  qrCard:              { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg },
  qrWrapper:           { backgroundColor: '#fff', padding: 12, borderRadius: Radius.md, marginBottom: Spacing.md },
  qrPlaceholder:       { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
  qrPlaceholderText:   { color: '#999' },
  networkBadge:        { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4, marginBottom: Spacing.md },
  networkBadgeText:    { fontSize: 12, fontWeight: '600' },
  addressLabel:        { ...Typography.caption, color: Colors.textSecondary, marginBottom: 6 },
  addressText:         { ...Typography.caption, fontFamily: 'monospace', color: Colors.textPrimary, textAlign: 'center', lineHeight: 18 },
  actions:             { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.lg },
  actionBtn:           { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border },
  actionIcon:          { fontSize: 24 },
  actionText:          { ...Typography.caption, color: Colors.textSecondary },
  footer:              { ...Typography.caption, color: Colors.textMuted, textAlign: 'center' },
});
