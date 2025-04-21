import { HardhatUserConfig } from "hardhat/config";
// Explicitly import required plugins instead of toolbox
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-ignition-ethers"; // Requires ignition-core and hardhat-ignition
import path from "path";
import dotenv from 'dotenv'; // Import dotenv

// Load .env file from the current directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

// No need to import hre, plugins extend the HRE automatically when required here.

// Ensure environment variables are loaded (Now explicitly loaded by dotenv)
// Use specific variable names for clarity
const AMOY_RPC_URL = process.env.POLYGON_AMOY_RPC_URL; // Expecting specific Amoy RPC URL
const DEPLOYER_PRIVATE_KEY = process.env.PLATFORM_WALLET_PRIVATE_KEY;

if (!AMOY_RPC_URL) {
  console.warn("⚠️ WARNING: POLYGON_AMOY_RPC_URL not set in root .env file. Using default public RPC.");
}
if (!DEPLOYER_PRIVATE_KEY) {
  console.warn("⚠️ WARNING: DEPLOYER_PRIVATE_KEY not set in environment variables. Deployment/testing on live networks will fail.");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // Remappings removed as they are not supported by Hardhat.
    },
  },
  paths: {
    sources: "./contracts", // Keep default source path
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    // Explicitly add node_modules path for imports if needed, though usually automatic
    // imports: "./node_modules" // Note: 'imports' key is not valid here
  },
  // Add remappings if automatic resolution fails
  // This tells the compiler: when you see "@openzeppelin/", look in "node_modules/@openzeppelin/"
  // NOTE: This might not be necessary if Hardhat resolves correctly, but trying it due to errors.
  // It's more common in Foundry, but let's try adding it here.
  // solidity: { // Re-declare solidity to add settings - this structure might be wrong, check docs
  //   compilers: [
  //     {
  //       version: "0.8.28",
  //       settings: {
  //         remappings: ["@openzeppelin/=node_modules/@openzeppelin/"], // Example remapping
  //         optimizer: { enabled: true, runs: 200 }
  //       }
  //     }
  //   ]
  // },
  networks: {
    hardhat: {
      // Configuration for the local Hardhat Network (usually default)
    },
    amoy: {
      url: AMOY_RPC_URL || "https://rpc-amoy.polygon.technology", // Use env var or default public Amoy RPC
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 80002, // Polygon Amoy Chain ID
    },
    // Keep mumbai example if needed, or remove
    // mumbai: {
    //   url: process.env.POLYGON_MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
    //   accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    //   chainId: 80001,
    // },
    // Add other networks like polygon mainnet here (ensure corresponding env vars)
    // polygon: {
    //   url: process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-rpc.com",
    //   accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    //   chainId: 137,
    // }
  },
  // Optional: Add Etherscan API key for verification
  // etherscan: {
  //   apiKey: process.env.POLYGONSCAN_API_KEY || "",
  // },
};

export default config;
