import type { Request, Response } from 'express';
import { Category } from '../models/Category.js';

export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean().exec();

    res.json(
      categories.map(c => ({
        id: c._id.toString(),
        slug: c.slug,
        name: c.name,
        description: c.description,
        image: c.image,
        productCount: c.productCount,
      }))
    );
  } catch (error) {
    console.error('[GetCategories Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve categories' });
  }
}
