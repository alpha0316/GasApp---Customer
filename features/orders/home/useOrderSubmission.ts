import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/features/auth/authStore';
import { PartialOrderError, usePlaceOrders } from '@/features/orders/hooks';
import { isPaid, outcomeNotice } from '@/features/orders/payment';
import { usePaystackCheckout } from '@/features/orders/usePaystackCheckout';
import type { PlanGroup } from '@/features/orders/orderPlan';
import type { Order, PaymentMethod } from '@/lib/api/types';
import { errorMessage } from '@/lib/api/client';
import { PLACEHOLDER_ADDRESSES } from './constants';

interface SubmitInput {
  groups: PlanGroup[];
  paymentMethod: PaymentMethod;
  address: string;
  point: { latitude: number; longitude: number };
  pickupTime: string;
  onDone: () => void;
}

export function useOrderSubmission() {
  const navigation = useNavigation();
  const email = useAuthStore((s) => s.user?.email);
  const placeOrders = usePlaceOrders();
  const { checkout, busy: paying } = usePaystackCheckout();

  // Pays each order in turn. Stops at the first order that is not paid; the customer can
  // pay the rest from the order screen.
  const payAll = async (orders: Order[]) => {
    for (const order of orders) {
      try {
        const outcome = await checkout(order.id);
        if (isPaid(outcome)) continue;
        const notice = outcomeNotice(outcome);
        if (notice) Alert.alert(notice.title, notice.message);
        return;
      } catch (error) {
        Alert.alert('Could not complete the payment', errorMessage(error));
        return;
      }
    }
  };

  const submit = async ({ groups, paymentMethod, address, point, pickupTime, onDone }: SubmitInput) => {
    if (paymentMethod === 'paystack' && !email) {
      Alert.alert('Email needed', 'Paystack needs an email address on your account. Pay with cash or add an email.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add email', onPress: () => navigation.navigate('AddContact', { channel: 'email' }) },
      ]);
      return;
    }
    const label = PLACEHOLDER_ADDRESSES.includes(address) ? 'Custom Location' : address;
    try {
      const orders = await placeOrders.mutateAsync({
        groups,
        deliveryAddress: { label: label.slice(0, 200), lat: point.latitude, lng: point.longitude },
        pickupTime,
        paymentMethod,
      });
      if (paymentMethod === 'paystack') await payAll(orders);
      onDone();
      navigation.navigate('FindingRider', { orderIds: orders.map((o) => o.id) });
    } catch (error) {
      if (error instanceof PartialOrderError) {
        Alert.alert(
          'Some orders were not placed',
          `${error.placed.length} of ${groups.length} orders were placed. ${errorMessage(error.cause)}`,
        );
        onDone();
        navigation.navigate('FindingRider', { orderIds: error.placed.map((o) => o.id) });
        return;
      }
      Alert.alert('Could not place your order', errorMessage(error));
    }
  };

  return { submit, isSubmitting: placeOrders.isPending || paying };
}
