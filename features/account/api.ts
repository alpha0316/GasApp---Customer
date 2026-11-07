import { api } from '@/lib/api/client';

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  // Honeypot: the form never fills it.
  website?: string;
}

export const sendContactMessage = (input: ContactInput) =>
  api<void>('/contact', { method: 'POST', body: input });
