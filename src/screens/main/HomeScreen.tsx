/**
 * HomeScreen.tsx — Wallet dashboard: balance, assets, quick actions, tx history
 */
import React, { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useWalletStore } from '../../store/walletStore';
import { CHAINS, ChainKey } from '../../constants/chains';
import { RootStackParams } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParams>;

const CHAIN_ORDER: ChainKey[] = ['ethereum', 'bsc', 'polygon'];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const {
    meta, activeChain, nativeBalances, assets,
    totalUsdValue, transactions, isLoading,
    setActiveChain, refreshBalances,
  } = useWalletStore();

  useEffect(() => { refreshBalances(); }, []);

  const shortAddress = meta?.address
    ? `${meta.address.slice(0, 6)}...${meta.address.slice(-4)}`
    : '';

  const activeBalance = nativeBalances[activeChain] ?? '0.00';
  const chain = CHAINS[activeChain];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>My Wallet</Text>
          <Text style={styles.address}>{shortAddress}</Text>
        </View>
        <TouchableOpacity style={styles.scanBtn}>
          <Text style={{ fontSize: 22 }}>📷</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshBalances} tintColor={Colors.primary} />
        }>

        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          <Text style={styles.usdLabel}>Total Balance</Text>
          <Text style={styles.usdValue}>${totalUsdValue.toFixed(2)}</Text>
          <Text style={styles.nativeBalance}>
            {parseFloat(activeBalance).toFixed(6)} {chain?.symbol}
          </Text>

          {/* Chain selector pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainScroll}>
            {CHAIN_ORDER.map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.chainPill, activeChain === key && styles.chainPillActive]}
                onPress={() => setActiveChain(key)}>
                <View style={[styles.chainDot, { backgroundColor: CHAINS[key].iconColor }]} />
                <Text style={[styles.chainPillText, activeChain === key && styles.chainPillTextActive]}>
                  {CHAINS[key].name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.actions}>
          {ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionBtn}
              onPress={() => navigation.navigate(a.screen as any)}>
              <View style={styles.actionIcon}>
                <Text style={{ fontSize: 22 }}>{a.icon}</Text>
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Asset List ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assets</Text>
          {CHAIN_ORDER.map((key) => {
            const bal = nativeBalances[key];
            const c = CHAINS[key];
            return (
              <View key={key} style={styles.assetRow}>
                <View style={[styles.assetIcon, { backgroundColor: c.iconColor + '22' }]}>
                  <Text style={{ fontSize: 20 }}>{CHAIN_ICON[key]}</Text>
                </View>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{c.name}</Text>
                  <Text style={styles.assetChain}>{c.symbol}</Text>
                </View>
                <View style={styles.assetBalance}>
                  <Text style={styles.assetAmount}>{parseFloat(bal ?? '0').toFixed(4)} {c.symbol}</Text>
                  <Text style={styles.assetUsd}>$0.00</Text>
                </View>
              </View>
            );
          })}

          {/* Custom tokens placeholder */}
          <TouchableOpacity style={styles.addToken}>
            <Text style={styles.addTokenText}>+ Add Custom Token</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recent Transactions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyTx}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Send or receive crypto to get started</Text>
            </View>
          ) : (
            transactions.slice(0, 10).map((tx) => (
              <View key={tx.hash} style={styles.txRow}>
                <View style={styles.txIcon}>
                  <Text>{tx.type === 'receive' ? '⬇️' : '⬆️'}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txType}>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</Text>
                  <Text style={styles.txHash}>{tx.hash.slice(0, 10)}…</Text>
                </View>
                <View>
                  <Text style={[styles.txAmount, tx.type === 'receive' ? styles.txGreen : styles.txRed]}>
                    {tx.type === 'receive' ? '+' : '-'}{tx.value}
                  </Text>
                  <View style={[styles.txStatus, { backgroundColor: STATUS_COLOR[tx.status] + '33' }]}>
                    <Text style={[styles.txStatusText, { color: STATUS_COLOR[tx.status] }]}>{tx.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const ACTIONS = [
  { label: 'Send',    icon: '⬆️', screen: 'Send' },
  { label: 'Receive', icon: '⬇️', screen: 'Receive' },
  { label: 'Swap',    icon: '🔄', screen: 'Main' },
  { label: 'Stake',   icon: '💎', screen: 'Staking' },
];

const CHAIN_ICON: Record<string, string> = {
  ethereum: '⟠',
  bsc: '🔶',
  polygon: '🟣',
};

const STATUS_COLOR: Record<string, string> = {
  pending:   Colors.warning,
  confirmed: Colors.success,
  failed:    Colors.danger,
};

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: Colors.bg },
  header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md },
  headerLabel:        { ...Typography.caption, color: Colors.textMuted },
  address:            { ...Typography.body, fontFamily: 'monospace', color: Colors.textSecondary },
  scanBtn:            { padding: Spacing.sm },
  balanceCard:        { marginHorizontal: Spacing.lg, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  usdLabel:           { ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 },
  usdValue:           { fontSize: 36, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  nativeBalance:      { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.md },
  chainScroll:        { marginTop: Spacing.sm },
  chainPill:          { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bgInput, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
  chainPillActive:    { borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  chainDot:           { width: 8, height: 8, borderRadius: 4 },
  chainPillText:      { ...Typography.caption, color: Colors.textSecondary },
  chainPillTextActive:{ color: Colors.primary, fontWeight: '600' },
  actions:            { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  actionBtn:          { alignItems: 'center', gap: 6 },
  actionIcon:         { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  actionLabel:        { ...Typography.caption, color: Colors.textSecondary },
  section:            { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle:       { ...Typography.h3, marginBottom: Spacing.md },
  assetRow:           { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 8, gap: Spacing.md },
  assetIcon:          { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  assetInfo:          { flex: 1 },
  assetName:          { ...Typography.body, fontWeight: '600' },
  assetChain:         { ...Typography.caption },
  assetBalance:       { alignItems: 'flex-end' },
  assetAmount:        { ...Typography.body, fontWeight: '600' },
  assetUsd:           { ...Typography.caption },
  addToken:           { alignItems: 'center', padding: Spacing.md },
  addTokenText:       { color: Colors.primary, fontWeight: '600' },
  emptyTx:            { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyIcon:          { fontSize: 40, marginBottom: Spacing.sm },
  emptyText:          { ...Typography.body, fontWeight: '600', marginBottom: 4 },
  emptySubtext:       { ...Typography.caption },
  txRow:              { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 8, gap: Spacing.md },
  txIcon:             { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgInput, justifyContent: 'center', alignItems: 'center' },
  txInfo:             { flex: 1 },
  txType:             { ...Typography.body, fontWeight: '600' },
  txHash:             { ...Typography.caption, fontFamily: 'monospace' },
  txAmount:           { ...Typography.body, fontWeight: '600', textAlign: 'right' },
  txGreen:            { color: Colors.success },
  txRed:              { color: Colors.danger },
  txStatus:           { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-end' },
  txStatusText:       { fontSize: 10, fontWeight: '600' },
});
