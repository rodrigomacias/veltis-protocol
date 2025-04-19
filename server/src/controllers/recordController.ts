import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabaseAdmin.js';
import { generateCertificatePDF } from '../utils/certificateGenerator.js';

/**
 * Fetches an IP record and generates a PDF certificate for it.
 * Ensures the record belongs to the authenticated user.
 *
 * @param {Request} req - Express request object, containing recordId in params and user info.
 * @param {Response} res - Express response object.
 */
export const getCertificate = async (req: Request, res: Response): Promise<void> => {
  const { recordId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated.' });
    return;
  }

  if (!recordId) {
    res.status(400).json({ message: 'Record ID is required.' });
    return;
  }

  if (!supabaseAdmin) {
    console.error('[Certificate] Supabase admin client not initialized.');
    res.status(500).json({ message: 'Database service unavailable.' });
    return;
  }

  try {
    // Fetch the specific ip_record first
    // Ensure the record belongs to the requesting user
    console.log(`[Certificate] Fetching ip_record ${recordId} for user ${userId}...`);
    const { data: recordData, error: recordFetchError } = await supabaseAdmin
      .from('ip_records')
      .select('*') // Select all columns for simplicity
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (recordFetchError) {
      console.error(`[Certificate] Error fetching ip_record ${recordId} for user ${userId}:`, recordFetchError);
      if (recordFetchError.code === 'PGRST116') {
         res.status(404).json({ message: 'IP Record not found or access denied.' });
      } else {
         res.status(500).json({ message: `Database error: ${recordFetchError.message}` }); // Corrected variable name
      }
      return;
    }

    if (!recordData) {
      res.status(404).json({ message: 'Record not found or access denied.' });
      return;
    }

    if (!recordData || !recordData.file_id) {
      res.status(404).json({ message: 'IP Record not found, incomplete, or access denied.' });
      return;
    }

    // Fetch the associated file data using file_id
    console.log(`[Certificate] Fetching file data for file_id ${recordData.file_id}...`);
    const { data: fileInfo, error: fileFetchError } = await supabaseAdmin
        .from('files')
        .select(`*`) // Select all columns cleanly
        .eq('id', recordData.file_id)
        .single();

    if (fileFetchError) {
         console.error(`[Certificate] Error fetching file ${recordData.file_id} for record ${recordId}:`, fileFetchError);
         res.status(500).json({ message: `Database error fetching file details: ${fileFetchError.message}` });
         return;
    }

     if (!fileInfo) {
        console.error(`[Certificate] File data missing for file_id ${recordData.file_id} associated with record ${recordId}.`);
        res.status(500).json({ message: 'Associated file data not found.' });
        return;
    }

    // Prepare data for PDF generation
    const certificateData = {
      // TODO: [Phase 2 - Access Control] Check Permissions Placeholder
      // Before returning certificate (or allowing file download later),
      // check if the requesting user (userId) meets the access control conditions.
      // Example:
      // const hasAccess = await checkAccessWithLit(
      //    userId,
      //    fileInfo.access_control_ref, // Reference to stored conditions
      //    fileInfo.encryption_metadata // Reference to stored encrypted key info
      // );
      // if (!hasAccess) {
      //    res.status(403).json({ message: 'Access denied based on conditions.' });
      //    return; // Stop execution
      // }
      // console.log(`[Placeholder] User ${userId} granted access to record ${recordId}.`);
      // --- End Placeholder ---

      ipRecordId: recordData.id,
      assetName: recordData.asset_name, // Check if potentially null? DB schema says TEXT
      originalFilename: fileInfo.original_filename, // Check if potentially null?
      sha256Hash: fileInfo.sha256_hash, // Should be NOT NULL
      timestamp: recordData.created_at, // Should be NOT NULL
      anchoringTxHash: recordData.blockchain_tx_hash, // Renamed to blockchain_tx_hash, can be null
      nftTokenId: recordData.nft_token_id, // Can be null
      fileCid: fileInfo.storage_ref, // Should be NOT NULL if file exists
      metadataCid: recordData.metadata_cid, // Should be NOT NULL if record exists
      contractAddress: recordData.nft_contract_address, // Can be null
    };

     // Add validation for essential fields before generating PDF
     if (!certificateData.ipRecordId || !certificateData.assetName || !certificateData.originalFilename || !certificateData.sha256Hash || !certificateData.timestamp || !certificateData.fileCid || !certificateData.metadataCid) {
        console.error(`[Certificate] Missing essential data for generating certificate for record ${recordId}. Data:`, certificateData);
        res.status(500).json({ message: 'Incomplete data found for certificate generation.' });
        return;
     }

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF(certificateData);

    // Send PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${recordId}.pdf"`);
    res.send(pdfBuffer);

    // TODO: [Phase 2 - Access Control] Decryption Placeholder for Download
    // If implementing a separate file download endpoint:
    // 1. Fetch fileInfo including encryption_metadata and access_control_ref.
    // 2. Perform the access check as shown above.
    // 3. If access granted, fetch the encrypted file buffer from IPFS (fileInfo.storage_ref).
    // 4. Decrypt the buffer using Lit Protocol and the encryption_metadata.
    //    const decryptedBuffer = await decryptFileWithLit(encryptedBuffer, fileInfo.encryption_metadata);
    // 5. Send the decryptedBuffer to the user.
    // --- End Placeholder ---

  } catch (error: any) {
    // Log the specific error type if possible
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Certificate] Error generating certificate for record ${recordId}:`, errorMessage, error); // Log full error too
    // Avoid sending detailed internal errors to the client
    res.status(500).json({ message: 'Failed to generate certificate due to an internal error.' });
  }
};
