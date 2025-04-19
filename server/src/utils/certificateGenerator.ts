import PDFDocument from 'pdfkit'; // Use ES Module import
import { Writable } from 'stream';

// Define a type for the expected input data (adjust based on actual data structure)
interface CertificateData {
  ipRecordId: string;
  assetName: string;
  originalFilename: string;
  sha256Hash: string;
  timestamp: string; // ISO string format expected
  anchoringTxHash: string | null;
  nftTokenId: string | null;
  fileCid: string | null;
  metadataCid: string | null;
  contractAddress: string | null;
}

/**
 * Generates a PDF certificate buffer for a timestamped asset.
 *
 * @param {CertificateData} data - The data to include in the certificate.
 * @returns {Promise<Buffer>} A promise that resolves with the PDF buffer.
 */
export const generateCertificatePDF = (data: CertificateData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', (err: Error) => { // Add Error type
      reject(err);
    });

    // --- PDF Content ---

    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Veltis Protocol - Proof of Existence Certificate', { align: 'center' });
    doc.moveDown(2);

    // Record Details
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Asset Name:', { continued: true }).font('Helvetica').text(` ${data.assetName}`);
    doc.text('Original Filename:', { continued: true }).font('Helvetica').text(` ${data.originalFilename}`);
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Timestamp (UTC):', { continued: true }).font('Helvetica').text(` ${new Date(data.timestamp).toUTCString()}`);
    doc.moveDown();

    // File Details
    doc.fontSize(10).font('Helvetica-Bold').text('File Details:');
    doc.font('Helvetica').list([
        `SHA-256 Hash: ${data.sha256Hash}`,
        `IPFS CID (File): ${data.fileCid ?? 'N/A'}`,
    ], { bulletRadius: 2, textIndent: 10 });
    doc.moveDown();

    // Blockchain Details
    doc.fontSize(10).font('Helvetica-Bold').text('Blockchain Record:');
    doc.font('Helvetica').list([
        `Anchoring Transaction Hash: ${data.anchoringTxHash ?? 'N/A'}`,
        `NFT Contract Address: ${data.contractAddress ?? 'N/A'}`,
        `NFT Token ID: ${data.nftTokenId ?? 'N/A'}`,
        `Metadata IPFS CID: ${data.metadataCid ?? 'N/A'}`, // Use the passed metadataCid
    ], { bulletRadius: 2, textIndent: 10 });
    doc.moveDown(2);

    // Footer / Disclaimer
    doc
      .fontSize(8)
      .font('Helvetica-Oblique')
      .text(
        `Certificate generated on: ${new Date().toUTCString()}. ` +
        `Record ID: ${data.ipRecordId}. ` +
        `Verification details can be cross-referenced using the provided hashes and CIDs on the respective networks/systems.`,
        { align: 'center' }
      );

    // --- End PDF Content ---

    doc.end();
  });
};
