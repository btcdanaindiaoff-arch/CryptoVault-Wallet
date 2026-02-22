/**
 * wallet.ts — Non-custodial HD Wallet Core
 * Supports Ethereum, BNB Smart Chain, Polygon (all EVM-compatible).
 * Keys never leave the device; stored in Android Keystore / iOS Keychain
 * via react-native-keychain.
 */

import 'react-native-get-random-values';
import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';
import { CHAINS, ChainKey } from '../constants/chains';

// ─── Storage Keys ────────────────────────────────────────────────────────────
const MNEMONIC_SERVICE = 'com.trustclone.mnemonic';
const WALLET_META_KEY  = 'wallet_meta';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface WalletMeta {
  address: string;      // checksummed ETH/EVM address (same for all EVM chains)
  createdAt: number;
  backupVerified: boolean;
}

// ─── HD derivation paths ──────────────────────────────────────────────────────
// BIP-44: m/44'/coin_type'/0'/0/index
const DERIVATION_PATH = "m/44'/60'/0'/0/0"; // Ethereum / all EVM

// ─── Generate new wallet ─────────────────────────────────────────────────────
export async function generateWallet(): Promise<{ mnemonic: string; address: string }> {
  const mnemonic = bip39.generateMnemonic(128); // 12 words
  const address  = await deriveAddress(mnemonic);
  return { mnemonic, address };
}

// ─── Import wallet from mnemonic ─────────────────────────────────────────────
export async function importFromMnemonic(mnemonic: string): Promise<string> {
  if (!bip39.validateMnemonic(mnemonic.trim())) {
    throw new Error('Invalid mnemonic phrase');
  }
  return deriveAddress(mnemonic.trim());
}

// ─── Import wallet from private key ──────────────────────────────────────────
export async function importFromPrivateKey(privateKey: string): Promise<string> {
  const wallet = new ethers.Wallet(privateKey.trim());
  return wallet.address;
}

// ─── Derive address from mnemonic ────────────────────────────────────────────
async function deriveAddress(mnemonic: string): Promise<string> {
  const hdNode  = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, DERIVATION_PATH);
  return hdNode.address;
}

// ─── Save mnemonic securely ───────────────────────────────────────────────────
export async function saveMnemonic(mnemonic: string, pin: string): Promise<void> {
  // Encrypt with PIN before storing in Keychain
  const encrypted = encryptWithPin(mnemonic, pin);
  await Keychain.setGenericPassword(MNEMONIC_SERVICE, encrypted, {
    service: MNEMONIC_SERVICE,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

// ─── Load and decrypt mnemonic ────────────────────────────────────────────────
export async function loadMnemonic(pin: string): Promise<string> {
  const result = await Keychain.getGenericPassword({ service: MNEMONIC_SERVICE });
  if (!result) throw new Error('No wallet stored on this device');
  return decryptWithPin(result.password, pin);
}

// ─── Save wallet metadata (non-sensitive) ─────────────────────────────────────
export async function saveWalletMeta(meta: WalletMeta): Promise<void> {
  await EncryptedStorage.setItem(WALLET_META_KEY, JSON.stringify(meta));
}

// ─── Load wallet metadata ─────────────────────────────────────────────────────
export async function loadWalletMeta(): Promise<WalletMeta | null> {
  const raw = await EncryptedStorage.getItem(WALLET_META_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ─── Delete wallet (wipe) ─────────────────────────────────────────────────────
export async function deleteWallet(): Promise<void> {
  await Keychain.resetGenericPassword({ service: MNEMONIC_SERVICE });
  await EncryptedStorage.removeItem(WALLET_META_KEY);
}

// ─── Get ethers signer for a chain ───────────────────────────────────────────
export async function getSigner(chainKey: ChainKey, pin: string): Promise<ethers.Wallet> {
  const mnemonic = await loadMnemonic(pin);
  const chain    = CHAINS[chainKey];
  const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
  const hdNode   = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, DERIVATION_PATH);
  return new ethers.Wallet(hdNode.privateKey, provider);
}

// ─── Get read-only provider ───────────────────────────────────────────────────
export function getProvider(chainKey: ChainKey): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(CHAINS[chainKey].rpcUrl);
}

// ─── Get native balance ───────────────────────────────────────────────────────
export async function getNativeBalance(address: string, chainKey: ChainKey): Promise<string> {
  const provider = getProvider(chainKey);
  const balance  = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

// ─── Get ERC-20 token balance ─────────────────────────────────────────────────
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string,
  chainKey: ChainKey,
): Promise<{ balance: string; symbol: string }> {
  const provider = getProvider(chainKey);
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [rawBalance, decimals, symbol] = await Promise.all([
    contract.balanceOf(walletAddress),
    contract.decimals(),
    contract.symbol(),
  ]);
  return { balance: ethers.formatUnits(rawBalance, decimals), symbol };
}

// ─── Send native token ────────────────────────────────────────────────────────
export async function sendNative(
  to: string,
  amountEther: string,
  chainKey: ChainKey,
  pin: string,
): Promise<ethers.TransactionResponse> {
  const signer = await getSigner(chainKey, pin);
  return signer.sendTransaction({
    to,
    value: ethers.parseEther(amountEther),
  });
}

// ─── Send ERC-20 token ────────────────────────────────────────────────────────
const ERC20_TRANSFER_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

export async function sendToken(
  tokenAddress: string,
  to: string,
  amount: string,
  chainKey: ChainKey,
  pin: string,
): Promise<ethers.TransactionResponse> {
  const signer   = await getSigner(chainKey, pin);
  const contract = new ethers.Contract(tokenAddress, ERC20_TRANSFER_ABI, signer);
  const decimals = await contract.decimals();
  return contract.transfer(to, ethers.parseUnits(amount, decimals));
}

// ─── Simple XOR PIN encryption (replace with AES in production) ───────────────
function encryptWithPin(text: string, pin: string): string {
  const key = pin.repeat(Math.ceil(text.length / pin.length)).slice(0, text.length);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i));
  }
  return Buffer.from(result, 'binary').toString('base64');
}

function decryptWithPin(encoded: string, pin: string): string {
  const text = Buffer.from(encoded, 'base64').toString('binary');
  const key  = pin.repeat(Math.ceil(text.length / pin.length)).slice(0, text.length);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i));
  }
  return result;
}