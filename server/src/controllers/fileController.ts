import { Request, Response } from 'express';
// import { ethers, Log } from 'ethers'; // No longer needed for minting here
import { calculateSha256 } from '../utils/hash.js';
// import { anchorHashOnChain, waitForTransaction, getContractInstance } from '../utils/blockchain.js'; // Backend no longer interacts with contract for minting
import { uploadBufferToIPFS, uploadJsonToIPFS } from '../utils/storage.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js'; // Still needed for usage checks

// Define an interface for the metadata object
interface FileMetadata {
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  storage_provider?: string; // Optional initially
  storage_ref?: string;      // Optional initially
  // user_id?: string;       // Will be added later
}

/**
 * Handles file upload requests.
 * - Expects a single file upload under the field name 'file'.
 * - Calculates the SHA-256 hash of the uploaded file.
 * - Uploads file and metadata JSON to IPFS via Pinata.
 * - Returns the IPFS URI of the metadata JSON (`tokenUri`) for the frontend to use in the minting transaction.
 *
 * @param {Request} req - The Express request object. Should contain the file in `req.file` and authenticated user in `req.user`.
 * @param {Response} res - The Express response object.
 */
export const handleFileUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded.' });
      return; // Explicitly return void
    }

    const file = req.file;
    const fileBuffer = file.buffer;
    const fileSize = file.size;
    const userId = req.user?.id; // Get user ID from authenticated request

    if (!userId) {
      // This shouldn't happen if authMiddleware is working
      console.error('[Upload Error] User ID not found on request.');
      res.status(401).json({ message: 'User authentication failed unexpectedly.' });
      return;
    }

    // Check if Supabase client is available before DB operations
    if (!supabaseAdmin) {
        console.error('[Upload Error] Supabase admin client not initialized.');
        res.status(500).json({ message: 'Database service unavailable.' });
        return;
    }

    // --- Check Usage Limits for Free Tier ---
    // TODO: Refine this check when paid plans are implemented.
    // For now, assume anyone without an active paid subscription is on the free tier.
    let isPaidUser = false;
    // Placeholder: Check for active subscription (requires subscriptions table)
    // const { data: subData, error: subError } = await supabaseAdmin
    //   .from('subscriptions')
    //   .select('status')
    //   .eq('user_id', userId) // Or team_id if subs are team-based
    //   .eq('status', 'active')
    //   .maybeSingle();
    // if (subData) isPaidUser = true;

    if (!isPaidUser) {
      console.log(`[Usage Check] User ${userId} is on Free Tier. Checking limits...`);
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('ip_record_count, storage_used_bytes')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error(`[Usage Check] Error fetching profile for user ${userId}:`, profileError);
        res.status(500).json({ message: 'Could not verify usage limits.' });
        return;
      }

      if (!profileData) {
         console.error(`[Usage Check] Profile not found for user ${userId}. Should have been created by trigger.`);
         res.status(404).json({ message: 'User profile not found.' });
         return;
      }

      // Check lifetime record limit (Innovator Tier: 5)
      const FREE_TIER_RECORD_LIMIT = 5;
      if (profileData.ip_record_count >= FREE_TIER_RECORD_LIMIT) {
        console.log(`[Usage Check] User ${userId} reached lifetime record limit (${profileData.ip_record_count}/${FREE_TIER_RECORD_LIMIT}).`);
        res.status(403).json({ message: `Innovator tier lifetime record limit (${FREE_TIER_RECORD_LIMIT}) reached. Please upgrade.` });
        return;
      }

      // Check storage limit (Innovator Tier: 100MB)
      const FREE_TIER_STORAGE_LIMIT_BYTES = 100 * 1024 * 1024;
      if (profileData.storage_used_bytes + fileSize > FREE_TIER_STORAGE_LIMIT_BYTES) {
         console.log(`[Usage Check] User ${userId} storage limit exceeded (Current: ${profileData.storage_used_bytes}, New: ${fileSize}, Limit: ${FREE_TIER_STORAGE_LIMIT_BYTES}).`);
         res.status(403).json({ message: `Innovator tier storage limit (${FREE_TIER_STORAGE_LIMIT_BYTES / 1024 / 1024}MB) exceeded. Please upgrade.` });
         return;
      }
       console.log(`[Usage Check] User ${userId} limits OK (Records: ${profileData.ip_record_count}/${FREE_TIER_RECORD_LIMIT}, Storage: ${profileData.storage_used_bytes + fileSize}/${FREE_TIER_STORAGE_LIMIT_BYTES}).`);
    } else {
       console.log(`[Usage Check] User ${userId} has an active paid subscription. Skipping free limits.`);
       // TODO: Implement paid tier limit checks here (monthly usage, etc.)
    }
    // --- End Usage Check ---


    // Calculate SHA-256 hash
    const sha256Hash = calculateSha256(fileBuffer);

    // Prepare metadata (database insertion will happen in a later step)
    const metadata: FileMetadata = { // Use the interface type
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      sha256Hash: sha256Hash,
      // Initialize optional fields explicitly if needed, or rely on assignment below
      // storage_provider: undefined,
      // storage_ref: undefined,
      // user_id will be added here later from authenticated request
    };

    console.log('Initial File Metadata:', metadata);

    // --- [Phase 2 - Access Control] Encryption Placeholder ---
    // TODO: Encrypt fileBuffer here using Lit Protocol or similar
    // const { encryptedFileBuffer, symmetricKey, accessControlConditions } = await encryptFileWithLit(fileBuffer, userId);
    // metadata.encryption_metadata = symmetricKey; // Store encrypted key or reference
    // metadata.access_control_ref = accessControlConditions; // Store conditions reference
    const fileBufferToUpload = fileBuffer; // Use original buffer for MVP
    console.log('[Placeholder] Skipping file encryption for MVP.');
    // --- End Placeholder ---

    // --- IPFS Upload ---
    // Upload the (potentially encrypted) buffer
    console.log(`Attempting to upload file "${file.originalname}" to IPFS via Pinata...`);
    const fileCid = await uploadBufferToIPFS(fileBufferToUpload, file.originalname); // Use uploadBufferToIPFS

    if (!fileCid) {
      // Error logged in uploadToIPFS
      res.status(500).json({ message: 'Failed to upload file to IPFS.' });
      return;
    }
    console.log(`File uploaded to IPFS. CID: ${fileCid}`);
    metadata.storage_provider = 'ipfs';
    metadata.storage_ref = fileCid; // This is the CID of the original file

    // --- Blockchain Anchoring Removed ---

    // --- Create and Upload Metadata JSON ---
    // TODO: Get actual asset name/description from request body or defaults
    const assetName = metadata.originalFilename; // Use filename as default name
    const assetDescription = `Timestamped asset: ${metadata.originalFilename}`;

    // Metadata JSON for the NFT standard
    const metadataJson = {
        name: assetName,
        description: assetDescription,
        image: `ipfs://${fileCid}`, // Link to the actual file on IPFS using fileCid
        properties: {
            fileHash: metadata.sha256Hash, // The crucial hash
            mimeType: metadata.mimeType,
            sizeBytes: metadata.sizeBytes,
            originalFilename: metadata.originalFilename,
            // anchoringTxHash: txResponse.hash, // Removed anchoring hash
            // Add other relevant metadata here if needed
        }
    };

    console.log('Generated Metadata JSON:', metadataJson);

    // Upload metadata JSON using Pinata SDK
    const metadataFilename = `${fileCid}.json`; // Name the metadata file using the asset CID
    const metadataCid = await uploadJsonToIPFS(metadataJson, metadataFilename); // Use uploadJsonToIPFS

    if (!metadataCid) {
        // Error logged in uploadToIPFS
        // TODO: Consider rollback/cleanup for file upload?
        res.status(500).json({ message: 'Failed to upload metadata JSON to IPFS.' });
        return;
    }
    console.log(`Metadata JSON uploaded to IPFS. CID: ${metadataCid}`);
    const tokenUri = `ipfs://${metadataCid}`; // This is the URI the user needs to mint

    // --- Mint NFT Removed (User handles this on frontend) ---

    // --- Save records to Database Removed (Handled by separate endpoint after minting) ---

    // --- Update Usage Limits Removed (Handled by separate endpoint after minting) ---


    // Respond with the necessary info for the frontend to initiate minting
    res.status(200).json({
      message: 'File uploaded and metadata prepared for minting.',
      tokenUri: tokenUri, // The URI for the safeMint function
      fileHash: metadata.sha256Hash, // For potential display/confirmation on frontend
      fileCid: fileCid, // For potential display/confirmation on frontend
      originalFilename: metadata.originalFilename
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Error processing file upload.' });
    // Implicitly returns void here
  }
};

/**
 * Handles confirmation of a successful NFT mint from the frontend.
 * - Expects minting details (txHash, tokenId, fileHash, fileCid, metadataCid) in the request body.
 * - Saves the file and IP record details to the Supabase database.
 * - Updates user usage limits.
 *
 * @param {Request} req - The Express request object. Body should contain minting details. User ID from `req.user`.
 * @param {Response} res - The Express response object.
 */
export const handleMintConfirmation = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const {
    txHash, // Minting transaction hash from frontend
    tokenId, // Minted token ID from frontend event/receipt
    fileHash, // Original file hash (passed back from frontend or re-fetched?)
    fileCid, // Original file CID (passed back from frontend)
    metadataCid, // Metadata JSON CID (passed back from frontend)
    originalFilename, // Original filename (passed back from frontend)
    mimeType, // File mime type (passed back or re-derived?)
    sizeBytes // File size (passed back or re-derived?)
  } = req.body;

  console.log(`[Mint Confirm] Received confirmation for user ${userId}, tokenId ${tokenId}, txHash ${txHash}`);

  // --- Input Validation ---
  if (!userId) {
    console.error('[Mint Confirm Error] User ID not found on request.');
    res.status(401).json({ message: 'User authentication failed unexpectedly.' });
    return;
  }
  if (!txHash || !tokenId || !fileHash || !fileCid || !metadataCid || !originalFilename || !mimeType || !sizeBytes) {
    console.error('[Mint Confirm Error] Missing required minting details in request body:', req.body);
    res.status(400).json({ message: 'Missing required minting details.' });
    return;
  }
   if (!supabaseAdmin) {
        console.error('[Mint Confirm Error] Supabase admin client not initialized.');
        res.status(500).json({ message: 'Database service unavailable.' });
        return;
    }
  // TODO: Add more robust validation (e.g., check format of hash, CID, tokenId)

  // --- Save records to Database ---
  let fileRecordId: string | null = null;
  let ipRecordId: string | null = null;

  try {
    // --- Save File Record ---
    console.log(`[Mint Confirm DB] Attempting to insert into 'files' for user ${userId}...`);
    const { data: fileData, error: fileError } = await supabaseAdmin
      .from('files')
      .insert({
        user_id: userId,
        original_filename: originalFilename,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        sha256_hash: fileHash,
        storage_provider: 'ipfs',
        storage_ref: fileCid, // File CID
      })
      .select('id')
      .single();

    if (fileError) {
        console.error(`[Mint Confirm DB Error] Failed inserting into 'files':`, fileError);
        throw fileError; // Rethrow to be caught by outer catch
    }
    if (!fileData || !fileData.id) {
        console.error(`[Mint Confirm DB Error] No ID returned after inserting into 'files'.`);
        throw new Error('Failed to retrieve inserted file ID.');
    }
    fileRecordId = fileData.id;
    console.log(`[Mint Confirm DB] 'files' record saved successfully. ID: ${fileRecordId}`);

    // --- Save IP Record ---
    console.log(`[Mint Confirm DB] Attempting to insert into 'ip_records' for file ${fileRecordId}...`);
    // TODO: Get actual asset name/description - maybe pass from frontend or use filename?
    const assetName = originalFilename;
    const assetDescription = `Timestamped asset: ${originalFilename}`;

    const { data: ipData, error: ipError } = await supabaseAdmin
      .from('ip_records')
      .insert({
        user_id: userId,
        file_id: fileRecordId,
        asset_name: assetName,
        asset_description: assetDescription,
        blockchain_tx_hash: txHash, // Minting TX hash
        nft_contract_address: process.env.VELTIS_IPNFT_CONTRACT_ADDRESS,
        nft_token_id: tokenId.toString(), // Ensure tokenId is string if needed by DB
        metadata_cid: metadataCid,
        status: 'minted', // Status is now confirmed minted
      })
      .select('id')
      .single();

    if (ipError) {
        console.error(`[Mint Confirm DB Error] Failed inserting into 'ip_records':`, ipError);
        // TODO: Consider deleting the 'files' record we just created for consistency?
        throw ipError; // Rethrow
    }
     if (!ipData || !ipData.id) {
        console.error(`[Mint Confirm DB Error] No ID returned after inserting into 'ip_records'.`);
        throw new Error('Failed to retrieve inserted IP record ID.');
    }
    ipRecordId = ipData.id;
    console.log(`[Mint Confirm DB] 'ip_records' record saved successfully. ID: ${ipRecordId}`);

    // --- Update Usage Limits in Profile using RPC ---
    console.log(`[Mint Confirm Usage] Calling RPC 'increment_user_usage' for user ${userId}...`);
    const { error: rpcError } = await supabaseAdmin.rpc('increment_user_usage', {
      user_id_input: userId,
      file_size_input: sizeBytes
    });

    if (rpcError) {
      // Log the error but don't fail the whole request, as the core records were saved.
      // Consider adding retry logic or background job for consistency if this becomes critical.
      console.error(`[Mint Confirm Usage Error] Failed RPC 'increment_user_usage' for user ${userId}:`, rpcError);
    } else {
      console.log(`[Mint Confirm Usage] RPC 'increment_user_usage' call successful for user ${userId}.`);
    }
    // --- End Usage Update ---

    console.log(`[Mint Confirm] Process completed successfully for user ${userId}, tokenId ${tokenId}.`);
    res.status(200).json({
      message: 'Minting confirmed and records saved successfully.',
      fileRecordId: fileRecordId,
      ipRecordId: ipRecordId,
      tokenId: tokenId,
      txHash: txHash
    });

  } catch (dbError: any) {
    console.error('[Mint Confirm DB Error] Failed to save records to database:', dbError);
    // TODO: Consider if cleanup is needed if one insert succeeds but the other fails
    res.status(500).json({ message: `Database error during mint confirmation: ${dbError.message}` });
    return;
  }
};
