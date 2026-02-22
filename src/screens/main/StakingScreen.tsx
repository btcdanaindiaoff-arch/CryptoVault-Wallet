/**
 * StakingScreen.tsx — Staking / Earn screen
 * Shows native staking options for ETH, BNB, MATIC.
 * Play Store compliant: described as "network validation rewards", not investment returns.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useWalletStore } from '../../store/walletStore';
import { CHAINS } from '../../constants/chains';

interface StakingOption {
  chainKey: string;
  protocol: string;
  apy: string;
  minStake: string;
  lockPeriod: string;
  symbol: string;
  description: string;
  risk: 'Low' | 'Medium' | 'High';
}

const STAKING_OPTIONS: StakingOption[] = [
  {
    chainKey: 'ethereum', protocol: 'Lido Finance', apy: '3.8%',
    minStake: '0.01 ETH', lockPeriod: 'Flexible (stETH)',
    symbol: 'ETH', description: 'Liquid staking for Ethereum. Receive stETH tokens representing your staked ETH.',
    risk: 'Low',
  },
  {
    chainKey: 'ethereum', protocol: 'Rocket Pool', apy: '3.5%',
    minStake: '0.01 ETH', lockPeriod: 'Flexible (rETH)',
    symbol: 'ETH', description: 'Decentralized ETH staking protocol with rETH liquid token.',
    risk: 'Low',
  },
  {
    chainKey: 'bsc', protocol: 'PancakeSwap', apy: '12.4%',
    minStake: '1 BNB', lockPeriod: 'Flexible',
    symbol: 'BNB', description: 'Stake BNB in PancakeSwap pools to earn CAKE rewards.',
    risk: 'Medium',
  },
  {
    chainKey: 'bsc', protocol: 'BNB Beacon Chain', apy: '5.2%',
    minStake: '1 BNB', lockPeriod: '7 days',
    symbol: 'BNB', description: 'Native BNB staking on Beacon Chain for network validation.',
    risk: 'Low',
  },
  {
    chainKey: 'polygon', protocol: 'Polygon Staking', apy: '6.1%',
    minStake: '1 MATIC', lockPeriod: 'Unbonding: ~3 days',
    symbol: 'MATIC', description: 'Delegate MATIC to validators to earn staking rewards.',
    risk: 'Low',
  },
];

const RISK_COLOR: Record<string, string> = {
  Low: Colors.success,
  Medium: Colors.warning,
  High: Colors.danger,
};

const CHAIN_ICON: Record<string, string> = {
  ethereum: '⟠', bsc: '🔶', polygon: '🟣',
};

export default function StakingScreen() {
  const navigation = useNavigation();
  const { nativeBalances } = useWalletStore();
  const [selectedProtocol, setSelected] = useState<StakingOption | null>(null);
  const [stakeAmount, setStakeAmount]   = useState('');
  const [activeChain, setActiveChain]   = useState<string>('all');

  const filtered = activeChain === 'all'
    ? STAKING_OPTIONS
    : STAKING_OPTIONS.filter(o => o.chainKey === activeChain);

  const handleStake = () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) {
      Alert.alert('Enter Amount', 'Please enter a valid staking amount.');
      return;
    }
    Alert.alert(
      'Confirm Stake',
      `Stake ${stakeAmount} ${selectedProtocol?.symbol} on ${selectedProtocol?.protocol}?\n\nLock period: ${selectedProtocol?.lockPeriod}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stake',
          onPress: () => {
            Alert.alert('Coming Soon', 'Live staking requires smart contract integration with the selected protocol.');
            setSelected(null);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Earn / Stake</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Earn network validation rewards by delegating your crypto to validators.
            APY rates vary and are not guaranteed.
          </Text>
        </View>

        {/* Chain filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {[{ key: 'all', label: 'All Chains' }, { key: 'ethereum', label: '⟠ ETH' }, { key: 'bsc', label: '🔶 BNB' }, { key: 'polygon', label: '🟣 MATIC' }].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterPill, activeChain === f.key && styles.filterPillActive]}
              onPress={() => setActiveChain(f.key)}>
              <Text style={[styles.filterText, activeChain === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Staking cards */}
        {filtered.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.stakingCard}
            onPress={() => { setSelected(option); setStakeAmount(''); }}
            activeOpacity={0.85}>
            <View style={styles.cardHeader}>
              <View style={styles.cardLeft}>
                <Text style={styles.chainIcon}>{CHAIN_ICON[option.chainKey]}</Text>
                <View>
                  <Text style={styles.protocolName}>{option.protocol}</Text>
                  <Text style={styles.chainName}>{CHAINS[option.chainKey]?.name}</Text>
                </View>
              </View>
              <View style={styles.apyBadge}>
                <Text style={styles.apyValue}>{option.apy}</Text>
                <Text style={styles.apyLabel}>APY</Text>
              </View>
            </View>

            <Text style={styles.cardDesc} numberOfLines={2}>{option.description}</Text>

            <View style={styles.cardFooter}>
              <View style={styles.cardMeta}>
                <Text style={styles.metaLabel}>Min Stake</Text>
                <Text style={styles.metaValue}>{option.minStake}</Text>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.metaLabel}>Lock Period</Text>
                <Text style={styles.metaValue}>{option.lockPeriod}</Text>
              </View>
              <View style={[styles.riskBadge, { borderColor: RISK_COLOR[option.risk] }]}>
                <Text style={[styles.riskText, { color: RISK_COLOR[option.risk] }]}>{option.risk} Risk</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.disclaimer}>
          Staking involves risk. APY rates are estimates based on current network conditions and may change.
          This is not financial advice.
        </Text>
      </ScrollView>

      {/* Stake Modal */}
      <Modal visible={!!selectedProtocol} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Stake {selectedProtocol?.symbol}</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalProtocol}>{selectedProtocol?.protocol}</Text>

            <View style={styles.modalStats}>
              <View style={styles.modalStat}>
                <Text style={styles.statLabel}>APY</Text>
                <Text style={[styles.statValue, { color: Colors.success }]}>{selectedProtocol?.apy}</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.statLabel}>Lock Period</Text>
                <Text style={styles.statValue}>{selectedProtocol?.lockPeriod}</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.statLabel}>Minimum</Text>
                <Text style={styles.statValue}>{selectedProtocol?.minStake}</Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Amount to Stake ({selectedProtocol?.symbol})</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={stakeAmount}
                onChangeText={setStakeAmount}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={styles.maxBtn}
                onPress={() => setStakeAmount(nativeBalances[selectedProtocol?.chainKey as string] ?? '0')}>
                <Text style={styles.maxBtnText}>MAX</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.stakeBtn} onPress={handleStake}>
              <Text style={styles.stakeBtnText}>Stake Now</Text>
            </TouchableOpacity>

            <Text style={styles.modalDisclaimer}>
              APY is variable. Past performance does not guarantee future results.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.bg },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md },
  backText:        { color: Colors.primary, fontSize: 16 },
  title:           { ...Typography.h3 },
  content:         { padding: Spacing.lg, paddingBottom: 40 },
  infoBanner:      { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.primary + '18', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '44' },
  infoIcon:        { fontSize: 18 },
  infoText:        { ...Typography.caption, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  filterRow:       { maxHeight: 44, marginBottom: Spacing.lg },
  filterPill:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  filterPillActive:{ borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  filterText:      { ...Typography.caption, color: Colors.textSecondary },
  filterTextActive:{ color: Colors.primary, fontWeight: '600' },
  stakingCard:     { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardLeft:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chainIcon:       { fontSize: 28 },
  protocolName:    { ...Typography.body, fontWeight: '700' },
  chainName:       { ...Typography.caption, color: Colors.textSecondary },
  apyBadge:        { alignItems: 'center', backgroundColor: Colors.success + '22', borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  apyValue:        { fontSize: 18, fontWeight: '800', color: Colors.success },
  apyLabel:        { fontSize: 10, color: Colors.success },
  cardDesc:        { ...Typography.caption, color: Colors.textSecondary, lineHeight: 18, marginBottom: Spacing.sm },
  cardFooter:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  cardMeta:        { flex: 1 },
  metaLabel:       { fontSize: 10, color: Colors.textMuted },
  metaValue:       { ...Typography.caption, fontWeight: '600' },
  riskBadge:       { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  riskText:        { fontSize: 10, fontWeight: '600' },
  disclaimer:      { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', lineHeight: 18, marginTop: Spacing.lg },
  // Modal
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard:       { backgroundColor: Colors.bgCard, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, paddingBottom: 40 },
  modalHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle:      { ...Typography.h3 },
  modalClose:      { color: Colors.textSecondary, fontSize: 18, padding: 4 },
  modalProtocol:   { ...Typography.label, color: Colors.primary, marginBottom: Spacing.lg },
  modalStats:      { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.bgInput, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  modalStat:       { alignItems: 'center' },
  statLabel:       { ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 },
  statValue:       { ...Typography.body, fontWeight: '700' },
  inputLabel:      { ...Typography.label, marginBottom: 6 },
  inputRow:        { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg },
  input:           { flex: 1, backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, color: Colors.textPrimary, fontSize: 16 },
  maxBtn:          { backgroundColor: Colors.primary + '22', borderRadius: Radius.md, paddingHorizontal: Spacing.md, justifyContent: 'center' },
  maxBtnText:      { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  stakeBtn:        { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center', marginBottom: Spacing.sm },
  stakeBtnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalDisclaimer: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center' },
});
