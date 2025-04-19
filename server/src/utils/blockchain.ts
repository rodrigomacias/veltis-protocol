import { ethers } from 'ethers';
import dotenv from 'dotenv';
// Import ABI from the copied location within src
import VeltisIPNFT_ABI from '../config/VeltisIPNFT.abi.json' with { type: 'json' }; // ABI is the array itself

dotenv.config();

const polygonRpcUrl = process.env.POLYGON_RPC_URL;
// const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY; // No longer needed for backend minting
const contractAddress = process.env.VELTIS_IPNFT_CONTRACT_ADDRESS;

// Only require RPC URL and Contract Address for backend read operations/monitoring
if (!polygonRpcUrl || !contractAddress) {
  console.error(
    'Blockchain Error: Missing POLYGON_RPC_URL or VELTIS_IPNFT_CONTRACT_ADDRESS in environment variables.'
  );
  // Allow module load, but functions needing provider/contract will fail.
}

let provider: ethers.JsonRpcProvider | null = null;
// let wallet: ethers.Wallet | null = null; // Wallet removed
let veltisContract: ethers.Contract | null = null; // Read-only contract instance

if (polygonRpcUrl && contractAddress) {
  try {
    provider = new ethers.JsonRpcProvider(polygonRpcUrl);
    // Get read-only contract instance connected to the provider
    veltisContract = new ethers.Contract(contractAddress, VeltisIPNFT_ABI, provider); // Use ABI directly
    console.log(
      `[blockchain] Connected to Polygon RPC for read operations. Contract address: ${contractAddress}`
    );
  } catch (error) {
    console.error('[blockchain] Error initializing provider or read-only contract:', error);
    provider = null;
    // wallet = null;
    veltisContract = null;
  }
}

// Removed anchorHashOnChain function as it's redundant with user-minted IPNFTs

/**
 * Returns a read-only instance of the VeltisIPNFT contract connected to the provider.
 * Useful for backend checks like verifying token URIs or ownership.
 *
 * @returns {ethers.Contract} The ethers Contract instance.
 * @throws {Error} If the contract is not initialized.
 */
export const getContractInstance = (): ethers.Contract => {
    if (!veltisContract) {
        throw new Error('VeltisIPNFT contract not initialized. Check environment variables and connection.');
    }
    return veltisContract; // Returns instance connected to provider only
};

/**
 * Waits for a transaction to be confirmed on the blockchain.
 *
 * @param {string} txHash - The hash of the transaction to wait for.
 * @param {number} [confirmations=1] - The number of confirmations to wait for.
 * @returns {Promise<ethers.TransactionReceipt | null>} The transaction receipt if confirmed, otherwise null.
 * @throws {Error} If the provider is not initialized.
 */
export const waitForTransaction = async (
  txHash: string,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> => {
  if (!provider) {
    throw new Error(
      'Blockchain provider not initialized. Check environment variables and connection.'
    );
  }
  try {
    console.log(
      `[blockchain] Waiting for transaction ${txHash} with ${confirmations} confirmations...`
    );
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    console.log(`[blockchain] Transaction ${txHash} confirmed.`);
    return receipt;
  } catch (error) {
    console.error(
      `[blockchain] Error waiting for transaction ${txHash}:`,
      error
    );
    return null;
  }
};
