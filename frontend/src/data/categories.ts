import type { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'c-1',
    slug: 'candles',
    name: 'Candles',
    description: 'Hand-poured artisan candles made with natural soy and beeswax.',
    image: '/images/categories/candles.jpg',
    productCount: 42,
  },
  {
    id: 'c-2',
    slug: 'soaps',
    name: 'Soaps',
    description: 'Cold-processed handmade soaps with natural botanicals.',
    image: '/images/categories/soaps.jpg',
    productCount: 38,
  },
  {
    id: 'c-3',
    slug: 'oils',
    name: 'Oils',
    description: 'Pure essential oils and nourishing botanical body blends.',
    image: '/images/categories/oils.jpg',
    productCount: 25,
  },
  {
    id: 'c-4',
    slug: 'crafts',
    name: 'Crafts',
    description: 'Unique artisan crafts made from sustainable natural materials.',
    image: '/images/categories/crafts.jpg',
    productCount: 15,
  },
  {
    id: 'c-5',
    slug: 'bamboo',
    name: 'Bamboo',
    description: 'Eco-friendly bamboo essentials for sustainable living.',
    image: '/images/categories/bamboo.jpg',
    productCount: 20,
  },
  {
    id: 'c-6',
    slug: 'gift-sets',
    name: 'Gift Sets',
    description: 'Curated collections perfect for any special occasion.',
    image: '/images/categories/gift-sets.jpg',
    productCount: 12,
  },
];
