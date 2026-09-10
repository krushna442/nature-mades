import { create } from 'zustand';
import { api } from '../services/apiClient';
import type { Product } from '../types';

interface WishlistState {
  wishlist: Product[];
  isLoading: boolean;
  error: string | null;
  notification: string | null;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: Product, isAuthenticated: boolean) => Promise<{ success: boolean; requiresLogin?: boolean; action?: 'added' | 'removed' }>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearNotification: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],
  isLoading: false,
  error: null,
  notification: null,

  clearNotification: () => set({ notification: null }),

  isInWishlist: (productId: string) => {
    return get().wishlist.some((item) => item.id === productId || item.slug === productId);
  },

  fetchWishlist: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nature-mades-token') : null;
    if (!token) {
      set({ wishlist: [] });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await api.get<{ wishlist: Product[] }>('/auth/wishlist');
      set({ wishlist: res.wishlist || [], isLoading: false, error: null });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (product: Product, isAuthenticated: boolean) => {
    if (!isAuthenticated) {
      // Prompt user to sign in first
      if (typeof window !== 'undefined') {
        localStorage.setItem('nature-mades-pending-wishlist', JSON.stringify(product));
      }
      set({ notification: 'Please sign in to save this handcrafted item to your wishlist.' });
      return { success: false, requiresLogin: true };
    }

    const currentlySaved = get().isInWishlist(product.id);

    // Optimistic UI update
    if (currentlySaved) {
      set({
        wishlist: get().wishlist.filter((item) => item.id !== product.id && item.slug !== product.slug),
        notification: `Removed "${product.name}" from your wishlist.`,
      });
    } else {
      set({
        wishlist: [product, ...get().wishlist],
        notification: `Saved "${product.name}" to your wishlist!`,
      });
    }

    try {
      await api.post(`/auth/wishlist/toggle/${product.id}`);
      return { success: true, action: currentlySaved ? 'removed' : 'added' };
    } catch {
      // Revert if API failed
      get().fetchWishlist();
      return { success: false };
    }
  },

  removeFromWishlist: async (productId: string) => {
    const prev = get().wishlist;
    set({
      wishlist: prev.filter((item) => item.id !== productId && item.slug !== productId),
    });

    try {
      await api.post(`/auth/wishlist/toggle/${productId}`);
    } catch {
      set({ wishlist: prev });
    }
  },
}));
