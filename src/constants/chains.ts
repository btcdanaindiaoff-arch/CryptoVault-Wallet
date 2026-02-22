export interface Chain {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  iconColor: string;
  decimals: number;
  isTestnet?: boolean;
}

export const CHAINS: Record<string, Chain> = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://ethereum.publicnode.com',
    explorerUrl: 'https://etherscan.io',
    iconColor: '#627EEA',
    decimals: 18,
  },
  bsc: {
    id: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    iconColor: '#F0B90B',
    decimals: 18,
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    iconColor: '#8247E5',
    decimals: 18,
  },
};

export const DEFAULT_CHAIN_KEY = 'ethereum';
export const CHAIN_KEYS = Object.keys(CHAINS);
export type ChainKey = keyof typeof CHAINS;