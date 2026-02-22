/**
 * SettingsScreen.tsx — App settings, security, backup, network config
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useWalletStore } from '../../store/walletStore';
import { deleteWallet } from '../../core/wallet';
import { CHAINS, ChainKey } from '../../constants/chains';

const CHAIN_ORDER: ChainKey[] = ['ethereum', 'bsc', 'polygon'];

export default function SettingsScreen() {
  const { meta, activeChain, setActiveChain, setUnlocked, reset } = useWalletStore();
  const [biometrics, setBiometrics] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [testnet, setTestnet] = useState(false);

  const shortAddress = meta?.address
    ? `${meta.address.slice(0, 8)}...${meta.address.slice(-6)}`
    : 'Not connected';

  const handleLock = () => {
    setUnlocked(false);
  };

  const handleWipeWallet = () => {
    Alert.alert(
      '⚠️ Delete Wallet',
      'This will permanently delete your wallet from this device. Make sure you have your recovery phrase backed up. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWallet();
              reset();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  };

  const handleBackupPhrase = () => {
    Alert.alert(
      'View Recovery Phrase',
      'You will need to enter your PIN to reveal your recovery phrase. Never share it with anyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => Alert.alert('PIN Required', 'PIN entry for backup view — implement via UnlockScreen flow.') },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>

      {/* Wallet info */}
      <View style={styles.walletCard}>
        <View style={styles.walletAvatar}>
          <Text style={{ fontSize: 28 }}>👤</Text>
        </View>
        <View style={styles.walletInfo}>
          <Text style={styles.walletLabel}>My Wallet</Text>
          <Text style={styles.walletAddress}>{shortAddress}</Text>
          {meta?.backupVerified
            ? <View style={styles.backupBadge}><Text style={styles.backupBadgeText}>✓ Backup verified</Text></View>
            : <View style={[styles.backupBadge, styles.backupWarning]}><Text style={[styles.backupBadgeText, { color: Colors.warning }]}>⚠ Backup not verified</Text></View>
          }
        </View>
      </View>

      {/* ── Security ── */}
      <Text style={styles.sectionTitle}>Security</Text>
      <View style={styles.section}>
        <SettingRow
          icon="🔑"
          label="Recovery Phrase"
          sublabel="View & back up your secret phrase"
          onPress={handleBackupPhrase}
          showChevron
        />
        <SettingRow
          icon="🔒"
          label="Biometric Unlock"
          sublabel="Use fingerprint or Face ID"
          right={<Switch value={biometrics} onValueChange={setBiometrics} trackColor={{ true: Colors.primary }} thumbColor="#fff" />}
        />
        <SettingRow
          icon="🔐"
          label="Change PIN"
          sublabel="Update your wallet PIN"
          onPress={() => Alert.alert('Change PIN', 'Navigate to PIN change flow.')}
          showChevron
        />
        <SettingRow
          icon="🔴"
          label="Lock Wallet"
          sublabel="Lock the app immediately"
          onPress={handleLock}
          showChevron
          danger
        />
      </View>

      {/* ── Network ── */}
      <Text style={styles.sectionTitle}>Network</Text>
      <View style={styles.section}>
        {CHAIN_ORDER.map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.row}
            onPress={() => setActiveChain(key)}>
            <View style={[styles.chainDot, { backgroundColor: CHAINS[key].iconColor }]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{CHAINS[key].name}</Text>
              <Text style={styles.rowSub}>{CHAINS[key].symbol} · Chain {CHAINS[key].id}</Text>
            </View>
            {activeChain === key && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
        <SettingRow
          icon="🧪"
          label="Show Testnets"
          sublabel="Enable Goerli, BSC Testnet, etc."
          right={<Switch value={testnet} onValueChange={setTestnet} trackColor={{ true: Colors.primary }} thumbColor="#fff" />}
        />
      </View>

      {/* ── Preferences ── */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.section}>
        <SettingRow
          icon="🔔"
          label="Push Notifications"
          sublabel="Transaction alerts"
          right={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: Colors.primary }} thumbColor="#fff" />}
        />
        <SettingRow
          icon="🌐"
          label="Language"
          sublabel="English"
          onPress={() => Alert.alert('Language', 'Language selection coming soon.')}
          showChevron
        />
        <SettingRow
          icon="💱"
          label="Currency"
          sublabel="USD"
          onPress={() => Alert.alert('Currency', 'Currency selection coming soon.')}
          showChevron
        />
      </View>

      {/* ── About ── */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.section}>
        <SettingRow icon="📄" label="Terms of Service" onPress={() => {}} showChevron />
        <SettingRow icon="🔏" label="Privacy Policy" onPress={() => {}} showChevron />
        <SettingRow icon="ℹ️" label="Version" sublabel="1.0.0 (Build 1)" />
        <SettingRow icon="💬" label="Support" sublabel="Get help" onPress={() => {}} showChevron />
      </View>

      {/* Danger zone */}
      <View style={styles.dangerSection}>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleWipeWallet}>
          <Text style={styles.dangerBtnText}>🗑 Delete Wallet from Device</Text>
        </TouchableOpacity>
        <Text style={styles.dangerNote}>
          This removes your wallet from this device only. Your funds remain on-chain.
        </Text>
      </View>
    </ScrollView>
  );
}

// ── Reusable row component ─────────────────────────────────────────────────────
function SettingRow({
  icon, label, sublabel, onPress, showChevron, right, danger,
}: {
  icon: string; label: string; sublabel?: string;
  onPress?: () => void; showChevron?: boolean;
  right?: React.ReactNode; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress && !right} activeOpacity={0.7}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && { color: Colors.danger }]}>{label}</Text>
        {sublabel && <Text style={styles.rowSub}>{sublabel}</Text>}
      </View>
      {right || (showChevron && <Text style={styles.chevron}>›</Text>)}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.bg },
  content:        { padding: Spacing.lg, paddingBottom: 60 },
  pageTitle:      { ...Typography.h2, marginTop: Spacing.lg, marginBottom: Spacing.lg },
  walletCard:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  walletAvatar:   { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.bgInput, justifyContent: 'center', alignItems: 'center' },
  walletInfo:     { flex: 1 },
  walletLabel:    { ...Typography.body, fontWeight: '700' },
  walletAddress:  { ...Typography.caption, fontFamily: 'monospace', color: Colors.textSecondary },
  backupBadge:    { marginTop: 4, alignSelf: 'flex-start', backgroundColor: Colors.success + '22', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  backupWarning:  { backgroundColor: Colors.warning + '22' },
  backupBadgeText:{ fontSize: 11, fontWeight: '600', color: Colors.success },
  sectionTitle:   { ...Typography.label, color: Colors.textMuted, marginBottom: 8, marginTop: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  section:        { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row:            { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowIcon:        { fontSize: 20, width: 28, textAlign: 'center' },
  rowContent:     { flex: 1 },
  rowLabel:       { ...Typography.body },
  rowSub:         { ...Typography.caption, color: Colors.textSecondary, marginTop: 1 },
  chevron:        { color: Colors.textMuted, fontSize: 20 },
  checkmark:      { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  chainDot:       { width: 20, height: 20, borderRadius: 10 },
  dangerSection:  { marginTop: Spacing.sm },
  dangerBtn:      { backgroundColor: Colors.danger + '18', borderWidth: 1, borderColor: Colors.danger, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.sm },
  dangerBtnText:  { color: Colors.danger, fontWeight: '700', fontSize: 15 },
  dangerNote:     { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
