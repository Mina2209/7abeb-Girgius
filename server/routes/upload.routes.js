import { Router } from 'express';
import auth from '../middleware/auth.js';
import UploadController from '../controllers/upload.controller.js';

const router = Router();

// bind controller methods to routes
router.post('/presign', UploadController.presign);
router.get('/url', UploadController.url);
router.delete('/:key', auth, UploadController.remove);

// multipart
router.post('/multipart/initiate', UploadController.initiateMultipart);
router.post('/multipart/presign-part', UploadController.presignPart);
router.post('/multipart/complete', UploadController.completeMultipart);
router.post('/multipart/abort', UploadController.abortMultipart);

export default router;
