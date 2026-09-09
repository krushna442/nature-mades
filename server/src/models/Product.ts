import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IProduct extends Document {
  slug: string;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  ingredients?: string[];
  materials?: string[];
  featured: boolean;
  bestSeller: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    price: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 10, min: 0 },
    ingredients: { type: [String], default: [] },
    materials: { type: [String], default: [] },
    featured: { type: Boolean, default: false, index: true },
    bestSeller: { type: Boolean, default: false, index: true },
    tags: { type: [String], default: [], index: true },
  },
  { timestamps: true }
);

// Compound indexes for high-throughput queries (1000 concurrent users)
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ featured: 1, createdAt: -1 });
ProductSchema.index({ bestSeller: 1, createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
