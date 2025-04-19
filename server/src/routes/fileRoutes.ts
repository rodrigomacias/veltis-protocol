import { Router } from 'express';
import multer from 'multer';
import { handleFileUpload, handleMintConfirmation } from '../controllers/fileController.js'; // Import new handler
import { authenticateToken } from '../middleware/authMiddleware.js'; // Import auth middleware

const router = Router(); // Initialize the router

// Configure multer for in-memory storage
// This is suitable for processing the file (e.g., hashing) before potentially
// uploading it elsewhere (like IPFS). Adjust limits as needed.
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Example: 10MB limit
});

// Define the file upload route
// POST /api/files/upload
router.post(
  '/upload',
  authenticateToken, // Apply authentication middleware first
  upload.single('file'),
  handleFileUpload
);
// The 'file' string in upload.single('file') must match the name attribute
// of the file input field in the frontend form.

// Define the mint confirmation route
// POST /api/files/confirm-mint
router.post(
    '/confirm-mint',
    authenticateToken, // Protect this route as well
    handleMintConfirmation // Use the new handler
);

export default router;
