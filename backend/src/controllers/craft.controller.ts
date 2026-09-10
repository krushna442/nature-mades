import type { Request, Response } from 'express';
import { CraftVideo } from '../models/CraftVideo.js';

export async function getCrafts(_req: Request, res: Response): Promise<void> {
  try {
    const crafts = await CraftVideo.find().sort({ id: 1 }).lean().exec();

    res.json(
      crafts.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        videoUrl: c.videoUrl,
        posterUrl: c.posterUrl,
        productId: c.productId,
        artisan: c.artisan,
        category: c.category,
        duration: c.duration,
      }))
    );
  } catch (error) {
    console.error('[GetCrafts Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve craft videos' });
  }
}
