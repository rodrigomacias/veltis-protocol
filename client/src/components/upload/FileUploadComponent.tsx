'use client'; // This component interacts with browser APIs (File API, fetch/axios)

'use client'; // This component interacts with browser APIs (File API, fetch/axios, window.ethereum)

import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers'; // Import ethers
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, Loader2, CheckCircle, AlertCircle, Info, Wallet, Zap } from 'lucide-react'; // Add Wallet, Zap icons
import { cn } from '@/lib/utils';
// Import the ABI - ensure the path is correct relative to this file
import VeltisIPNFT_ABI from '../../../../server/src/config/VeltisIPNFT.abi.json'; // Adjust path as needed

// TODO: Replace with actual Shadcn Button import if available after adding component
const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props}>
      {children}
    </button>
  );
// @ts-ignore
Button.defaultProps = { variant: "default", size: "default" };

// Define more granular statuses for the multi-step process
type UploadMintStatus =
  | 'idle'
  | 'checkingLimits'
  | 'uploadingFile' // Uploading file to backend for IPFS prep
  | 'preparingMetadata' // Backend preparing metadata URI
  | 'waitingForSignature' // Waiting for user to sign mint tx in wallet
  | 'minting' // Transaction sent, waiting for confirmation
  | 'confirmingBackend' // Mint confirmed, saving record to backend
  | 'success'
  | 'error';

// Interface for the response from the initial /upload endpoint
interface PrepareMintResponse {
  message: string;
  tokenUri: string;
  fileHash: string;
  fileCid: string;
  originalFilename: string;
}

// Interface for the data sent to the /confirm-mint endpoint
interface MintConfirmationPayload {
    txHash: string;
    tokenId: string;
    fileHash: string;
    fileCid: string;
    metadataCid: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
}

// Interface for the response from the /confirm-mint endpoint
interface MintConfirmationResponse {
    message: string;
    fileRecordId: string;
    ipRecordId: string;
    tokenId: string;
    txHash: string;
}

// Helper function to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const FREE_TIER_RECORD_LIMIT = 5;
const FREE_TIER_STORAGE_LIMIT_BYTES = 100 * 1024 * 1024; // 100MB

const FileUploadComponent: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadMintStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // const [uploadResult, setUploadResult] = useState<UploadResult | null>(null); // Old result type
  const [mintConfirmationResult, setMintConfirmationResult] = useState<MintConfirmationResponse | null>(null); // New result type
  const [profileData, setProfileData] = useState<{ ip_record_count: number; storage_used_bytes: number } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null); // Store connected wallet address
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null); // Add state for tx hash
  const supabase = createClient();

  // --- Wallet Connection ---
  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        // Request account access
        const accounts = await browserProvider.send("eth_requestAccounts", []);
        const walletSigner = await browserProvider.getSigner();
        setProvider(browserProvider);
        setSigner(walletSigner);
        setUserAddress(accounts[0]);
        console.log("Wallet connected:", accounts[0]);
        setErrorMessage(null); // Clear any previous errors
      } catch (error: any) {
        console.error("Failed to connect wallet:", error);
        setErrorMessage(`Failed to connect wallet: ${error?.message || 'Unknown error'}`);
        setStatus('error');
        setSigner(null);
        setUserAddress(null);
      }
    } else {
      setErrorMessage('Metamask (or other EIP-1193 provider) not detected. Please install it.');
      setStatus('error');
    }
  }, []);

  // Effect to check connection on load (optional, depends on desired UX)
  useEffect(() => {
    const checkConnection = async () => {
       if (typeof window.ethereum !== 'undefined') {
           const browserProvider = new ethers.BrowserProvider(window.ethereum);
           const accounts = await browserProvider.listAccounts();
           if (accounts.length > 0) {
               const walletSigner = await browserProvider.getSigner();
               setProvider(browserProvider);
               setSigner(walletSigner);
               setUserAddress(accounts[0].address); // Access address property
               console.log("Wallet already connected:", accounts[0].address);
           }
       }
    };
    checkConnection();

    // Listen for account changes
    const ethProvider = window.ethereum as any; // Cast to any to access .on
    if (ethProvider) {
        ethProvider.on('accountsChanged', (accounts: string[]) => {
            console.log("Accounts changed:", accounts);
            if (accounts.length > 0) {
                connectWallet(); // Reconnect with the new account
            } else {
                // Handle disconnection
                setSigner(null);
                setUserAddress(null);
                setProvider(null);
                console.log("Wallet disconnected");
            }
        });
    }

    // Cleanup listener on unmount
    return () => {
        const currentEthProvider = window.ethereum as any; // Cast again for cleanup
        if (currentEthProvider?.removeListener) {
            // Use a stable function reference or define the handler outside if needed for removal
            // For simplicity here, assuming connectWallet reference is stable enough or handle differently if issues arise
            // A more robust way might involve defining the handler function separately.
             try {
                 currentEthProvider.removeListener('accountsChanged', connectWallet);
                 console.log("Removed accountsChanged listener.");
             } catch (e) {
                 console.warn("Could not remove accountsChanged listener:", e);
             }
        }
    };

  }, [connectWallet]); // connectWallet is stable due to useCallback


  // --- Fetch User Profile Data ---
  useEffect(() => {
    // Renamed function to avoid conflict
    const fetchSupabaseUserData = async () => {
      setLoadingProfile(true);
      setStatus('checkingLimits'); // Indicate loading state
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('ip_record_count, storage_used_bytes')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setErrorMessage("Could not load your usage data.");
          setStatus('error'); // Set error status if profile fetch fails
        } else if (data) {
          setProfileData(data);
        } else {
             // Handle case where profile might not exist yet (though trigger should prevent this)
             console.warn("Profile data not found for user:", user.id);
             setProfileData({ ip_record_count: 0, storage_used_bytes: 0 }); // Assume defaults if not found
        }
      } else {
          setUserId(null);
          setProfileData(null);
      }
      setLoadingProfile(false);
      setStatus('idle'); // Reset status after loading
    };

    fetchSupabaseUserData();

    // Optional: Listen for auth changes if needed, though this component
    // should only be rendered when logged in based on parent logic.
    // const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    //   fetchUserData(); // Re-fetch on auth change
    // });

    // return () => {
    //   authListener?.subscription.unsubscribe();
    // };
  }, [supabase]); // Dependency array includes supabase client instance

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setStatus('idle');
      setErrorMessage(null);
      setMintConfirmationResult(null); // Reset result
    }
  };

  // Calculate if limits are reached
  const recordsLimitReached = profileData ? profileData.ip_record_count >= FREE_TIER_RECORD_LIMIT : false;
  const storageLimitReached = profileData && selectedFile ? (profileData.storage_used_bytes + selectedFile.size) > FREE_TIER_STORAGE_LIMIT_BYTES : false;
  const isOverLimit = recordsLimitReached || storageLimitReached;
  // TODO: Add check for paid user status here later
  // Simplified button disabling logic based on feedback
  const isButtonDisabled = !selectedFile || !signer || !userAddress || ![ 'idle', 'success', 'error'].includes(status);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || !signer || !userAddress) {
      setErrorMessage('Please select a file and connect your wallet.');
      setStatus('error');
      return;
    }
    if (isOverLimit) {
      setErrorMessage("Usage limit reached. Please upgrade your plan.");
      setStatus('error');
      return;
    }

    setStatus('uploadingFile');
    setErrorMessage(null);
    setMintConfirmationResult(null);
    setMintTxHash(null); // Reset tx hash state
    let prepareMintData: PrepareMintResponse | null = null;
    // let mintTxHash: string | null = null; // Moved to state
    let mintedTokenId: string | null = null;

    try {
      // --- Step 1: Prepare Metadata via Backend ---
      setStatus('preparingMetadata');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error(sessionError?.message || 'User not authenticated.');
      const token = session.access_token;

      const formData = new FormData();
      formData.append('file', selectedFile);

      const prepareResponse = await axios.post<PrepareMintResponse>('/api/files/upload', formData, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (prepareResponse.status !== 200 || !prepareResponse.data?.tokenUri) {
        throw new Error(prepareResponse.data?.message || 'Failed to prepare metadata.');
      }
      prepareMintData = prepareResponse.data;
      console.log('Metadata prepared:', prepareMintData);

      // --- Step 2: User Minting ---
      setStatus('waitingForSignature');
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
          console.error("NEXT_PUBLIC_CONTRACT_ADDRESS is not set in environment variables.");
          throw new Error("Contract address configuration is missing. Cannot mint.");
      }

      const contract = new ethers.Contract(contractAddress, VeltisIPNFT_ABI, signer);

      console.log(`Attempting to mint with URI: ${prepareMintData.tokenUri} to address: ${userAddress}`);
      const mintTransaction = await contract.safeMint(userAddress, prepareMintData.tokenUri);
      setMintTxHash(mintTransaction.hash); // Set state variable
      console.log('Mint transaction sent:', mintTransaction.hash);
      setStatus('minting');

      const receipt = await mintTransaction.wait(1); // Wait for 1 confirmation
      if (!receipt) throw new Error('Mint transaction receipt not received.');
      console.log('Mint transaction confirmed:', receipt.hash);

      // Find the Transfer event to get the tokenId
      const transferEvent = receipt.logs?.find((log: any) => {
          try {
              const parsedLog = contract.interface.parseLog(log);
              // Minting emits Transfer from address(0)
              return parsedLog?.name === 'Transfer' && parsedLog?.args.from === ethers.ZeroAddress;
          } catch { return false; }
      });

      if (!transferEvent) throw new Error('Could not find Transfer event in mint receipt.');

      const parsedLog = contract.interface.parseLog(transferEvent as ethers.Log); // Type assertion
      mintedTokenId = parsedLog?.args.tokenId.toString();
      console.log('Minted Token ID:', mintedTokenId);

      if (!mintedTokenId) throw new Error('Failed to extract Token ID from mint transaction.');


      // --- Step 3: Confirm Mint with Backend ---
      setStatus('confirmingBackend');
      const metadataCid = prepareMintData.tokenUri.replace('ipfs://', ''); // Extract CID
      const currentMintTxHash = mintTransaction.hash; // Use hash from the transaction object

      const confirmationPayload: MintConfirmationPayload = {
        txHash: currentMintTxHash, // Use the hash from the sent transaction
        tokenId: mintedTokenId,
        fileHash: prepareMintData.fileHash,
        fileCid: prepareMintData.fileCid,
        metadataCid: metadataCid,
        originalFilename: prepareMintData.originalFilename,
        mimeType: selectedFile.type, // Get from selected file
        sizeBytes: selectedFile.size, // Get from selected file
      };

      const confirmResponse = await axios.post<MintConfirmationResponse>('/api/files/confirm-mint', confirmationPayload, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (confirmResponse.status !== 200 || !confirmResponse.data) {
        throw new Error(confirmResponse.data?.message || 'Failed to confirm mint with backend.');
      }

      setStatus('success');
      setMintConfirmationResult(confirmResponse.data);
      console.log('Mint confirmation successful:', confirmResponse.data);

      // Refresh profile data after successful mint confirmation
      if (userId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('ip_record_count, storage_used_bytes')
          .eq('id', userId)
          .single();
        if (!error && data) setProfileData(data);
      }

    } catch (error: any) {
      console.error('Minting process error:', error);
      setStatus('error');
      // Provide more specific error messages based on the step?
      setErrorMessage(error.response?.data?.message || error.message || 'An unknown error occurred during the minting process.');
    }
  };

  // Helper to get status message
  const getStatusMessage = () => {
    switch (status) {
      case 'checkingLimits': return 'Checking usage limits...';
      case 'uploadingFile': return 'Uploading file...';
      case 'preparingMetadata': return 'Preparing metadata on IPFS...';
      case 'waitingForSignature': return 'Please confirm mint transaction in your wallet...';
      // Access mintTxHash from state here
      case 'minting': return `Minting IPNFT on Polygon (Tx: ${mintTxHash ? mintTxHash.substring(0, 10) + '...' : 'Sending'})...`;
      case 'confirmingBackend': return 'Saving record...';
      case 'success': return 'IPNFT Created Successfully!';
      case 'error': return 'Error Occurred';
      default: return 'Create IPNFT';
    }
  };

  return (
    <div className="w-full p-4 border border-border rounded-lg bg-card text-card-foreground">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TODO: [Access Control] Add UI elements here for user to define access conditions (e.g., dropdown, address input) before upload */}
        <label htmlFor="file-upload" className="block text-sm font-medium mb-1">
          Select File to Timestamp
        </label>
        <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-1 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    {/* <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p> */}
                </div>
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
            </label>
        </div>
        {selectedFile && (
          <p className="text-sm text-muted-foreground">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
        )}

        {/* Wallet Connect Button */}
        {!userAddress && (
            <Button
                type="button"
                onClick={connectWallet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-center"
                disabled={status !== 'idle' && status !== 'error'}
            >
                <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
            </Button>
        )}
        {userAddress && (
             <p className="text-xs text-muted-foreground text-center truncate">Connected: {userAddress}</p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full bio-button justify-center" // Assuming bio-button provides styling
        >
          { (status !== 'idle' && status !== 'success' && status !== 'error') && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getStatusMessage()}
        </Button>
      </form>

      {/* Usage Info & Limit Warnings */}
      {!loadingProfile && profileData && (
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
            <p>Records Used: {profileData.ip_record_count} / {FREE_TIER_RECORD_LIMIT} (Lifetime)</p>
            <p>Storage Used: {formatBytes(profileData.storage_used_bytes)} / {formatBytes(FREE_TIER_STORAGE_LIMIT_BYTES)}</p>
            {recordsLimitReached && (
                 <p className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Lifetime record limit reached.
                 </p>
            )}
            {storageLimitReached && !recordsLimitReached && (
                 <p className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Upload exceeds storage limit.
                 </p>
            )}
             {isOverLimit && (
                 <p className="text-primary font-medium">Please upgrade to the Startup plan for higher limits.</p> // TODO: Link to /pricing
             )}
        </div>
      )}
       {loadingProfile && (
           <p className="mt-3 text-xs text-muted-foreground">Loading usage data...</p>
       )}


      {/* Status Messages */}
      {status === 'success' && mintConfirmationResult && (
        <div className="mt-4 p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
          <div className="flex items-center gap-2">
             <CheckCircle className="h-5 w-5" />
             <span className="font-medium">Success!</span>
          </div>
          <p className="text-sm mt-1">IPNFT minted successfully (Token ID: {mintConfirmationResult.tokenId}). Record saved.</p>
          <p className="text-xs mt-1 truncate">Mint Tx: {mintConfirmationResult.txHash}</p>
          {/* Optionally add link to PolygonScan */}
          {/* <a href={`https://polygonscan.com/tx/${mintConfirmationResult.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View on PolygonScan</a> */}
        </div>
      )}
      {status === 'error' && errorMessage && (
         <div className="mt-4 p-3 rounded-md bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
           <div className="flex items-center gap-2">
             <AlertCircle className="h-5 w-5" />
             <span className="font-medium">Error</span>
           </div>
           <p className="text-sm mt-1">{errorMessage}</p>
         </div>
      )}
    </div>
  );
};

export default FileUploadComponent;
