import { Router } from 'express';
import { SayingController } from '../controllers/saying.controller.js';

const router = Router();

router.get('/', SayingController.getAll);
router.get('/:id', SayingController.getById);
router.post('/', SayingController.create);
router.put('/:id', SayingController.update);
router.delete('/:id', SayingController.delete);

export default router;
