import { Router } from 'express';
import { getCrafts } from '../controllers/craft.controller.js';

const router = Router();

router.get('/', getCrafts);

export default router;
