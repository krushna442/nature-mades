export interface Product {
  id: string;
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
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface CraftVideo {
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

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'customer' | 'admin';
}

export interface AdminStats {
  totalRevenue: number;
  orderCount: number;
  productCount: number;
  userCount: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    orderStatus: string;
    createdAt: string;
  }>;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: { email: string; phone?: string; firstName: string; lastName: string };
  shippingAddress: { address: string; city: string; state: string; zip: string };
  items: Array<{
    productId: string;
    slug: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    description?: string;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  deliveryMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  avatar?: string;
  createdAt: string;
}
