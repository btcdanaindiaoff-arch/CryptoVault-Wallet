/**
 * walletStore.ts — Global Zustand state for the wallet
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CHAINS, ChainKey, DEFAULT_CHAIN_KEY } from '../constants/chains';
import { getNativeBalance, loadWalletMeta, WalletMeta } from '../core/wallet';

export interface TokenAsset {
  symbol: string;
  name: string;
  balance: string;
  usdValue: number;
  contractAddress?: string;
  iconUrl?: string;
  chainKey: ChainKey;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'send' | 'receive' | 'swap' | 'approve';
  chainKey: ChainKey;
}

interface WalletState {
  // Wallet identity
  meta: WalletMeta | null;
  isUnlocked: boolean;
  activeChain: ChainKey;

  // Balances & assets
  nativeBalances: Record<ChainKey, string>;
  assets: TokenAsset[];
  totalUsdValue: number;

  // Transactions
  transactions: Transaction[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setMeta: (meta: WalletMeta) => void;
  setUnlocked: (val: boolean) => void;
  setActiveChain: (chain: ChainKey) => void;
  setNativeBalance: (chain: ChainKey, balance: string) => void;
  setAssets: (assets: TokenAsset[]) => void;
  setTotalUsdValue: (val: number) => void;
  addTransaction: (tx: Transaction) => void;
  updateTxStatus: (hash: string, status: Transaction['status']) => void;
  setLoading: (val: boolean) => void;
  setError: (msg: string | null) => void;
  reset: () => void;

  // Async thunks
  loadFromStorage: () => Promise<void>;
  refreshBalances: () => Promise<void>;
}

const initialState = {
  meta: null,
  isUnlocked: false,
  activeChain: DEFAULT_CHAIN_KEY as ChainKey,
  nativeBalances: {} as Record<ChainKey, string>,
  assets: [],
  totalUsdValue: 0,
  transactions: [],
  isLoading: false,
  error: null,
};

export const useWalletStore = create<WalletState>()(
  immer((set, get) => ({
    ...initialState,

    setMeta: (meta) => set((s) => { s.meta = meta; }),
    setUnlocked: (val) => set((s) => { s.isUnlocked = val; }),
    setActiveChain: (chain) => set((s) => { s.activeChain = chain; }),
    setNativeBalance: (chain, balance) =>
      set((s) => { s.nativeBalances[chain] = balance; }),
    setAssets: (assets) => set((s) => { s.assets = assets; }),
    setTotalUsdValue: (val) => set((s) => { s.totalUsdValue = val; }),
    addTransaction: (tx) =>
      set((s) => { s.transactions.unshift(tx); }),
    updateTxStatus: (hash, status) =>
      set((s) => {
        const tx = s.transactions.find((t) => t.hash === hash);
        if (tx) tx.status = status;
      }),
    setLoading: (val) => set((s) => { s.isLoading = val; }),
    setError: (msg) => set((s) => { s.error = msg; }),
    reset: () => set(() => ({ ...initialState })),

    loadFromStorage: async () => {
      set((s) => { s.isLoading = true; });
      try {
        const meta = await loadWalletMeta();
        set((s) => { s.meta = meta; });
      } catch (e: any) {
        set((s) => { s.error = e.message; });
      } finally {
        set((s) => { s.isLoading = false; });
      }
    },

    refreshBalances: async () => {
      const { meta, activeChain } = get();
      if (!meta?.address) return;
      set((s) => { s.isLoading = true; });
      try {
        const chainKeys = Object.keys(CHAINS) as ChainKey[];
        const results = await Promise.allSettled(
          chainKeys
            .filter((k) => !CHAINS[k].isTestnet)
            .map(async (k) => {
              const bal = await getNativeBalance(meta.address, k);
              return { k, bal };
            }),
        );
        set((s) => {
          results.forEach((r) => {
            if (r.status === 'fulfilled') {
              s.nativeBalances[r.value.k] = r.value.bal;
            }
          });
        });
      } catch (e: any) {
        set((s) => { s.error = e.message; });
      } finally {
        set((s) => { s.isLoading = false; });
      }
    },
  })),
);