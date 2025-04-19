import { Router } from 'express';
import multer from 'multer';
import { verifyAsset } from '../controllers/verificationController.js';

const router = Router();

// Configure multer for in-memory storage for verification uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Same limit as regular upload for consistency
});

// Define the verification route
// POST /api/verify - Accepts 'file' upload or 'hash' in body
// This route is public (no authenticateToken middleware)
router.post('/', upload.single('file'), verifyAsset);

export default router;
