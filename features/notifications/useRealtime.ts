import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/authStore';
import { ORDERS_KEY, orderKey, type OrderDetail } from '@/features/orders/hooks';
import { NOTIFICATIONS_KEY } from './hooks';
import { registerPushToken } from './push';
import { OTP_INTEGRATION } from '@/lib/config';

// Keeps the socket open while the user is signed in and turns server events into
// query refreshes. Events sent while the socket was down are lost, so a reconnect
// refreshes everything.
export function useRealtime(): void {
  const client = useQueryClient();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    // The OTP bypass session has no token: the server would refuse the socket and sign the user out.
    if (status !== 'signedIn' || !OTP_INTEGRATION) return;

    const socket = connectSocket();
    const refreshOrders = () => client.invalidateQueries({ queryKey: ORDERS_KEY });
    const refreshNotifications = () => client.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    const refreshAll = () => {
      refreshOrders();
      refreshNotifications();
    };

    // The rider marker moves without a refetch.
    const moveRider = (e: { orderId: string; lat: number; lng: number; heading?: number | null; at: string }) => {
      client.setQueryData<OrderDetail>(orderKey(e.orderId), (old) =>
        old ? { ...old, riderLocation: { lat: e.lat, lng: e.lng, heading: e.heading ?? null, updatedAt: e.at } } : old,
      );
    };
    const onConnectError = (error: Error) => {
      if (error.message === 'Authentication required') void useAuthStore.getState().signOut();
    };

    socket.on('order:status', refreshOrders);
    socket.on('order:filled', refreshOrders);
    socket.on('rider:location', moveRider);
    socket.on('notification:new', refreshNotifications);
    socket.io.on('reconnect', refreshAll);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('order:status', refreshOrders);
      socket.off('order:filled', refreshOrders);
      socket.off('rider:location', moveRider);
      socket.off('notification:new', refreshNotifications);
      socket.io.off('reconnect', refreshAll);
      socket.off('connect_error', onConnectError);
      disconnectSocket();
    };
  }, [status, client]);

  useEffect(() => {
    if (status !== 'signedIn' || !OTP_INTEGRATION) return;
    registerPushToken().catch((error: unknown) => {
      console.warn('Push registration failed', error);
    });
  }, [status]);
}
