// client/src/global.d.ts
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider; // Define the ethereum property
  }
}

// Export {} to make it a module, which is required for global declarations.
export {};
