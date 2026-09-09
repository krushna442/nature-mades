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
}
