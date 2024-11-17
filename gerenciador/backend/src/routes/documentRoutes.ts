import { Router } from 'express';
import { uploadDocument, getDocuments } from '../controllers/documentController';

const router = Router();

// Routes
router.post('/upload', uploadDocument);
router.get('/', getDocuments);

export default router;
