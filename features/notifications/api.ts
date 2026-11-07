import { api } from '@/lib/api/client';
import type { AppNotification, Page } from '@/lib/api/types';

export type NotificationPage = { notifications: AppNotification[]; unreadCount: number } & Page;

export const listNotifications = (page: number) =>
  api<NotificationPage>('/me/notifications', { query: { page } });

export const markRead = (id: string) => api<void>(`/me/notifications/${id}/read`, { method: 'POST' });

export const markAllRead = () => api<void>('/me/notifications/read-all', { method: 'POST' });

export const registerPushTokenApi = (token: string) =>
  api<void>('/me/push-token', { method: 'POST', body: { token } });

export const removePushTokenApi = (token: string) =>
  api<void>('/me/push-token', { method: 'DELETE', body: { token } });
