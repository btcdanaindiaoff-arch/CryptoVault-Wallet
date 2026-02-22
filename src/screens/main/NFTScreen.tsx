/**
 * NFTScreen.tsx — NFT Gallery viewer
 * Fetches NFTs via Alchemy / Moralis API. Play Store compliant:
 * NFTs are displayed as collectibles only, no gambling/wagering.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useWalletStore } from '../../store/walletStore';
import { ChainKey } from '../../constants/chains';

interface NFT {
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  collectionName: string;
  contractAddress: string;
  chainKey: ChainKey;
}

// Mock NFTs — replace with Alchemy getNFTsForOwner API in production
const MOCK_NFTS: NFT[] = [
  { tokenId: '1', name: 'Cool Cat #1234', description: 'A cool cat NFT', imageUrl: 'https://placekitten.com/300/300', collectionName: 'Cool Cats', contractAddress: '0xabc...', chainKey: 'ethereum' },
  { tokenId: '2', name: 'Bored Ape #5678', description: 'A bored ape NFT', imageUrl: 'https://placekitten.com/301/301', collectionName: 'BAYC', contractAddress: '0xdef...', chainKey: 'ethereum' },
  { tokenId: '3', name: 'Pudgy Penguin #99', description: 'A pudgy penguin', imageUrl: 'https://placekitten.com/302/302', collectionName: 'Pudgy Penguins', contractAddress: '0x123...', chainKey: 'ethereum' },
  { tokenId: '4', name: 'Doodle #777', description: 'A doodle NFT', imageUrl: 'https://placekitten.com/303/303', collectionName: 'Doodles', contractAddress: '0x456...', chainKey: 'polygon' },
];

const CHAIN_FILTERS: { key: ChainKey | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ethereum', label: 'Ethereum' },
  { key: 'bsc', label: 'BSC' },
  { key: 'polygon', label: 'Polygon' },
];

export default function NFTScreen() {
  const { meta } = useWalletStore();
  const [nfts, setNfts]         = useState<NFT[]>([]);
  const [loading, setLoading]   = useState(true);
  const [chainFilter, setFilter] = useState<ChainKey | 'all'>('all');
  const [selected, setSelected] = useState<NFT | null>(null);

  useEffect(() => {
    // Simulate API fetch — replace with Alchemy/Moralis call
    setTimeout(() => {
      setNfts(MOCK_NFTS);
      setLoading(false);
    }, 1200);
  }, [meta?.address]);

  const filtered = chainFilter === 'all'
    ? nfts
    : nfts.filter(n => n.chainKey === chainFilter);

  const renderNFT = ({ item }: { item: NFT }) => (
    <TouchableOpacity style={styles.nftCard} onPress={() => setSelected(item)} activeOpacity={0.8}>
      <Image source={{ uri: item.imageUrl }} style={styles.nftImage} />
      <View style={styles.nftInfo}>
        <Text style={styles.nftName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.nftCollection} numberOfLines={1}>{item.collectionName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NFT Gallery</Text>
        <Text style={styles.subtitle}>{filtered.length} collectible{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Chain filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {CHAIN_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterPill, chainFilter === f.key && styles.filterPillActive]}
            onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, chainFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading your NFTs…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🖼️</Text>
          <Text style={styles.emptyTitle}>No NFTs Found</Text>
          <Text style={styles.emptyText}>Your NFT collectibles will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => `${i.chainKey}-${i.tokenId}`}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          renderItem={renderNFT}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* NFT Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            {selected && (
              <>
                <Image source={{ uri: selected.imageUrl }} style={styles.modalImage} />
                <Text style={styles.modalName}>{selected.name}</Text>
                <Text style={styles.modalCollection}>{selected.collectionName}</Text>
                <Text style={styles.modalDesc}>{selected.description}</Text>
                <View style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Token ID</Text>
                  <Text style={styles.modalDetailValue}>#{selected.tokenId}</Text>
                </View>
                <View style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Contract</Text>
                  <Text style={styles.modalDetailValue} numberOfLines={1}>{selected.contractAddress}</Text>
                </View>
                <View style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Network</Text>
                  <Text style={styles.modalDetailValue}>{selected.chainKey}</Text>
                </View>
                <TouchableOpacity style={styles.sendNftBtn}>
                  <Text style={styles.sendNftText}>Send NFT</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.bg },
  header:           { paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.sm },
  title:            { ...Typography.h2 },
  subtitle:         { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  filterRow:        { paddingLeft: Spacing.lg, paddingVertical: Spacing.sm, maxHeight: 48 },
  filterPill:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  filterPillActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  filterText:       { ...Typography.caption, color: Colors.textSecondary },
  filterTextActive: { color: Colors.primary, fontWeight: '600' },
  loader:           { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loaderText:       { ...Typography.body, color: Colors.textSecondary },
  empty:            { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  emptyIcon:        { fontSize: 48 },
  emptyTitle:       { ...Typography.h3 },
  emptyText:        { ...Typography.body, color: Colors.textSecondary },
  grid:             { padding: Spacing.lg, paddingTop: Spacing.sm },
  gridRow:          { gap: 12, marginBottom: 12 },
  nftCard:          { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  nftImage:         { width: '100%', aspectRatio: 1, backgroundColor: Colors.bgInput },
  nftInfo:          { padding: Spacing.sm },
  nftName:          { ...Typography.body, fontWeight: '600' },
  nftCollection:    { ...Typography.caption, color: Colors.textSecondary },
  // Modal
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard:        { backgroundColor: Colors.bgCard, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, paddingBottom: 40 },
  modalClose:       { alignSelf: 'flex-end', padding: Spacing.sm },
  modalCloseText:   { color: Colors.textSecondary, fontSize: 18 },
  modalImage:       { width: '100%', aspectRatio: 1, borderRadius: Radius.lg, marginBottom: Spacing.md, backgroundColor: Colors.bgInput },
  modalName:        { ...Typography.h2, marginBottom: 4 },
  modalCollection:  { ...Typography.label, color: Colors.primary, marginBottom: Spacing.sm },
  modalDesc:        { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 22 },
  modalDetail:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  modalDetailLabel: { ...Typography.caption, color: Colors.textSecondary },
  modalDetailValue: { ...Typography.caption, fontFamily: 'monospace', flex: 1, textAlign: 'right' },
  sendNftBtn:       { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center', marginTop: Spacing.md },
  sendNftText:      { color: '#fff', fontWeight: '700', fontSize: 15 },
});
