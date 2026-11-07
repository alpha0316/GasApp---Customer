import type { User } from '@/lib/api/types';

// A signed-in account must have a name and an email before it can use the app.
export const needsName = (user: User | null) => !!user && !user.firstName.trim();
export const needsEmail = (user: User | null) => !!user && !user.email?.trim();

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim());
export const isValidPhone = (value: string) => value.replace(/\D/g, '').length >= 10;
