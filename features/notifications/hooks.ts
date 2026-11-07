import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listNotifications, markAllRead, markRead } from './api';

export const NOTIFICATIONS_KEY = ['notifications'] as const;

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: NOTIFICATIONS_KEY,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => listNotifications(pageParam),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });
}

export function useMarkRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markRead,
    onSuccess: () => client.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });
}

export function useMarkAllRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => client.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });
}
