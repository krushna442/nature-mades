import type { Request, Response } from 'express';
import { Product } from '../models/Product.js';

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'featured',
      page = '1',
      limit = '24',
    } = req.query;

    const filter: Record<string, any> = {};

    if (category && category !== 'all') {
      filter.category = (category as string).toLowerCase().trim();
    }

    if (search) {
      const q = (search as string).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption: Record<string, any> = { featured: -1, createdAt: -1 };
    if (sortBy === 'price-asc' || sortBy === 'price-low') {
      sortOption = { price: 1 };
    } else if (sortBy === 'price-desc' || sortBy === 'price-high') {
      sortOption = { price: -1 };
    } else if (sortBy === 'rating' || sortBy === 'top-rated') {
      sortOption = { rating: -1, reviewCount: -1 };
    } else if (sortBy === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 24));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products: products.map(p => ({
        id: p._id.toString(),
        slug: p.slug,
        name: p.name,
        category: p.category,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        ingredients: p.ingredients,
        materials: p.materials,
        featured: p.featured,
        bestSeller: p.bestSeller,
        tags: p.tags,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[GetProducts Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
}

export async function getFeaturedProducts(_req: Request, res: Response): Promise<void> {
  try {
    const products = await Product.find({ featured: true })
      .limit(8)
      .lean()
      .exec();

    res.json(
      products.map(p => ({
        id: p._id.toString(),
        slug: p.slug,
        name: p.name,
        category: p.category,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        ingredients: p.ingredients,
        materials: p.materials,
        featured: p.featured,
        bestSeller: p.bestSeller,
        tags: p.tags,
      }))
    );
  } catch (error) {
    console.error('[GetFeatured Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve featured products' });
  }
}

export async function getBestSellerProducts(_req: Request, res: Response): Promise<void> {
  try {
    const products = await Product.find({ bestSeller: true })
      .limit(8)
      .lean()
      .exec();

    res.json(
      products.map(p => ({
        id: p._id.toString(),
        slug: p.slug,
        name: p.name,
        category: p.category,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        ingredients: p.ingredients,
        materials: p.materials,
        featured: p.featured,
        bestSeller: p.bestSeller,
        tags: p.tags,
      }))
    );
  } catch (error) {
    console.error('[GetBestSellers Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve best seller products' });
  }
}

export async function getProductBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug }).lean().exec();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({
      id: product._id.toString(),
      slug: product.slug,
      name: product.name,
      category: product.category,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      images: product.images,
      rating: product.rating,
      reviewCount: product.reviewCount,
      stock: product.stock,
      ingredients: product.ingredients,
      materials: product.materials,
      featured: product.featured,
      bestSeller: product.bestSeller,
      tags: product.tags,
    });
  } catch (error) {
    console.error('[GetProductBySlug Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve product details' });
  }
}
