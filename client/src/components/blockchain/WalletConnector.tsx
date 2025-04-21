'use client';

import React, { useState, useEffect } from 'react';
import { ethers, Signer } from 'ethers';
import { Wallet, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define a more specific type for the Ethereum provider injected by wallets
type Eip1193Provider = ethers.Eip1193Provider & {
  on?: (event: 'accountsChanged' | 'chainChanged' | 'disconnect', listener: (accounts: string[]) => void) => Eip1193Provider;
  removeListener?: (event: 'accountsChanged' | 'chainChanged' | 'disconnect', listener: (accounts: string[]) => void) => Eip1193Provider;
};

// Define props interface
interface WalletConnectorProps {
  onConnected?: (address: string, signer: Signer) => void;
  onDisconnected?: () => void;
  buttonClassName?: string;
  requiredChainId?: number;
}

// Polygon Amoy Testnet Chain ID is 80002
const POLYGON_AMOY_CHAIN_ID = 80002;

// Temporary Button component - replace with your UI library button
const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button 
    className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} 
    {...props}
  >
    {children}
  </button>
);

const WalletConnector: React.FC<WalletConnectorProps> = ({ 
  onConnected, 
  onDisconnected, 
  buttonClassName,
  requiredChainId = POLYGON_AMOY_CHAIN_ID
}) => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  
  // Helper to check if we're on the correct network
  const checkNetwork = async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      
      const isCorrectNetwork = currentChainId === requiredChainId;
      setWrongNetwork(!isCorrectNetwork);
      
      return isCorrectNetwork;
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  };
  
  // Function to switch network
  const switchNetwork = async () => {
    const ethereumProvider = window.ethereum as Eip1193Provider & {
      request: (args: { method: string; params: any[] }) => Promise<any>;
    };
    
    if (!ethereumProvider?.request) return false;
    
    try {
      // Request switch to Polygon Amoy
      await ethereumProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${requiredChainId.toString(16)}` }], // Convert to hex
      });
      return true;
    } catch (switchError: unknown) {
      // This error code indicates that the chain has not been added to MetaMask.
      const errorObj = switchError as { code: number };
      if (errorObj.code === 4902) {
        try {
          await ethereumProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${requiredChainId.toString(16)}`,
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology'],
                blockExplorerUrls: ['https://amoy.polygonscan.com/']
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Error adding network:", addError);
          return false;
        }
      }
      console.error("Error switching network:", switchError);
      return false;
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    const ethereumProvider = window.ethereum as Eip1193Provider | undefined;

    if (!ethereumProvider) {
      setError('Metamask (or other EIP-1193 provider) not detected. Please install it.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(ethereumProvider);
      
      // Check if we're on the correct network
      const isCorrectNetwork = await checkNetwork(browserProvider);
      if (!isCorrectNetwork) {
        const switched = await switchNetwork();
        if (!switched) {
          setError(`Please switch to the required network (Chain ID: ${requiredChainId})`);
          setIsConnecting(false);
          return;
        }
      }
      
      // Request accounts
      const accounts: string[] = await browserProvider.send("eth_requestAccounts", []);
      const walletSigner: Signer = await browserProvider.getSigner();
      const address = accounts[0];
      
      setSigner(walletSigner);
      setUserAddress(address);
      console.log("Wallet connected:", address);
      
      // Call onConnected callback if provided
      if (onConnected) {
        onConnected(address, walletSigner);
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Failed to connect wallet:", errorMsg);
      setError(`Failed to connect wallet: ${errorMsg || 'Unknown error'}`);
    }
    
    setIsConnecting(false);
  };

  // Disconnect wallet function (mainly for UI state, actual disconnect happens in wallet)
  const disconnectWallet = () => {
    setSigner(null);
    setUserAddress(null);
    if (onDisconnected) {
      onDisconnected();
    }
  };

  // Effect to check connection on load and handle account changes
  useEffect(() => {
    const ethereumProvider = window.ethereum as Eip1193Provider | undefined;

    const checkConnection = async () => {
      if (ethereumProvider) {
        const browserProvider = new ethers.BrowserProvider(ethereumProvider);
        
        // Check network first
        const isCorrectNetwork = await checkNetwork(browserProvider);
        if (!isCorrectNetwork) {
          return;
        }
        
        // Check for connected accounts
        const accounts = await browserProvider.listAccounts();
        if (accounts.length > 0) {
          const walletSigner: Signer = await browserProvider.getSigner();
          setSigner(walletSigner);
          const currentAddress = accounts[0].address;
          setUserAddress(currentAddress);
          console.log("Wallet already connected:", currentAddress);
          
          // Call onConnected callback if provided
          if (onConnected) {
            onConnected(currentAddress, walletSigner);
          }
        }
      }
    };
    
    checkConnection();

    // Define the account change handler separately
    const handleAccountsChanged = (accounts: string[]) => {
      console.log("Accounts changed:", accounts);
      if (accounts.length > 0) {
        // Reconnect with the new account
        connectWallet();
      } else {
        // Wallet disconnected
        setSigner(null);
        setUserAddress(null);
        if (onDisconnected) {
          onDisconnected();
        }
        console.log("Wallet disconnected");
      }
    };
    
    // Define chain changed handler
    const handleChainChanged = () => {
      // Page reload is recommended by MetaMask on chain change
      window.location.reload();
    };

    // Listen for wallet events
    if (ethereumProvider?.on) {
      ethereumProvider.on('accountsChanged', handleAccountsChanged);
      ethereumProvider.on('chainChanged', handleChainChanged);
    }

    // Cleanup listeners on unmount
    return () => {
      if (ethereumProvider?.removeListener) {
        try {
          ethereumProvider.removeListener('accountsChanged', handleAccountsChanged);
          ethereumProvider.removeListener('chainChanged', handleChainChanged);
          console.log("Removed wallet event listeners");
        } catch (error: unknown) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.warn("Could not remove wallet event listeners:", errorMsg);
        }
      }
    };
  }, [onConnected, onDisconnected, connectWallet, requiredChainId]);

  return (
    <div className="wallet-connector">
      {!userAddress ? (
        <Button 
          type="button"
          onClick={connectWallet}
          className={cn("bg-blue-600 hover:bg-blue-700 text-white", buttonClassName)}
          disabled={isConnecting}
        >
          {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span className="font-medium text-sm truncate" title={userAddress}>
              {userAddress.substring(0, 6)}...{userAddress.substring(userAddress.length - 4)}
            </span>
            <Button 
              onClick={disconnectWallet} 
              className="ml-2 px-2 py-1 bg-transparent text-gray-500 hover:text-gray-700 text-xs"
            >
              Disconnect
            </Button>
          </div>
          
          {wrongNetwork && (
            <div className="flex items-center mt-1 text-yellow-600 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>Wrong network</span>
              <Button 
                onClick={switchNetwork} 
                className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs rounded"
              >
                Switch
              </Button>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-red-500 text-sm flex items-start">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
