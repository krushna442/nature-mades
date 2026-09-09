import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ICraftVideo extends Document {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
  productId?: string;
  artisan: string;
  category: string;
  duration: string;
}

const CraftVideoSchema = new Schema<ICraftVideo>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    posterUrl: { type: String, required: true },
    productId: { type: String },
    artisan: { type: String, required: true },
    category: { type: String, required: true, index: true },
    duration: { type: String, required: true },
  },
  { timestamps: true }
);

export const CraftVideo: Model<ICraftVideo> =
  mongoose.models.CraftVideo || mongoose.model<ICraftVideo>('CraftVideo', CraftVideoSchema);
