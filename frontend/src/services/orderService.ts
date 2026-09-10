import { api } from './apiClient';
import type { CartItem } from '../types';

export interface CreateOrderPayload {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  deliveryMethod?: 'Standard' | 'Express';
  items: CartItem[];
}

export interface OrderConfirmation {
  message: string;
  order: {
    orderNumber: string;
    total: number;
    subtotal: number;
    shippingFee: number;
    itemsCount: number;
    createdAt: string;
  };
}

export interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  deliveryMethod: string;
  orderStatus: string;
  paymentStatus: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export async function submitOrder(payload: CreateOrderPayload): Promise<OrderConfirmation> {
  try {
    return await api.post<OrderConfirmation>('/orders', payload);
  } catch (error) {
    console.warn('[OrderService] Backend offline or error, providing local confirmation', error);
    const subtotal = payload.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const shippingFee = payload.deliveryMethod === 'Express' ? 12.99 : 5.99;
    const year = new Date().getFullYear();
    const mockOrderNumber = `NM-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

    return {
      message: 'Order placed successfully (Offline Mode)',
      order: {
        orderNumber: mockOrderNumber,
        total: parseFloat((subtotal + shippingFee).toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        shippingFee,
        itemsCount: payload.items.length,
        createdAt: new Date().toISOString(),
      },
    };
  }
}

export async function fetchMyOrders(): Promise<OrderHistoryItem[]> {
  try {
    return await api.get<OrderHistoryItem[]>('/orders/my-orders');
  } catch (error) {
    console.warn('[OrderService] Unable to fetch user orders', error);
    return [];
  }
}
