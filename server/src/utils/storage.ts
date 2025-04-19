import * as pinataSDK from '@pinata/sdk'; // Import the entire module as a namespace
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

if (!pinataApiKey || !pinataSecretApiKey) {
  console.error(
    'Storage Error: Missing PINATA_API_KEY or PINATA_SECRET_API_KEY in environment variables.'
  );
   // Handle appropriately
}

// Use 'any' type again due to import/type issues
let pinata: any | null = null;
if (pinataApiKey && pinataSecretApiKey) {
  // Attempt to instantiate using the default export within the namespace
  // The actual constructor might be named differently, but 'default' is common
  // If this fails, the next attempt might be pinataSDK.PinataClient or similar
  const PinataClientConstructor = (pinataSDK as any).default || pinataSDK;
  pinata = new PinataClientConstructor(pinataApiKey, pinataSecretApiKey);
  // Test authentication
  pinata
    .testAuthentication()
    .then(() => console.log('[storage] Pinata client authenticated successfully.'))
    .catch((err: any) => { // Add type 'any' to caught error
      console.error('[storage] Pinata authentication failed:', err);
      pinata = null; // Prevent usage if auth fails
    });
}

/**
 * Uploads a file buffer to IPFS via Pinata.
 *
 * @param {Buffer} buffer - The file content as a buffer.
 * @param {string} filename - The original filename (used for Pinata metadata).
 * @returns {Promise<string | null>} The IPFS Content Identifier (CID) if successful, otherwise null.
 * @throws {Error} If the Pinata client is not initialized or authenticated.
 */
export const uploadBufferToIPFS = async (
  buffer: Buffer,
  filename: string
): Promise<string | null> => {
  if (!pinata) {
    throw new Error(
      'Pinata client not initialized or authenticated. Check environment variables and connection.'
    );
  }

  try {
    console.log(`[storage] Uploading file buffer "${filename}" to IPFS via Pinata...`);
    // Convert buffer to readable stream
    const stream = Readable.from(buffer);

    const options = {
      pinataMetadata: {
        name: filename,
        // keyvalues: { customKey: 'customValue' } // Optional custom metadata
      },
      pinataOptions: {
        cidVersion: 0, // Use CID v0 for wider compatibility unless v1 is needed
      },
    };

    // Pinata SDK requires stream type information which isn't directly available
    // Need to add 'path' property to the stream object for the SDK
    // See: https://github.com/PinataCloud/pinata-node-sdk/issues/84#issuecomment-1 Pinata SDK requires stream type information which isn't directly available
    (stream as any).path = filename; // Add path property hack

    const result = await pinata.pinFileToIPFS(stream, options);
    console.log(`[storage] File buffer uploaded successfully. CID: ${result.IpfsHash}`);
    return result.IpfsHash; // Pinata returns IpfsHash
  } catch (error) {
    console.error('[storage] Error uploading file buffer to Pinata:', error);
    return null;
  }
};


/**
 * Uploads a JSON object to IPFS via Pinata.
 *
 * @param {object} json - The JSON object to upload.
 * @param {string} filename - A filename for the JSON (used for Pinata metadata).
 * @returns {Promise<string | null>} The IPFS Content Identifier (CID) if successful, otherwise null.
 * @throws {Error} If the Pinata client is not initialized or authenticated.
 */
export const uploadJsonToIPFS = async (
    json: object,
    filename: string
  ): Promise<string | null> => {
    if (!pinata) {
      throw new Error(
        'Pinata client not initialized or authenticated. Check environment variables and connection.'
      );
    }

    try {
      console.log(`[storage] Uploading JSON "${filename}" to IPFS via Pinata...`);
      const options = {
        pinataMetadata: {
          name: filename,
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };
      const result = await pinata.pinJSONToIPFS(json, options);
      console.log(`[storage] JSON uploaded successfully. CID: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      console.error('[storage] Error uploading JSON to Pinata:', error);
      return null;
    }
  };


// Note: Pinata automatically handles pinning. Status checking might involve
// querying the pin list API endpoint if needed, which is different from web3.storage.
// We can add a getPinList function later if required.
