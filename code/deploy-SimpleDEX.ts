/**
 * SimpleDEX Deployment Script for BSC Testnet
 * 
 * This script deploys the SimpleDEX liquidity pool contract and creates
 * a trading pair with the USDT token.
 * 
 * Prerequisites:
 * - Node.js with TypeScript
 * - thirdweb SDK installed
 * - BSC Testnet RPC configured
 * - Deployer wallet with BNB for gas
 * 
 * Usage:
 *   npx ts-node deploy-SimpleDEX.ts
 */

import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { BinanceSmartChainTestnet } from "@thirdweb-dev/chains";
import * as fs from "fs";
import * as path from "path";

// ============ Configuration ============

const config = {
  // BSC Testnet Configuration
  network: BinanceSmartChainTestnet,
  
  // Known USDT Token on BSC Testnet
  usdtAddress: "0x2D974F61dEB29F8cd7D547b1aaEC540001Ab8A23",

  // Custom Token (Token1) for the trading pair
  token1Address: "0xe8419f738113502c6446ADF168693c7417aEEdd0",
  
  // Your thirdweb secret key (set in environment)
  secretKey: process.env.THIRDWEB_SECRET_KEY || "",
  
  // Deployer private key (set in environment for production)
  privateKey: process.env.DEPLOYER_PRIVATE_KEY || "",
  
  // Gas settings for BSC Testnet
  gasSettings: {
    maxPriorityFeePerGas: 1000000000, // 1 Gwei
    maxFeePerGas: 5000000000, // 5 Gwei
  },
};

// ============ Helper Functions ============

/**
 * Load contract source code from file
 */
function loadContractSource(): string {
  const contractPath = path.join(__dirname, "SimpleDEX.sol");
  
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract file not found at: ${contractPath}`);
  }
  
  return fs.readFileSync(contractPath, "utf-8");
}

/**
 * Format deployment information for display
 */
function formatDeploymentInfo(
  contractAddress: string,
  token0: string,
  token1: string,
  transactionHash: string
): string {
  return `
╔════════════════════════════════════════════════════════════════╗
║           SimpleDEX Deployment Successful                      ║
╚════════════════════════════════════════════════════════════════╝

Contract Address:  ${contractAddress}
Network:           BSC Testnet (Chain ID: 97)
Transaction Hash:  ${transactionHash}

Token Pair:
  Token0:          ${token0}
  Token1:          ${token1}

BSCScan Testnet:   https://testnet.bscscan.com/address/${contractAddress}

Next Steps:
1. Verify contract on BSCScan (optional)
2. Add initial liquidity to the pool
3. Test token swaps
4. Integrate with your dApp frontend

Example: Add Liquidity
  - Navigate to your dApp
  - Connect wallet
  - Approve tokens for SimpleDEX contract
  - Call addLiquidity() with desired amounts

Example: Swap Tokens
  - Approve input token
  - Call swap() with amountIn and minimum output
  - Verify balance changes
`;
}

/**
 * Save deployment details to file
 */
function saveDeploymentDetails(
  contractAddress: string,
  token0: string,
  token1: string,
  transactionHash: string
): void {
  const deploymentData = {
    network: "BSC Testnet",
    chainId: 97,
    contractAddress,
    token0,
    token1,
    transactionHash,
    deployedAt: new Date().toISOString(),
    bscscanUrl: `https://testnet.bscscan.com/address/${contractAddress}`,
  };
  
  const outputPath = path.join(__dirname, "deployment-info.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  
  console.log(`\nDeployment details saved to: ${outputPath}`);
}

// ============ Main Deployment Function ============

async function deploySimpleDEX() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║          SimpleDEX Deployment Script - BSC Testnet            ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");
  
  // Validate configuration
  if (!config.secretKey && !config.privateKey) {
    throw new Error(
      "Please set THIRDWEB_SECRET_KEY or DEPLOYER_PRIVATE_KEY environment variable"
    );
  }
  
  try {
    // Initialize thirdweb SDK
    console.log("⏳ Initializing thirdweb SDK...");
    const sdk = ThirdwebSDK.fromPrivateKey(
      config.privateKey,
      config.network,
      {
        secretKey: config.secretKey,
      }
    );
    
    const signerAddress = await sdk.wallet.getAddress();
    console.log(`✅ Connected with wallet: ${signerAddress}\n`);
    
    // Check wallet balance
    const balance = await sdk.wallet.balance();
    console.log(`💰 Wallet Balance: ${balance.displayValue} ${balance.symbol}`);
    
    if (parseFloat(balance.displayValue) < 0.01) {
      console.warn(
        "\n⚠️  WARNING: Low balance! Get testnet BNB from: https://testnet.binance.org/faucet-smart\n"
      );
    }
    
    // Load contract source
    console.log("\n⏳ Loading SimpleDEX contract source...");
    const contractSource = loadContractSource();
    console.log("✅ Contract source loaded\n");
    
    // For this deployment, we'll create a USDT/WBNB pair
    // You can modify this to pair with any other token
    console.log("📋 Deployment Configuration:");
    console.log(`   Token0 (USDT): ${config.usdtAddress}`);
    console.log(`   Token1: [Enter second token address]`);
    console.log(`   Network: ${config.network.name} (Chain ID: ${config.network.chainId})\n`);
    
    // Note: You need to specify the second token for the pair
    // For demonstration, using USDT address as placeholder
    // Replace with actual second token address (e.g., WBNB, BUSD, etc.)
    const token1Address = process.env.TOKEN1_ADDRESS || config.token1Address;
    
    console.log("⏳ Deploying SimpleDEX contract...");
    console.log("   This may take 30-60 seconds...\n");
    
    // Deploy contract using thirdweb
    const contractAddress = await sdk.deployer.deployContractFromUri(
      "ipfs://QmSimpleDEXContractURI", // Replace with actual IPFS URI after upload
      [config.usdtAddress, token1Address],
      {
        gasLimit: 5000000,
        ...config.gasSettings,
      }
    );
    
    console.log("✅ Contract deployed successfully!\n");
    
    // Get transaction details
    const contract = await sdk.getContract(contractAddress);
    const metadata = await contract.metadata.get();
    
    // Display deployment information
    const deploymentInfo = formatDeploymentInfo(
      contractAddress,
      config.usdtAddress,
      token1Address,
      "pending" // Transaction hash would be returned by deployment
    );
    
    console.log(deploymentInfo);
    
    // Save deployment details
    saveDeploymentDetails(
      contractAddress,
      config.usdtAddress,
      token1Address,
      "pending"
    );
    
    // Verify contract functions are accessible
    console.log("\n⏳ Verifying contract functions...");
    const reserves = await contract.call("getReserves");
    console.log("✅ Contract is functional!");
    console.log(`   Initial Reserves: [${reserves._reserve0}, ${reserves._reserve1}]\n`);
    
    return {
      contractAddress,
      token0: config.usdtAddress,
      token1: token1Address,
    };
    
  } catch (error) {
    console.error("\n❌ Deployment failed!");
    console.error("Error details:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("insufficient funds")) {
        console.error(
          "\n💡 Get testnet BNB from: https://testnet.binance.org/faucet-smart"
        );
      } else if (error.message.includes("nonce")) {
        console.error("\n💡 Try again - nonce issue detected");
      }
    }
    
    throw error;
  }
}

// ============ Alternative: Direct Deployment with Hardhat/Ethers ============

/**
 * Alternative deployment method using direct contract compilation
 * Requires: hardhat, ethers.js, solc compiler
 */
async function deployWithHardhat() {
  console.log("\n📦 Alternative: Deploy with Hardhat");
  console.log("   If thirdweb deployment fails, use this method:\n");
  
  console.log("1. Install dependencies:");
  console.log("   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox");
  console.log("   npm install @openzeppelin/contracts\n");
  
  console.log("2. Initialize Hardhat project:");
  console.log("   npx hardhat init\n");
  
  console.log("3. Configure hardhat.config.ts for BSC Testnet:");
  console.log(`
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || ""],
    },
  },
};

export default config;
  `);
  
  console.log("4. Create deployment script (scripts/deploy.ts):");
  console.log(`
import { ethers } from "hardhat";

async function main() {
  const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
  const token0 = "0x2D974F61dEB29F8cd7D547b1aaEC540001Ab8A23"; // USDT
  const token1 = "YOUR_TOKEN1_ADDRESS"; // Replace with actual address
  
  const simpleDEX = await SimpleDEX.deploy(token0, token1);
  await simpleDEX.waitForDeployment();
  
  console.log("SimpleDEX deployed to:", await simpleDEX.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
  `);
  
  console.log("5. Deploy:");
  console.log("   npx hardhat run scripts/deploy.ts --network bscTestnet\n");
}

// ============ Execute Deployment ============

if (require.main === module) {
  deploySimpleDEX()
    .then(() => {
      console.log("\n✅ Deployment process completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Deployment process failed:", error);
      console.log("\n");
      deployWithHardhat(); // Show alternative method
      process.exit(1);
    });
}

export { deploySimpleDEX, deployWithHardhat };