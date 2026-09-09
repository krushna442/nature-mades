import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import craftRoutes from './craft.routes.js';
import orderRoutes from './order.routes.js';
import contactRoutes from './contact.routes.js';
import { isDbConnected } from '../config/db.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: isDbConnected() ? 'connected' : 'disconnected',
  });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/crafts', craftRoutes);
router.use('/orders', orderRoutes);
router.use('/contact', contactRoutes);

export default router;
