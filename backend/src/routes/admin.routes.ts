import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getAdminStats,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers,
  updateUserRole,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);

router.get('/products', getAdminProducts);
router.post('/products', createAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/users', getAdminUsers);
router.patch('/users/:id/role', updateUserRole);

export default router;
