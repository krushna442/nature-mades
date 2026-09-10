import type { Request, Response } from 'express';
import { ContactMessage } from '../models/ContactMessage.js';

export async function createMessage(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ message: 'Name, email, and message are required' });
      return;
    }

    const newMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      message: message.trim(),
    });

    res.status(201).json({
      message: 'Thank you for reaching out! Your message has been received.',
      id: newMessage._id.toString(),
    });
  } catch (error) {
    console.error('[Contact Controller Error]:', error);
    res.status(500).json({ message: 'Failed to submit message' });
  }
}
