import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getCertificate } from '../controllers/recordController.js';

const router = Router();

// GET /api/records/:recordId/certificate - Download PDF certificate for a record
router.get(
    '/:recordId/certificate',
    authenticateToken, // Protect the route
    getCertificate
);

// TODO: Add other record-related routes if needed (e.g., GET /api/records, GET /api/records/:recordId)

export default router;
