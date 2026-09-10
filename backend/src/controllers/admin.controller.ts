import type { Response } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import type { AuthRequest } from '../middleware/auth.js';

// GET /api/admin/stats
export async function getAdminStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [orderCount, productCount, userCount, revenueAgg, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().sort({ createdAt: -1 }).limit(5).lean().exec(),
    ]);

    res.json({
      totalRevenue: revenueAgg[0]?.total || 0,
      orderCount,
      productCount,
      userCount,
      recentOrders: recentOrders.map(o => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        customer: `${o.customer.firstName} ${o.customer.lastName}`,
        total: o.total,
        orderStatus: o.orderStatus,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error('[AdminStats Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve admin stats' });
  }
}

// GET /api/admin/products?search=&category=&page=&limit=
export async function getAdminProducts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, category, page = '1', limit = '20' } = req.query;
    const filter: Record<string, any> = {};

    if (category && category !== 'all') {
      filter.category = (category as string).toLowerCase().trim();
    }
    if (search) {
      const q = (search as string).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean().exec(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products: products.map(p => ({ ...p, id: p._id.toString() })),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('[AdminProducts Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
}

// POST /api/admin/products
export async function createAdminProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, category, description, shortDescription, price, compareAtPrice, images, stock, ingredients, materials, featured, bestSeller, tags } = req.body;

    if (!name || !category || !description || !shortDescription || price === undefined) {
      res.status(400).json({ message: 'Name, category, description, shortDescription, and price are required' });
      return;
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await Product.findOne({ slug });
    if (existing) {
      res.status(409).json({ message: 'A product with a similar name already exists' });
      return;
    }

    const product = await Product.create({
      slug,
      name: name.trim(),
      category: category.toLowerCase().trim(),
      description,
      shortDescription,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      images: images || [],
      stock: stock !== undefined ? Number(stock) : 10,
      ingredients: ingredients || [],
      materials: materials || [],
      featured: featured || false,
      bestSeller: bestSeller || false,
      tags: tags || [],
    });

    res.status(201).json({ message: 'Product created', product: { ...product.toObject(), id: product._id.toString() } });
  } catch (error) {
    console.error('[CreateProduct Error]:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
}

// PUT /api/admin/products/:id
export async function updateAdminProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates._id;
    delete updates.id;

    const product = await Product.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).lean().exec();
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ message: 'Product updated', product: { ...product, id: product._id.toString() } });
  } catch (error) {
    console.error('[UpdateProduct Error]:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
}

// DELETE /api/admin/products/:id
export async function deleteAdminProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('[DeleteProduct Error]:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
}

// GET /api/admin/orders?page=&limit=
export async function getAdminOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean().exec(),
      Order.countDocuments(),
    ]);

    res.json({
      orders: orders.map(o => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        customer: o.customer,
        shippingAddress: o.shippingAddress,
        items: o.items,
        subtotal: o.subtotal,
        shippingFee: o.shippingFee,
        total: o.total,
        deliveryMethod: o.deliveryMethod,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('[AdminOrders Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
}

// PATCH /api/admin/orders/:id/status
export async function updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const order = await Order.findByIdAndUpdate(id, { $set: { orderStatus } }, { new: true }).lean().exec();
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json({ message: 'Order status updated', order: { id: order._id.toString(), orderNumber: order.orderNumber, orderStatus: order.orderStatus } });
  } catch (error) {
    console.error('[UpdateOrderStatus Error]:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
}

// GET /api/admin/users?search=&page=&limit=
export async function getAdminUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const filter: Record<string, any> = {};

    if (search) {
      const q = (search as string).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean().exec(),
      User.countDocuments(filter),
    ]);

    res.json({
      users: users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        createdAt: u.createdAt,
      })),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('[AdminUsers Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
}

// PATCH /api/admin/users/:id/role
export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['customer', 'admin'].includes(role)) {
      res.status(400).json({ message: 'Role must be either customer or admin' });
      return;
    }

    if (role === 'admin') {
      res.status(403).json({
        message: 'Only the single designated master account (admin@naturemades.com) can hold admin privileges.',
      });
      return;
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (targetUser.email === 'admin@naturemades.com') {
      res.status(400).json({ message: 'Cannot modify primary administrator account role' });
      return;
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      message: 'User role updated',
      user: {
        id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.error('[UpdateUserRole Error]:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
}
