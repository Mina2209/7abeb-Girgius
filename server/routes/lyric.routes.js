import { Router } from 'express';
import { LyricController } from '../controllers/lyric.controller.js';
import { authenticate, requireEditor } from '../middleware/auth.js';

const router = Router();

// Public GET routes
router.get('/', LyricController.getAll);
router.get('/search', LyricController.search);
router.get('/hymn/:hymnId', LyricController.getByHymnId);
router.get('/:id', LyricController.getById);

// Protected routes - require authentication and editor/admin role
router.post('/', authenticate, requireEditor, LyricController.create);
router.put('/hymn/:hymnId/bulk', authenticate, requireEditor, LyricController.bulkUpsert);
router.put('/:id', authenticate, requireEditor, LyricController.update);
router.delete('/:id', authenticate, requireEditor, LyricController.delete);

export default router;
