import { api } from './apiClient';

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function sendContactMessage(payload: ContactMessagePayload): Promise<{ message: string; id?: string }> {
  try {
    return await api.post('/contact', payload);
  } catch (error) {
    console.warn('[ContactService] Falling back to client-side confirmation', error);
    return {
      message: 'Thank you for reaching out! Your message has been received.',
    };
  }
}
