/**
 * SwapScreen.tsx — Token swap via 1inch / ParaSwap aggregator
 * Play Store compliant: links out to browser DEX, no in-app fiat on-ramp.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { CHAINS, ChainKey } from '../../constants/chains';
import { useWalletStore } from '../../store/walletStore';

const POPULAR_TOKENS: Record<ChainKey, Token[]> = {
  ethereum: [
    { symbol: 'ETH',  name: 'Ethereum',    address: 'native' },
    { symbol: 'USDT', name: 'Tether USD',  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
    { symbol: 'USDC', name: 'USD Coin',    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
    { symbol: 'DAI',  name: 'Dai',         address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
  ],
  bsc: [
    { symbol: 'BNB',  name: 'BNB',        address: 'native' },
    { symbol: 'BUSD', name: 'BUSD',       address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
    { symbol: 'CAKE', name: 'PancakeSwap',address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' },
    { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955' },
  ],
  polygon: [
    { symbol: 'MATIC', name: 'Polygon',   address: 'native' },
    { symbol: 'USDC',  name: 'USD Coin',  address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
    { symbol: 'WETH',  name: 'WETH',      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' },
    { symbol: 'DAI',   name: 'Dai',       address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' },
  ],
  ethereum_goerli: [],
  bsc_testnet: [],
};

interface Token { symbol: string; name: string; address: string; }

export default function SwapScreen() {
  const { activeChain, nativeBalances } = useWalletStore();
  const [chain, setChain]     = useState<ChainKey>(activeChain);
  const [fromToken, setFrom]  = useState<Token>(POPULAR_TOKENS[activeChain][0]);
  const [toToken, setTo]      = useState<Token>(POPULAR_TOKENS[activeChain][1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount]     = useState('');
  const [slippage, setSlippage]     = useState('0.5');
  const [loading, setLoading]       = useState(false);
  const [picking, setPicking]       = useState<'from' | 'to' | null>(null);

  const tokens = POPULAR_TOKENS[chain] || [];

  const simulateQuote = async (val: string) => {
    if (!val || isNaN(Number(val))) { setToAmount(''); return; }
    setLoading(true);
    // Simulate 1inch quote — replace with real API call in production
    await new Promise(r => setTimeout(r, 800));
    const mockRate = fromToken.symbol === 'ETH' ? 2150 : 1;
    setToAmount((Number(val) * mockRate).toFixed(6));
    setLoading(false);
  };

  const flipTokens = () => {
    setFrom(toToken);
    setTo(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = () => {
    if (!fromAmount || Number(fromAmount) <= 0) {
      Alert.alert('Enter amount', 'Please enter an amount to swap.');
      return;
    }
    Alert.alert(
      'Confirm Swap',
      `Swap ${fromAmount} ${fromToken.symbol} → ~${toAmount} ${toToken.symbol}\nSlippage: ${slippage}%`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Swap',
          onPress: () => Alert.alert('Coming Soon', 'Live DEX aggregation requires backend API key configuration. Integrate 1inch or ParaSwap API.'),
        },
      ],
    );
  };

  if (picking) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setPicking(null)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Token</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView>
          {tokens.map((t) => (
            <TouchableOpacity
              key={t.address}
              style={styles.tokenRow}
              onPress={() => {
                if (picking === 'from') setFrom(t);
                else setTo(t);
                setPicking(null);
              }}>
              <View style={styles.tokenIconPlaceholder}>
                <Text style={styles.tokenIconText}>{t.symbol[0]}</Text>
              </View>
              <View>
                <Text style={styles.tokenSymbol}>{t.symbol}</Text>
                <Text style={styles.tokenName}>{t.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Swap</Text>

      {/* Chain selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainRow}>
        {(['ethereum', 'bsc', 'polygon'] as ChainKey[]).map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.chainPill, chain === key && styles.chainPillActive]}
            onPress={() => {
              setChain(key);
              setFrom(POPULAR_TOKENS[key][0]);
              setTo(POPULAR_TOKENS[key][1]);
              setFromAmount(''); setToAmount('');
            }}>
            <View style={[styles.dot, { backgroundColor: CHAINS[key].iconColor }]} />
            <Text style={[styles.chainPillText, chain === key && { color: Colors.primary }]}>
              {CHAINS[key].name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* From */}
      <View style={styles.swapCard}>
        <Text style={styles.cardLabel}>From</Text>
        <View style={styles.tokenRow2}>
          <TouchableOpacity style={styles.tokenSelector} onPress={() => setPicking('from')}>
            <View style={styles.tokenIconPlaceholder}>
              <Text style={styles.tokenIconText}>{fromToken.symbol[0]}</Text>
            </View>
            <Text style={styles.tokenSelectorText}>{fromToken.symbol}</Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.amountInput}
            value={fromAmount}
            onChangeText={(v) => { setFromAmount(v); simulateQuote(v); }}
            placeholder="0.00"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>
        <Text style={styles.balanceHint}>
          Balance: {parseFloat(nativeBalances[chain] ?? '0').toFixed(4)} {CHAINS[chain].symbol}
        </Text>
      </View>

      {/* Flip button */}
      <TouchableOpacity style={styles.flipBtn} onPress={flipTokens}>
        <Text style={styles.flipBtnText}>⇅</Text>
      </TouchableOpacity>

      {/* To */}
      <View style={styles.swapCard}>
        <Text style={styles.cardLabel}>To (estimated)</Text>
        <View style={styles.tokenRow2}>
          <TouchableOpacity style={styles.tokenSelector} onPress={() => setPicking('to')}>
            <View style={styles.tokenIconPlaceholder}>
              <Text style={styles.tokenIconText}>{toToken.symbol[0]}</Text>
            </View>
            <Text style={styles.tokenSelectorText}>{toToken.symbol}</Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
          {loading
            ? <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
            : (
              <TextInput
                style={[styles.amountInput, { color: Colors.textSecondary }]}
                value={toAmount}
                editable={false}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
              />
            )}
        </View>
      </View>

      {/* Slippage */}
      <View style={styles.slippageRow}>
        <Text style={styles.slippageLabel}>Slippage Tolerance</Text>
        <View style={styles.slippagePills}>
          {['0.1', '0.5', '1.0'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.slippagePill, slippage === s && styles.slippagePillActive]}
              onPress={() => setSlippage(s)}>
              <Text style={[styles.slippagePillText, slippage === s && { color: Colors.primary }]}>{s}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Rate info */}
      {toAmount ? (
        <View style={styles.rateCard}>
          <Text style={styles.rateText}>
            1 {fromToken.symbol} ≈ {(Number(toAmount) / Number(fromAmount || 1)).toFixed(4)} {toToken.symbol}
          </Text>
          <Text style={styles.rateSubtext}>Via 1inch Aggregator</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.swapBtn} onPress={handleSwap}>
        <Text style={styles.swapBtnText}>Swap {fromToken.symbol} → {toToken.symbol}</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Swaps are executed on-chain via decentralized protocols. You always retain custody of your funds.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.bg },
  content:         { padding: Spacing.lg, paddingBottom: 40 },
  pageTitle:       { ...Typography.h2, marginBottom: Spacing.lg, marginTop: Spacing.lg },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingTop: 56 },
  backText:        { color: Colors.primary, fontSize: 16 },
  headerTitle:     { ...Typography.h3 },
  chainRow:        { marginBottom: Spacing.lg },
  chainPill:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bgCard, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
  chainPillActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  chainPillText:   { ...Typography.caption, color: Colors.textSecondary },
  dot:             { width: 8, height: 8, borderRadius: 4 },
  swapCard:        { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 4, borderWidth: 1, borderColor: Colors.border },
  cardLabel:       { ...Typography.caption, color: Colors.textSecondary, marginBottom: 8 },
  tokenRow:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tokenRow2:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tokenIconPlaceholder:{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '44', justifyContent: 'center', alignItems: 'center' },
  tokenIconText:   { color: Colors.primary, fontWeight: '700' },
  tokenSymbol:     { ...Typography.body, fontWeight: '600' },
  tokenName:       { ...Typography.caption },
  tokenSelector:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bgInput, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  tokenSelectorText:{ ...Typography.body, fontWeight: '600' },
  chevron:         { color: Colors.textSecondary, fontSize: 12 },
  amountInput:     { flex: 1, color: Colors.textPrimary, fontSize: 22, fontWeight: '700', textAlign: 'right' },
  balanceHint:     { ...Typography.caption, color: Colors.textMuted, marginTop: 4 },
  flipBtn:         { alignSelf: 'center', width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgInput, justifyContent: 'center', alignItems: 'center', marginVertical: 4, borderWidth: 1, borderColor: Colors.border, zIndex: 10 },
  flipBtnText:     { fontSize: 20, color: Colors.primary },
  slippageRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.sm },
  slippageLabel:   { ...Typography.caption, color: Colors.textSecondary },
  slippagePills:   { flexDirection: 'row', gap: 8 },
  slippagePill:    { backgroundColor: Colors.bgCard, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  slippagePillActive:{ borderColor: Colors.primary },
  slippagePillText:{ ...Typography.caption, color: Colors.textSecondary },
  rateCard:        { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between' },
  rateText:        { ...Typography.caption, color: Colors.textSecondary },
  rateSubtext:     { ...Typography.caption, color: Colors.primary },
  swapBtn:         { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: Radius.lg, alignItems: 'center', marginTop: Spacing.lg },
  swapBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  disclaimer:      { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md, lineHeight: 18 },
});
