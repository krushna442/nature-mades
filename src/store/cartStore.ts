import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '../types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  get itemCount(): number;
  get subtotal(): number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (product: Product) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );
          
          if (existingItemIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += 1;
            return { items: newItems, isOpen: true };
          }
          
          return {
            items: [...state.items, { product, quantity: 1 }],
            isOpen: true
          };
        });
      },
      
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId)
        }));
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.product.id !== productId)
            };
          }
          
          return {
            items: state.items.map((item) => 
              item.product.id === productId ? { ...item, quantity } : item
            )
          };
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      get itemCount() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      get subtotal() {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity, 
          0
        );
      }
    }),
    {
      name: 'nature-mades-cart',
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
    }
  )
);
