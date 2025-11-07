import { Router } from 'express';
import { HymnController } from '../controllers/hymn.controller.js';

const router = Router();

router.get('/', HymnController.getAll);
router.get('/:id', HymnController.getById);
router.post('/', HymnController.create);
router.put('/:id', HymnController.update);
router.delete('/:id', HymnController.delete);

export default router;
