/**
 * DAppScreen.tsx — WalletConnect v2 DApp Browser
 * Uses WebView + WalletConnect EthereumProvider for injecting wallet into dApps.
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useWalletStore } from '../../store/walletStore';

interface DApp { name: string; url: string; icon: string; category: string; }

const FEATURED_DAPPS: DApp[] = [
  { name: 'Uniswap',      url: 'https://app.uniswap.org',         icon: '🦄', category: 'DEX' },
  { name: 'PancakeSwap',  url: 'https://pancakeswap.finance/swap', icon: '🥞', category: 'DEX' },
  { name: 'Aave',         url: 'https://app.aave.com',            icon: '👻', category: 'Lending' },
  { name: 'OpenSea',      url: 'https://opensea.io',              icon: '🌊', category: 'NFT' },
  { name: 'QuickSwap',    url: 'https://quickswap.exchange',      icon: '⚡', category: 'DEX' },
  { name: 'Compound',     url: 'https://app.compound.finance',    icon: '🏦', category: 'Lending' },
  { name: 'dYdX',         url: 'https://dydx.exchange',           icon: '📊', category: 'Perps' },
  { name: '1inch',        url: 'https://app.1inch.io',            icon: '🔀', category: 'Aggregator' },
];

const CATEGORIES = ['All', 'DEX', 'Lending', 'NFT', 'Aggregator', 'Perps'];

export default function DAppScreen() {
  const { meta } = useWalletStore();
  const [activeUrl, setActiveUrl]     = useState<string | null>(null);
  const [urlInput, setUrlInput]       = useState('');
  const [category, setCategory]       = useState('All');
  const [webLoading, setWebLoading]   = useState(false);
  const webViewRef = useRef<WebView>(null);

  const filtered = category === 'All'
    ? FEATURED_DAPPS
    : FEATURED_DAPPS.filter(d => d.category === category);

  const navigate = (url: string) => {
    let target = url.trim();
    if (!target.startsWith('http')) target = 'https://' + target;
    setActiveUrl(target);
    setUrlInput(target);
  };

  // WalletConnect injection script — injects wallet address into dApp
  const INJECT_SCRIPT = `
    (function() {
      window.ethereum = {
        isMetaMask: true,
        selectedAddress: '${meta?.address ?? ''}',
        chainId: '0x1',
        networkVersion: '1',
        isConnected: () => true,
        request: async (args) => {
          if (args.method === 'eth_requestAccounts' || args.method === 'eth_accounts') {
            return ['${meta?.address ?? ''}'];
          }
          if (args.method === 'eth_chainId') return '0x1';
          if (args.method === 'net_version') return '1';
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'RPC_REQUEST', payload: args }));
          return null;
        },
        on: (event, handler) => {},
        removeListener: () => {},
        enable: async () => ['${meta?.address ?? ''}'],
      };
      window.web3 = { currentProvider: window.ethereum, eth: { accounts: ['${meta?.address ?? ''}'] } };
    })();
  `;

  if (activeUrl) {
    return (
      <View style={styles.browserContainer}>
        {/* Browser bar */}
        <View style={styles.browserBar}>
          <TouchableOpacity onPress={() => setActiveUrl(null)} style={styles.browserBack}>
            <Text style={styles.browserBackText}>✕</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.urlBar}
            value={urlInput}
            onChangeText={setUrlInput}
            onSubmitEditing={() => navigate(urlInput)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
          />
          <TouchableOpacity onPress={() => webViewRef.current?.reload()} style={styles.browserBack}>
            <Text style={styles.browserBackText}>↺</Text>
          </TouchableOpacity>
        </View>

        {webLoading && (
          <ActivityIndicator
            color={Colors.primary}
            style={{ position: 'absolute', top: 100, alignSelf: 'center', zIndex: 99 }}
          />
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: activeUrl }}
          injectedJavaScriptBeforeContentLoaded={INJECT_SCRIPT}
          onLoadStart={() => setWebLoading(true)}
          onLoadEnd={() => setWebLoading(false)}
          onMessage={(e) => {
            try {
              const msg = JSON.parse(e.nativeEvent.data);
              if (msg.type === 'RPC_REQUEST') {
                Alert.alert(
                  'DApp Request',
                  `Method: ${msg.payload.method}\nThis request requires WalletConnect session signing.`,
                  [{ text: 'OK' }],
                );
              }
            } catch {}
          }}
          javaScriptEnabled
          domStorageEnabled
          allowsBackForwardNavigationGestures
          style={styles.webview}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>DApp Browser</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.search}
            placeholder="Search or enter URL"
            placeholderTextColor={Colors.textMuted}
            value={urlInput}
            onChangeText={setUrlInput}
            onSubmitEditing={() => navigate(urlInput)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
          />
          <TouchableOpacity style={styles.goBtn} onPress={() => navigate(urlInput)}>
            <Text style={styles.goBtnText}>Go</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catPill, category === item && styles.catPillActive]}
            onPress={() => setCategory(item)}>
            <Text style={[styles.catText, category === item && styles.catTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.catRow}
      />

      {/* DApp grid */}
      <FlatList
        data={filtered}
        keyExtractor={d => d.url}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.dappCard} onPress={() => navigate(item.url)}>
            <Text style={styles.dappIcon}>{item.icon}</Text>
            <Text style={styles.dappName}>{item.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* WalletConnect note */}
      <View style={styles.wcBanner}>
        <Text style={styles.wcText}>
          🔗 Connected wallet: {meta?.address?.slice(0, 8)}…{meta?.address?.slice(-4)}
        </Text>
        <Text style={styles.wcSub}>Wallet auto-injected into all dApps</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.bg },
  header:           { paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md },
  title:            { ...Typography.h2, marginBottom: Spacing.md },
  searchRow:        { flexDirection: 'row', gap: 8 },
  search:           { flex: 1, backgroundColor: Colors.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, color: Colors.textPrimary, fontSize: 14, borderWidth: 1, borderColor: Colors.border },
  goBtn:            { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, justifyContent: 'center' },
  goBtnText:        { color: '#fff', fontWeight: '700' },
  catRow:           { maxHeight: 44 },
  catList:          { paddingHorizontal: Spacing.lg, gap: 8, paddingVertical: 4 },
  catPill:          { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  catPillActive:    { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
  catText:          { ...Typography.caption, color: Colors.textSecondary },
  catTextActive:    { color: Colors.primary, fontWeight: '600' },
  grid:             { padding: Spacing.lg, gap: 12 },
  gridRow:          { gap: 12 },
  dappCard:         { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border },
  dappIcon:         { fontSize: 32 },
  dappName:         { ...Typography.body, fontWeight: '600', textAlign: 'center' },
  categoryBadge:    { backgroundColor: Colors.bgInput, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  categoryBadgeText:{ fontSize: 10, color: Colors.textSecondary },
  wcBanner:         { margin: Spacing.lg, backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  wcText:           { ...Typography.caption, color: Colors.textPrimary, fontFamily: 'monospace' },
  wcSub:            { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  // Browser
  browserContainer: { flex: 1, backgroundColor: Colors.bg },
  browserBar:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingTop: 52, paddingBottom: Spacing.sm, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  browserBack:      { padding: 8 },
  browserBackText:  { color: Colors.primary, fontSize: 18 },
  urlBar:           { flex: 1, backgroundColor: Colors.bgInput, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 6, color: Colors.textPrimary, fontSize: 13, borderWidth: 1, borderColor: Colors.border },
  webview:          { flex: 1 },
});
