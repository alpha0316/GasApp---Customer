import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { CircleNotch } from 'phosphor-react-native';
import CancelOrderModal from '@/features/orders/components/CancelOrderModal';
import { useCancelOrders, useOrder, useOrders } from '@/features/orders/hooks';
import { isPaid, outcomeNotice } from '@/features/orders/payment';
import { usePaystackCheckout } from '@/features/orders/usePaystackCheckout';
import { hasRider } from '@/features/orders/status';
import { errorMessage } from '@/lib/api/client';

export default function FindingRider() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderIds } = route.params as { orderIds: string[] };
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const cancelOrders = useCancelOrders();
  // The socket refreshes this query when a rider accepts; it also polls as a fallback.
  const { data } = useOrder(orderIds[0]);
  const orders = useOrders(orderIds);
  const { checkout, busy: paying } = usePaystackCheckout();
  const unpaidIds = orders.flatMap((q, i) =>
    q.data?.order.status === 'pending_payment' ? [orderIds[i]] : [],
  );

  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1, false);
  }, [spin]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const status = data?.order.status;

  useEffect(() => {
    if (!status) return;
    if (hasRider(status)) {
      // Replace, so Back from the tracker does not return to the search screen.
      navigation.dispatch(StackActions.replace('Tracker', { orderId: orderIds[0], orderIds }));
    } else if (status === 'cancelled' || status === 'refunded') {
      navigation.navigate('Home');
    }
  }, [status, navigation, orderIds]);

  // The customer starts every payment attempt. Nothing here retries on its own.
  const handlePay = async () => {
    for (const id of unpaidIds) {
      try {
        const outcome = await checkout(id);
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

  const handleCancel = async () => {
    try {
      await cancelOrders.mutateAsync(orderIds);
      setCancelModalVisible(false);
      navigation.navigate('Home');
    } catch (error) {
      setCancelModalVisible(false);
      Alert.alert('Could not cancel the order', errorMessage(error));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Animated.View style={spinStyle}>
            <CircleNotch size={32} color="#007AFF" weight="bold" />
          </Animated.View>
        </View>

        <Text style={styles.title}>{unpaidIds.length > 0 ? 'Waiting for payment' : 'Finding your rider...'}</Text>
        <Text style={styles.subtitle}>
          {unpaidIds.length > 0
            ? 'Pay with Paystack and we will match you with the nearest available rider.'
            : data?.order.paymentMethod === 'paystack'
              ? "We're matching you with the nearest available rider. Your payment is held until delivery."
              : "We're matching you with the nearest available rider. Pay the rider in cash on delivery."}
        </Text>

        {unpaidIds.length > 0 && (
          <TouchableOpacity style={styles.payButton} onPress={handlePay} disabled={paying}>
            <Text style={styles.payButtonText}>{paying ? 'Opening Paystack…' : 'Pay Now'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => setCancelModalVisible(true)}>
          <Text style={styles.cancel}>Cancel Order</Text>
        </TouchableOpacity>
      </View>

      <CancelOrderModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        // The API takes no cancel reason, so the choice stays on the device.
        onConfirm={handleCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,122,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 8,
  },
  payButton: {
    backgroundColor: '#007AFF',
    borderRadius: 28,
    height: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D92D20',
  },
});
