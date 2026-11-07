import { useCallback, useState } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useQueryClient } from '@tanstack/react-query';
import { payOrder, verifyPayment, type PaymentOutcome } from './api';
import { ORDERS_KEY } from './hooks';
import { paymentKey } from './payment';

// Opens the Paystack page for one order, then checks the payment once when the browser
// closes. There is no automatic retry: the customer starts every new attempt.
export function usePaystackCheckout() {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);

  const checkout = useCallback(
    async (orderId: string): Promise<PaymentOutcome> => {
      setBusy(true);
      try {
        const { authorizationUrl, reference } = await payOrder(orderId, paymentKey(orderId));
        await WebBrowser.openAuthSessionAsync(authorizationUrl, Linking.createURL('payment'));
        const { outcome } = await verifyPayment(reference);
        return outcome;
      } finally {
        setBusy(false);
        void client.invalidateQueries({ queryKey: ORDERS_KEY });
      }
    },
    [client],
  );

  return { checkout, busy };
}
