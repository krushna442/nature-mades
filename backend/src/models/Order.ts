import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  customer: {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  deliveryMethod: string;
  shippingFee: number;
  subtotal: number;
  total: number;
  items: IOrderItem[];
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customer: {
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    deliveryMethod: { type: String, required: true, default: 'Standard' },
    shippingFee: { type: Number, required: true, default: 5.99 },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    items: [OrderItemSchema],
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'paid',
    },
    orderStatus: {
      type: String,
      enum: ['processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ 'customer.email': 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
