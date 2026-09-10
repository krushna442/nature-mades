import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderByNumber,
} from '../controllers/order.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:orderNumber', getOrderByNumber);

export default router;
