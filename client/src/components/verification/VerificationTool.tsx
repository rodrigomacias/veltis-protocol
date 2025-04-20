'use client'; // Client component for form interaction

import React, { useState } from 'react';
import axios from 'axios';
// Removed unused Search, Hash icons
import { UploadCloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Assuming Shadcn Tabs

// TODO: Replace with actual Shadcn components if added
const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props}>
      {children}
    </button>
);
Button.defaultProps = { variant: "default", size: "default" }; // Removed @ts-ignore
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
);


type VerifyStatus = 'idle' | 'verifying' | 'found' | 'not_found' | 'error';
type VerifyMode = 'file' | 'hash';

// Interface for the expected result structure from the backend
interface VerificationResult {
    fileName: string;
    fileHash: string;
    fileCid: string;
    assetName: string;
    status: string;
    timestamp: string;
    anchoringTxHash: string | null; // Note: This might be mintingTxHash now
    nftContractAddress: string | null;
    nftTokenId: string | null;
    metadataCid: string | null;
}

const VerificationTool: React.FC = () => {
  const [mode, setMode] = useState<VerifyMode>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputHash, setInputHash] = useState<string>('');
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<VerificationResult[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setInputHash(''); // Clear hash input if file is selected
      resetState();
    }
  };

  const handleHashChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputHash(event.target.value);
    setSelectedFile(null); // Clear file input if hash is entered
    resetState();
  };

  const resetState = () => {
    setStatus('idle');
    setErrorMessage(null);
    setResults([]);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetState();

    if (mode === 'file' && !selectedFile) {
      setErrorMessage('Please select a file to verify.');
      setStatus('error');
      return;
    }
    if (mode === 'hash' && !inputHash.trim()) {
      setErrorMessage('Please enter a SHA-256 hash to verify.');
      setStatus('error');
      return;
    }

    setStatus('verifying');

    try {
      let response;
      if (mode === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        response = await axios.post('/api/verify', formData, {
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (mode === 'hash') {
        response = await axios.post('/api/verify', { hash: inputHash.trim() }, {
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
        });
      } else {
          throw new Error("Invalid verification mode or missing input.");
      }


      if (response.status === 200 && response.data?.results) {
        setStatus('found');
        setResults(response.data.results);
        console.log('Verification successful:', response.data);
      } else {
        // This case might not be reached if backend returns 404/500 on error
        throw new Error(response.data?.message || 'Verification failed with status: ' + response.status);
      }

    } catch (error: unknown) { // Use unknown type for error
      console.error('Verification error:', error);
      let displayError = 'An unknown error occurred during verification.';
      if (axios.isAxiosError(error)) { // Check if it's an Axios error
          if (error.response?.status === 404) {
              setStatus('not_found');
              displayError = error.response?.data?.message || 'Record not found.';
          } else {
              setStatus('error');
              displayError = error.response?.data?.message || error.message;
          }
      } else if (error instanceof Error) {
          setStatus('error');
          displayError = error.message;
      }
      setErrorMessage(displayError);
    }
  };

  // Basic Link component for external URLs
  const ExternalLink = ({ href, children }: { href: string | null | undefined, children: React.ReactNode }) => {
    if (!href) return <span className="text-muted-foreground">N/A</span>;
    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{children}</a>;
  }

  // Helper to create explorer links (adjust base URLs as needed)
  const getExplorerLink = (type: 'tx' | 'address' | 'token', value: string | null | undefined): string | null => {
      if (!value) return null;
      // TODO: Use env variables for base URLs and network name
      const amoyScanBase = "https://amoy.polygonscan.com"; // Use Amoy explicitly
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? ''; // Get contract address
      switch(type) {
          case 'tx': return `${amoyScanBase}/tx/${value}`;
          case 'address': return `${amoyScanBase}/address/${value}`;
          case 'token': return contractAddress ? `${amoyScanBase}/nft/${contractAddress}/${value}` : null; // Use correct NFT path
          default: return null;
      }
  }
  const getIpfsLink = (cid: string | null | undefined): string | null => {
      if (!cid) return null;
      // TODO: Use env variable for preferred gateway
      return `https://gateway.pinata.cloud/ipfs/${cid}`; // Use Pinata gateway
  }


  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* TODO: Replace with Shadcn Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setMode('file')}
          className={`py-2 px-4 text-sm font-medium ${mode === 'file' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Verify by File
        </button>
        <button
          onClick={() => setMode('hash')}
          className={`py-2 px-4 text-sm font-medium ${mode === 'hash' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Verify by Hash
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'file' && (
          <div>
            <label htmlFor="verify-file-upload" className="block text-sm font-medium mb-1">
              Select File to Verify
            </label>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="verify-file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    </div>
                    <input id="verify-file-upload" type="file" className="hidden" onChange={handleFileChange} />
                </label>
            </div>
            {selectedFile && <p className="mt-2 text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
          </div>
        )}

        {mode === 'hash' && (
          <div>
            <label htmlFor="hash-input" className="block text-sm font-medium mb-1">
              Enter SHA-256 Hash
            </label>
            <Input
              id="hash-input"
              type="text"
              placeholder="Enter 64-character SHA-256 hash..."
              value={inputHash}
              onChange={handleHashChange}
              className="font-mono"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={status === 'verifying' || (mode === 'file' && !selectedFile) || (mode === 'hash' && !inputHash.trim())}
          className="w-full bio-button justify-center"
        >
          {status === 'verifying' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === 'verifying' ? 'Verifying...' : 'Verify Asset'}
        </Button>
      </form>

      {/* Verification Results */}
      <div className="mt-6 space-y-4">
        {status === 'found' && results.length > 0 && (
          <div className="p-4 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <div className="flex items-center gap-2 mb-2">
               <CheckCircle className="h-5 w-5" />
               <span className="font-medium">Record Found!</span>
            </div>
            {results.map((result, index) => (
                <div key={index} className="mt-2 pt-2 border-t border-green-300 dark:border-green-700/50 text-xs space-y-1">
                    <p><strong>Asset Name:</strong> {result.assetName}</p>
                    <p><strong>Original Filename:</strong> {result.fileName}</p>
                    <p><strong>Timestamp (UTC):</strong> {new Date(result.timestamp).toUTCString()}</p>
                    <p><strong>Status:</strong> {result.status}</p>
                    <p className="font-mono"><strong>File SHA-256:</strong> {result.fileHash}</p>
                    <p><strong>File IPFS CID:</strong> <ExternalLink href={getIpfsLink(result.fileCid)}>{result.fileCid}</ExternalLink></p>
                    <p><strong>Metadata IPFS CID:</strong> <ExternalLink href={getIpfsLink(result.metadataCid)}>{result.metadataCid}</ExternalLink></p>
                    {/* Display Minting TX Hash instead of Anchoring */}
                    <p><strong>Minting TX Hash:</strong> <ExternalLink href={getExplorerLink('tx', result.anchoringTxHash)}>{result.anchoringTxHash}</ExternalLink></p>
                    <p><strong>NFT Contract:</strong> <ExternalLink href={getExplorerLink('address', result.nftContractAddress)}>{result.nftContractAddress}</ExternalLink></p>
                    <p><strong>NFT Token ID:</strong> <ExternalLink href={getExplorerLink('token', result.nftTokenId)}>{result.nftTokenId}</ExternalLink></p>
                </div>
            ))}
          </div>
        )}
        {status === 'not_found' && (
           <div className="mt-4 p-3 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
             <div className="flex items-center gap-2">
               <AlertCircle className="h-5 w-5" />
               <span className="font-medium">Not Found</span>
             </div>
             <p className="text-sm mt-1">{errorMessage}</p>
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
    </div>
  );
};

export default VerificationTool;
