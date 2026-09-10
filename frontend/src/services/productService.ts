import { api } from './apiClient';
import type { Product, Category } from '../types';
import { products as mockProducts } from '../data/products';
import { categories as mockCategories } from '../data/categories';

export interface GetProductsParams {
  category?: string;
  search?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchProducts(params: GetProductsParams = {}): Promise<ProductsResponse> {
  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.minPrice !== undefined) query.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString());
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.limit !== undefined) query.set('limit', params.limit.toString());

    const qs = query.toString();
    const endpoint = `/products${qs ? `?${qs}` : ''}`;
    return await api.get<ProductsResponse>(endpoint);
  } catch (error) {
    console.warn('[ProductService] Backend offline or error, serving mock products', error);

    // Fallback filter
    let filtered = [...mockProducts];
    if (params.category && params.category !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === params.category?.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (params.sortBy === 'price-asc' || params.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (params.sortBy === 'price-desc' || params.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (params.sortBy === 'rating' || params.sortBy === 'top-rated') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return {
      products: filtered,
      pagination: {
        page: params.page || 1,
        limit: params.limit || filtered.length,
        total: filtered.length,
        totalPages: 1,
      },
    };
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    return await api.get<Product[]>('/products/featured');
  } catch (error) {
    console.warn('[ProductService] Using mock featured products', error);
    return mockProducts.filter(p => p.featured).slice(0, 8);
  }
}

export async function fetchBestSellerProducts(): Promise<Product[]> {
  try {
    return await api.get<Product[]>('/products/bestsellers');
  } catch (error) {
    console.warn('[ProductService] Using mock bestsellers', error);
    return mockProducts.filter(p => p.bestSeller).slice(0, 8);
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await api.get<Product>(`/products/${slug}`);
  } catch (error) {
    console.warn(`[ProductService] Fetching mock product for slug: ${slug}`, error);
    return mockProducts.find(p => p.slug === slug) || null;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    return await api.get<Category[]>('/categories');
  } catch (error) {
    console.warn('[ProductService] Using mock categories', error);
    return mockCategories;
  }
}
