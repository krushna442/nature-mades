import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, type IOrderItem } from '../models/Order.js';
import { Product } from '../models/Product.js';
import type { AuthRequest } from '../middleware/auth.js';

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `NM-${year}-${randomSuffix}`;
}

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      customer,
      shippingAddress,
      deliveryMethod = 'Standard',
      items,
    } = req.body;

    if (!customer?.email || !customer?.firstName || !customer?.lastName) {
      res.status(400).json({ message: 'Customer information is incomplete' });
      return;
    }

    if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip) {
      res.status(400).json({ message: 'Shipping address is incomplete' });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Order must contain at least one item' });
      return;
    }

    const orderItems: IOrderItem[] = [];
    let calculatedSubtotal = 0;

    // Validate inventory and prepare items with verified prices
    for (const item of items) {
      const product = await Product.findById(item.productId || item.product?.id);

      if (!product) {
        res.status(404).json({ message: `Product not found for item: ${item.name || item.productId}` });
        return;
      }

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      if (product.stock < quantity) {
        res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${quantity}`,
        });
        return;
      }

      // Atomically decrement stock
      product.stock -= quantity;
      await product.save();

      orderItems.push({
        productId: product._id.toString(),
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images?.[0] || '',
        description: product.shortDescription || product.description || '',
      });

      calculatedSubtotal += product.price * quantity;
    }

    const shippingFee = deliveryMethod === 'Express' ? 99 : 49;
    const total = parseFloat((calculatedSubtotal + shippingFee).toFixed(2));
    const orderNumber = generateOrderNumber();

    const newOrder = await Order.create({
      orderNumber,
      userId: req.user?.userId || undefined,
      customer: {
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone,
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
      },
      shippingAddress: {
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        zip: shippingAddress.zip.trim(),
      },
      deliveryMethod,
      shippingFee,
      subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
      total,
      items: orderItems,
      paymentStatus: 'paid',
      orderStatus: 'processing',
    });

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        orderNumber: newOrder.orderNumber,
        total: newOrder.total,
        subtotal: newOrder.subtotal,
        shippingFee: newOrder.shippingFee,
        itemsCount: newOrder.items.length,
        createdAt: newOrder.createdAt,
      },
    });
  } catch (error) {
    console.error('[CreateOrder Error]:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const orders = await Order.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(
      orders.map(o => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        total: o.total,
        subtotal: o.subtotal,
        shippingFee: o.shippingFee,
        deliveryMethod: o.deliveryMethod,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        items: o.items,
        shippingAddress: o.shippingAddress,
      }))
    );
  } catch (error) {
    console.error('[GetMyOrders Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
}

export async function getOrderByNumber(req: Request, res: Response): Promise<void> {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber }).lean().exec();

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      total: order.total,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      deliveryMethod: order.deliveryMethod,
      orderStatus: order.orderStatus,
      items: order.items,
    });
  } catch (error) {
    console.error('[GetOrderByNumber Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve order' });
  }
}
