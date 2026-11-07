import { api } from '@/lib/api/client';
import type { OtpChannel, User } from '@/lib/api/types';

export interface AuthResult {
  token: string;
  user: User;
  isNewUser?: boolean;
}

export const requestOtp = (channel: OtpChannel, target: string) =>
  api<void>('/auth/otp/request', { method: 'POST', body: { channel, target } });

// The customer app never sends `role`: the server default is "customer".
export const verifyOtp = (channel: OtpChannel, target: string, code: string) =>
  api<AuthResult>('/auth/otp/verify', { method: 'POST', body: { channel, target, code } });

export const googleSignIn = (idToken: string) =>
  api<AuthResult>('/auth/google', { method: 'POST', body: { idToken } });

export const getMe = () => api<{ user: User }>('/me').then((r) => r.user);

export const updateMe = (input: { firstName?: string; lastName?: string }) =>
  api<{ user: User }>('/me', { method: 'PATCH', body: input }).then((r) => r.user);

// Adds a phone (`sms`) or email to the signed-in account. Request an OTP to the target first.
export const addContact = (channel: OtpChannel, target: string, code: string) =>
  api<{ user: User }>('/me/contact', { method: 'POST', body: { channel, target, code } }).then((r) => r.user);

export const passwordLogin = (identifier: string, password: string) =>
  api<AuthResult>('/auth/login', { method: 'POST', body: { identifier, password } });

// 204. `currentPassword` is required when the account already has a password.
export const setPassword = (newPassword: string, currentPassword?: string) =>
  api<void>('/auth/password', { method: 'POST', body: { newPassword, currentPassword } });
