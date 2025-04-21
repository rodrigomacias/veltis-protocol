'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers, Signer, Log, EventLog, InterfaceAbi } from 'ethers';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import WalletConnector from '../blockchain/WalletConnector';

// Import the ABI with dynamic import (bypassing TypeScript issues)
// @ts-expect-error - Import JSON file directly
import * as rawAbi from '@/config/VeltisIPNFT.abi.json';
// Cast the imported ABI to the correct type
const contractAbi: InterfaceAbi = rawAbi as unknown as InterfaceAbi;

// Temporary Button component - replace with Shadcn Button when available
const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button 
    className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} 
    {...props}
  >
    {children}
  </button>
);

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
  const [mintConfirmationResult, setMintConfirmationResult] = useState<MintConfirmationResponse | null>(null);
  const [profileData, setProfileData] = useState<{ ip_record_count: number; storage_used_bytes: number } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const supabase = createClient();

  // --- Fetch User Profile Data ---
  useEffect(() => {
    const fetchSupabaseUserData = async () => {
      setLoadingProfile(true);
      setStatus('checkingLimits');
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
          setStatus('error');
        } else if (data) {
          setProfileData(data);
        } else {
             console.warn("Profile data not found for user:", user.id);
             setProfileData({ ip_record_count: 0, storage_used_bytes: 0 });
        }
      } else {
          setUserId(null);
          setProfileData(null);
      }
      setLoadingProfile(false);
      setStatus('idle');
    };

    fetchSupabaseUserData();
  }, [supabase]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setStatus('idle');
      setErrorMessage(null);
      setMintConfirmationResult(null);
    }
  };

  // Calculate if limits are reached
  const recordsLimitReached = profileData ? profileData.ip_record_count >= FREE_TIER_RECORD_LIMIT : false;
  const storageLimitReached = profileData && selectedFile ? (profileData.storage_used_bytes + selectedFile.size) > FREE_TIER_STORAGE_LIMIT_BYTES : false;
  const isOverLimit = recordsLimitReached || storageLimitReached;
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
    setMintTxHash(null);
    let prepareMintData: PrepareMintResponse | null = null;
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

      const contract = new ethers.Contract(contractAddress, contractAbi, signer);

      console.log(`Attempting to mint with URI: ${prepareMintData.tokenUri} to address: ${userAddress}`);
      const mintTransaction = await contract.safeMint(userAddress, prepareMintData.tokenUri);
      setMintTxHash(mintTransaction.hash);
      console.log('Mint transaction sent:', mintTransaction.hash);
      setStatus('minting');

      const receipt = await mintTransaction.wait(1);
      if (!receipt) throw new Error('Mint transaction receipt not received.');
      console.log('Mint transaction confirmed:', receipt.hash);

      // Find the Transfer event to get the tokenId
      const transferEvent = receipt?.logs?.find((log: Log | EventLog): log is EventLog => {
          try {
              if (!('topics' in log) || !('data' in log)) return false;
              const parsedLog = contract.interface.parseLog({ topics: log.topics as string[], data: log.data });
              return parsedLog?.name === 'Transfer' && parsedLog?.args.from === ethers.ZeroAddress;
          } catch { return false; }
      });

      if (!transferEvent || !('topics' in transferEvent) || !('data' in transferEvent)) {
          throw new Error('Could not find valid Transfer event in mint receipt.');
      }

      const parsedLog = contract.interface.parseLog({ topics: transferEvent.topics as string[], data: transferEvent.data });
      mintedTokenId = parsedLog?.args.tokenId.toString();
      console.log('Minted Token ID:', mintedTokenId);

      if (!mintedTokenId) throw new Error('Failed to extract Token ID from mint transaction.');


      // --- Step 3: Confirm Mint with Backend ---
      setStatus('confirmingBackend');
      const metadataCid = prepareMintData.tokenUri.replace('ipfs://', '');
      const currentMintTxHash = mintTransaction.hash;

      const confirmationPayload: MintConfirmationPayload = {
        txHash: currentMintTxHash,
        tokenId: mintedTokenId,
        fileHash: prepareMintData.fileHash,
        fileCid: prepareMintData.fileCid,
        metadataCid: metadataCid,
        originalFilename: prepareMintData.originalFilename,
        mimeType: selectedFile.type,
        sizeBytes: selectedFile.size,
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

      if (userId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('ip_record_count, storage_used_bytes')
          .eq('id', userId)
          .single();
        if (!error && data) setProfileData(data);
      }

    } catch (error: unknown) { // Use unknown
      console.error('Minting process error:', error);
      setStatus('error');
      let displayError = 'An unknown error occurred during the minting process.';
       if (axios.isAxiosError(error) && error.response?.data) {
             try {
                const errorJson = JSON.parse(await (error.response.data as Blob).text());
                if (errorJson.message) displayError = errorJson.message;
             } catch { // Removed unused variable
                 if (error instanceof Error && error.message) displayError = error.message;
             }
        } else if (error instanceof Error) {
            displayError = error.message;
        }
      setErrorMessage(displayError);
    }
  };

  // Helper to get status message
  const getStatusMessage = () => {
    switch (status) {
      case 'checkingLimits': return 'Checking usage limits...';
      case 'uploadingFile': return 'Uploading file...';
      case 'preparingMetadata': return 'Preparing metadata on IPFS...';
      case 'waitingForSignature': return 'Please confirm mint transaction in your wallet...';
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
                </div>
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
            </label>
        </div>
        {selectedFile && (
          <p className="text-sm text-muted-foreground">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
        )}

        <WalletConnector 
          onConnected={(address, walletSigner) => {
            setUserAddress(address);
            setSigner(walletSigner);
          }}
          onDisconnected={() => {
            setUserAddress(null);
            setSigner(null);
          }}
          buttonClassName="w-full justify-center" 
        />

        <Button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full bio-button justify-center"
        >
          { (status !== 'idle' && status !== 'success' && status !== 'error') && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getStatusMessage()}
        </Button>
      </form>

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
                 <p className="text-primary font-medium">Please upgrade to the Startup plan for higher limits.</p>
             )}
        </div>
      )}
       {loadingProfile && (
           <p className="mt-3 text-xs text-muted-foreground">Loading usage data...</p>
       )}

      {status === 'success' && mintConfirmationResult && (
        <div className="mt-4 p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
          <div className="flex items-center gap-2">
             <CheckCircle className="h-5 w-5" />
             <span className="font-medium">Success!</span>
          </div>
          <p className="text-sm mt-1">IPNFT minted successfully (Token ID: {mintConfirmationResult.tokenId}). Record saved.</p>
          <p className="text-xs mt-1 truncate">Mint Tx: {mintConfirmationResult.txHash}</p>
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
