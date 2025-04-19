import { Request, Response } from 'express';
import { calculateSha256 } from '../utils/hash.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';

// Basic validation for SHA-256 hash format (64 hex characters)
const isValidSha256 = (hash: string): boolean => /^[a-f0-9]{64}$/i.test(hash);

/**
 * Verifies a file or hash against Veltis Protocol records.
 * Accepts either a file upload ('file' field) or a 'hash' field in the request body.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const verifyAsset = async (req: Request, res: Response): Promise<void> => {
  let fileHash: string | null = null;

  try {
    // Check for file upload first
    if (req.file) {
      console.log('[Verify] Verifying uploaded file:', req.file.originalname);
      fileHash = calculateSha256(req.file.buffer);
    } else if (req.body?.hash) {
      // Check for hash in request body
      const providedHash = req.body.hash.startsWith('0x') ? req.body.hash.substring(2) : req.body.hash;
      if (isValidSha256(providedHash)) {
        fileHash = providedHash;
        console.log('[Verify] Verifying provided hash:', fileHash);
      } else {
        res.status(400).json({ message: 'Invalid SHA-256 hash format provided.' });
        return;
      }
    } else {
      res.status(400).json({ message: 'No file uploaded or hash provided for verification.' });
      return;
    }

    // Check Supabase client
    if (!supabaseAdmin) {
      console.error('[Verify] Supabase admin client not initialized.');
      res.status(500).json({ message: 'Verification service unavailable.' });
      return;
    }

    // Query database for matching hash in the 'files' table
    console.log(`[Verify] Querying 'files' table for hash: ${fileHash}`);
    const { data: matchingFiles, error: fileDbError } = await supabaseAdmin
      .from('files')
      .select('*') // Select all columns for simplicity
      .eq('sha256_hash', fileHash);

    if (fileDbError) {
      console.error('[Verify] Database query error (files):', fileDbError);
      res.status(500).json({ message: `Database error during verification: ${fileDbError.message}` });
      return;
    }

    if (!matchingFiles || matchingFiles.length === 0) {
      console.log(`[Verify] No records found for hash: ${fileHash}`);
      res.status(404).json({ message: 'Hash not found in Veltis Protocol records.' });
      return;
    }

    console.log(`[Verify] Found ${matchingFiles.length} file record(s) for hash: ${fileHash}`);

    // Fetch associated ip_records for each found file
    const results = [];
    for (const fileRecord of matchingFiles) {
    console.log(`[Verify] Querying 'ip_records' for file_id: ${fileRecord.id}`);
    const { data: ipRecords, error: ipDbError } = await supabaseAdmin
        .from('ip_records')
        .select('*') // Select all columns for simplicity
        .eq('file_id', fileRecord.id);

        if (ipDbError) {
            console.error(`[Verify] Database query error (ip_records for file ${fileRecord.id}):`, ipDbError);
            // Decide how to handle partial errors - skip this record or fail all? Skip for now.
            continue;
        }

        // Add combined info for each associated ip_record
        for (const ipRecord of ipRecords || []) {
             results.push({
                fileName: fileRecord.original_filename,
                fileHash: fileRecord.sha256_hash,
                fileCid: fileRecord.storage_ref,
                assetName: ipRecord.asset_name,
                status: ipRecord.status,
                timestamp: ipRecord.created_at, // Use ip_record timestamp
                anchoringTxHash: ipRecord.blockchain_tx_hash,
                nftContractAddress: ipRecord.nft_contract_address,
                nftTokenId: ipRecord.nft_token_id,
                metadataCid: ipRecord.metadata_cid,
            });
        }
    }

    if (results.length === 0) {
        // This case might occur if a file exists but has no associated ip_record yet
        console.log(`[Verify] No associated IP records found for hash: ${fileHash}`);
        res.status(404).json({ message: 'File hash found, but no associated timestamp record exists yet.' });
        return;
    }

    res.status(200).json({
      message: `Found ${results.length} record(s) matching the hash.`,
      results: results,
    });

  } catch (error: any) {
    console.error('[Verify] Unexpected error during verification:', error);
    res.status(500).json({ message: `Verification failed: ${error.message}` });
  }
};
