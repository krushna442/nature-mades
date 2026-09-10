import { Router } from 'express';
import { createMessage } from '../controllers/contact.controller.js';

const router = Router();

router.post('/', createMessage);

export default router;
