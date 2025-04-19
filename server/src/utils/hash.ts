import crypto from 'crypto';

/**
 * Calculates the SHA-256 hash of a buffer.
 *
 * @param {Buffer} buffer - The file buffer to hash.
 * @returns {string} The SHA-256 hash as a hexadecimal string.
 */
export function calculateSha256(buffer: Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}
