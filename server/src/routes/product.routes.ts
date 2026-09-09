import { Router } from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getBestSellerProducts,
  getProductBySlug,
} from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestSellerProducts);
router.get('/:slug', getProductBySlug);

export default router;
