import { create } from 'zustand';

interface SearchStore {
  query: string;
  category: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  isSearchOpen: boolean;
  setQuery: (query: string) => void;
  setCategory: (category: string) => void;
  setSortBy: (sort: SearchStore['sortBy']) => void;
  toggleSearch: () => void;
  closeSearch: () => void;
  reset: () => void;
}

const initialState = {
  query: '',
  category: 'all',
  sortBy: 'featured' as const,
  isSearchOpen: false,
};

export const useSearchStore = create<SearchStore>((set) => ({
  ...initialState,
  
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  setSortBy: (sortBy) => set({ sortBy }),
  
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeSearch: () => set({ isSearchOpen: false }),
  
  reset: () => set({ 
    query: initialState.query,
    category: initialState.category,
    sortBy: initialState.sortBy
  }),
}));
