# CryptoVault — Non-Custodial Web3 Wallet

A Trust Wallet-style self-custody mobile wallet built with React Native.

## Features
- HD wallet (BIP-44): generate or import via 12/24-word mnemonic or private key
- Multi-chain: Ethereum, BNB Smart Chain, Polygon
- 6-digit PIN encryption (Android Keystore / iOS Keychain)
- Send & receive native tokens and ERC-20s
- WalletConnect v2 DApp browser
- NFT gallery (Alchemy/Moralis API)
- Token swap via 1inch aggregator
- Staking (ETH, BNB, MATIC)
- Google Play Store compliant (non-custodial, no in-app purchases)

## Setup
```bash
npm install
cd ios && pod install
npm run android  # or npm run ios
```

## Architecture
- Navigation: React Navigation v6 (Stack + Bottom Tabs)
- State: Zustand + Immer
- Wallet core: ethers.js v6 + bip39
- Storage: react-native-keychain + react-native-encrypted-storage

## Play Store
See `PLAY_STORE_COMPLIANCE.md` for submission guide.