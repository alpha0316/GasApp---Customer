import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import {
  CaretRight,
  Key,
  Package,
  ShareNetwork,
  Shield,
  Star,
} from 'phosphor-react-native';
import BackButton from '@/components/BackButton';
import RatingSheet from '@/features/orders/components/RatingSheet';
import { useOrder, useRateOrder } from '@/features/orders/hooks';
import { toOrderItem, type OrderItem } from '@/features/orders/orderView';
import { SIZE_NAME } from '@/features/orders/status';
import { useStations } from '@/features/catalog/hooks';
import { displayMoney } from '@/lib/money';
import { errorMessage } from '@/lib/api/client';
import type { OrderStatus } from '@/lib/api/types';

const PRIMARY = '#007AFF';
const GREEN = '#52B922';
const RED = '#D92D20';

function statusMeta(status: OrderStatus): { label: string; color: string; bg: string } {
  if (status === 'delivered') return { label: 'Delivered', color: GREEN, bg: 'rgba(82,185,34,0.10)' };
  if (status === 'cancelled' || status === 'refunded') {
    return { label: status === 'refunded' ? 'Refunded' : 'Cancelled', color: RED, bg: 'rgba(217,45,32,0.08)' };
  }
  if (status === 'pending_payment') return { label: 'Pending Payment', color: '#B8860B', bg: 'rgba(184,134,11,0.10)' };
  return { label: 'In Progress', color: PRIMARY, bg: 'rgba(0,122,255,0.10)' };
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function Waypoint({ label, time, isLast }: { label: string; time: string; isLast?: boolean }) {
  return (
    <View style={styles.waypointRow}>
      <View style={styles.waypointMarkerCol}>
        <View style={[styles.waypointDot, isLast && styles.waypointDotFilled]} />
        {!isLast && <View style={styles.waypointLine} />}
      </View>
      <View style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
        <Text style={styles.waypointLabel}>{label}</Text>
      </View>
      <Text style={styles.waypointTime}>{time}</Text>
    </View>
  );
}

export default function OrderDetails() {
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };
  const orderQuery = useOrder(orderId);
  const stationsQuery = useStations();

  if (!orderQuery.data) {
    return (
      <View style={[styles.main, { alignItems: 'center', justifyContent: 'center', gap: 12 }]}>
        {orderQuery.isError ? (
          <TouchableOpacity onPress={() => orderQuery.refetch()} accessibilityRole="button">
            <Text>{errorMessage(orderQuery.error)} Tap to try again.</Text>
          </TouchableOpacity>
        ) : (
          <ActivityIndicator accessibilityLabel="Loading order" />
        )}
      </View>
    );
  }

  return <OrderDetailsContent order={toOrderItem(orderQuery.data.order, stationsQuery.data ?? [])} />;
}

function OrderDetailsContent({ order }: { order: OrderItem }) {
  const [ratingVisible, setRatingVisible] = useState(false);
  const rateOrder = useRateOrder(order.id);

  const rating = order.rating;
  const meta = statusMeta(order.status);
  const cylinder = { name: SIZE_NAME[order.size] };
  const money = displayMoney(order.total, order.currency);
  const createdAt = new Date(order.createdAt);
  const isCompleted = order.status === 'delivered' || order.status === 'cancelled' || order.status === 'refunded';
  const dropoffAt = order.deliveredAt ? new Date(order.deliveredAt) : null;
  const timeLabel = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const handleShareReceipt = async () => {
    const lines = [
      'GasApp — Order Receipt',
      '--------------------------------',
      `Order ID: ${order.id}`,
      `Date: ${createdAt.toLocaleString()}`,
      `Status: ${meta.label}`,
      '',
      `Item: ${order.count} x ${cylinder.name}`,
      `Amount: ${money}`,
      `Payment method: ${order.paymentMethod === 'cash' ? 'Cash on delivery' : 'Paystack'}`,
      '',
      `Pickup station: ${order.stationName}`,
      `Delivered to: ${order.address}`,
      '--------------------------------',
      'Thank you for using GasApp.',
    ];
    try {
      await Share.share({ message: lines.join('\n') });
    } catch {
      // Share sheet dismissed/cancelled — nothing to do.
    }
  };

  const riderInitials = order.rider ? `${order.rider.firstName[0] ?? ''}${order.rider.lastName[0] ?? ''}`.toUpperCase() : '';

  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity style={styles.headerIconButton} onPress={handleShareReceipt}>
          <ShareNetwork size={18} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={[styles.titleIcon, { backgroundColor: meta.bg }]}>
            <Package size={22} color={meta.color} weight="fill" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.titleText}>{cylinder.name} Cylinder Delivery</Text>
            <Text style={styles.titleSubtext}>
              {createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {timeLabel(createdAt)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountValue}>{money}</Text>
          <Text style={styles.amountSubtext}>
            {order.paymentMethod === 'cash' ? 'Paid by cash on delivery' : 'Paid via Paystack'}
          </Text>
        </View>

        {order.rider && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Rider</Text>
            <View style={styles.riderRow}>
              <View style={styles.riderAvatar}>
                <Text style={styles.riderAvatarText}>{riderInitials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.riderName}>
                  {order.rider.firstName} {order.rider.lastName}
                </Text>
                {/* Rider's phone number is intentionally not shown here once
                    the order has a result (delivered/cancelled/refunded) —
                    contact only matters while a delivery is actively in
                    progress, which is handled on the live Tracker screen. */}
                <Text style={styles.riderSubtext}>
                  {isCompleted ? 'Delivery complete' : 'Contact available on the tracking screen'}
                </Text>
              </View>
              {order.status === 'delivered' && rating === null && (
                <TouchableOpacity style={styles.rateButton} onPress={() => setRatingVisible(true)}>
                  <Star size={14} weight="bold" color={PRIMARY} />
                  <Text style={styles.rateButtonText}>Rate</Text>
                </TouchableOpacity>
              )}
              {rating !== null && (
                <View style={styles.rateButton}>
                  <Star size={14} weight="fill" color="#F5A623" />
                  <Text style={[styles.rateButtonText, { color: '#F5A623' }]}>{rating}.0</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Trip</Text>
          <Waypoint label={order.stationName} time={timeLabel(createdAt)} />
          <Waypoint label={order.address} time={dropoffAt ? timeLabel(dropoffAt) : 'Pending'} isLast />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Order Summary</Text>
          <Row label="Order ID" value={`#${order.id.slice(-8)}`} />
          <Row label="Item" value={`${order.count} x ${cylinder.name}`} />
          <Row label="Pickup Station" value={order.stationName} />
          <Row label="Delivery Address" value={order.address} />
          <Row label="Pickup Time" value={order.pickupTime} />
          <Row label="Payment Method" value={order.paymentMethod === 'cash' ? 'Cash on delivery' : 'Paystack'} />
          <Row label="Amount" value={money} bold />
        </View>

        <TouchableOpacity style={styles.receiptButton} onPress={handleShareReceipt}>
          <ShareNetwork size={16} weight="bold" color="#fff" />
          <Text style={styles.receiptButtonText}>Share Receipt</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Help &amp; Safety</Text>

          <TouchableOpacity
            style={styles.helpRow}
            onPress={() => Alert.alert('Find Lost Item', 'Contact support with your order ID and we can help you reach your rider about a lost item.')}
          >
            <View style={styles.helpIcon}>
              <Key size={16} color={PRIMARY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.helpTitle}>Find lost item</Text>
              <Text style={styles.helpSubtitle}>We can help you get in touch about something left behind</Text>
            </View>
            <CaretRight size={16} color="rgba(0,0,0,0.3)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpRow}
            onPress={() => Alert.alert('Report Safety Issue', 'Contact support with your order ID to report any safety-related issues with this delivery.')}
          >
            <View style={styles.helpIcon}>
              <Shield size={16} color={PRIMARY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.helpTitle}>Report safety issue</Text>
              <Text style={styles.helpSubtitle}>Report any safety related issues to us</Text>
            </View>
            <CaretRight size={16} color="rgba(0,0,0,0.3)" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <RatingSheet
        visible={ratingVisible}
        riderName={order.rider?.firstName}
        onClose={() => setRatingVisible(false)}
        onSubmit={async (score, feedback) => {
          await rateOrder.mutateAsync({ score, comment: feedback || undefined });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  titleSubtext: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  amountSubtext: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 16,
    gap: 12,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  riderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  riderName: {
    fontSize: 14,
    fontWeight: '700',
  },
  riderSubtext: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,122,255,0.08)',
  },
  rateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
  waypointRow: {
    flexDirection: 'row',
    gap: 12,
  },
  waypointMarkerCol: {
    alignItems: 'center',
    width: 12,
  },
  waypointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: '#fff',
  },
  waypointDotFilled: {
    backgroundColor: PRIMARY,
  },
  waypointLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginTop: 2,
  },
  waypointLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  waypointTime: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowLabel: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
    flexShrink: 0,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  rowValueBold: {
    fontWeight: '700',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 9999,
    backgroundColor: '#000',
  },
  receiptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0,122,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  helpSubtitle: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
});
