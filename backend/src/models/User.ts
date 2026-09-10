import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IUserAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  avatar?: string;
  role: 'customer' | 'admin';
  providers: {
    local?: { enabled: boolean };
    google?: { id: string; email: string };
    instagram?: { id: string; username: string };
  };
  addresses: IUserAddress[];
  savedProducts: mongoose.Types.ObjectId[];
  resetPasswordOtp?: {
    code: string;
    expiresAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserAddressSchema = new Schema<IUserAddress>(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String },
    avatar: { type: String },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      index: true,
    },
    providers: {
      local: { enabled: { type: Boolean, default: true } },
      google: {
        id: { type: String, sparse: true, index: true },
        email: { type: String },
      },
      instagram: {
        id: { type: String, sparse: true, index: true },
        username: { type: String },
      },
    },
    addresses: [UserAddressSchema],
    savedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    resetPasswordOtp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Compound / secondary indexes for concurrent lookups

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
