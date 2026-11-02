import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Bell, CheckCircle, GasPump, Package, Tag } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppMenuButton from '@/components/AppMenu';

const PRIMARY = '#007AFF';
const PRIMARY_TINT = 'rgba(0,122,255,0.10)';
const GREEN = '#52B922';

type NotificationType = 'order' | 'rider' | 'delivered' | 'promo';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

// No notifications backend exists yet, so this is standalone sample data —
// mirrors the "looks real until integration starts" approach used for the
// Orders screen's FALLBACK_ORDERS. Swap for a real fetch + read/unread sync
// once that lands; the list UI below doesn't need to change.
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'rider',
    title: 'Rider is on the way',
    message: 'Kwame Osei Asiedu is heading to your location with your order.',
    createdAt: hoursAgo(0.3),
    read: false,
  },
  {
    id: 'n2',
    type: 'order',
    title: 'Order confirmed',
    message: 'Your medium cylinder order has been confirmed and a rider is being assigned.',
    createdAt: hoursAgo(1),
    read: false,
  },
  {
    id: 'n3',
    type: 'delivered',
    title: 'Delivered!',
    message: "Your small cylinder refill was delivered to Oxford St, Osu. Enjoy!",
    createdAt: hoursAgo(28),
    read: true,
  },
  {
    id: 'n4',
    type: 'promo',
    title: 'Weekend offer',
    message: 'Get your next refill at no delivery fee — valid this weekend only.',
    createdAt: hoursAgo(50),
    read: true,
  },
  {
    id: 'n5',
    type: 'delivered',
    title: 'Delivered!',
    message: 'Your large cylinder refill was delivered to Spintex Rd, Accra.',
    createdAt: hoursAgo(75),
    read: true,
  },
];

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function formatGroupLabel(ts: number): string {
  const date = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function iconFor(type: NotificationType) {
  if (type === 'rider') return { Icon: GasPump, color: PRIMARY, bg: PRIMARY_TINT };
  if (type === 'delivered') return { Icon: CheckCircle, color: GREEN, bg: 'rgba(82,185,34,0.10)' };
  if (type === 'promo') return { Icon: Tag, color: '#B8860B', bg: 'rgba(184,134,11,0.10)' };
  return { Icon: Package, color: PRIMARY, bg: PRIMARY_TINT };
}

function NotificationRow({ item, onRead }: { item: NotificationItem; onRead: () => void }) {
  const { Icon, color, bg } = iconFor(item.type);
  return (
    <TouchableOpacity style={styles.row} onPress={onRead} activeOpacity={0.7}>
      <View style={[styles.rowIcon, { backgroundColor: bg }]}>
        <Icon size={18} weight="fill" color={color} />
      </View>

      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.rowTitle, item.read && styles.rowTitleRead]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.rowTime}>{formatTime(Date.parse(item.createdAt))}</Text>
        </View>
        <Text style={styles.rowMessage}>{item.message}</Text>
      </View>

      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function Notification() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = items.filter((n) => !n.read).length;

  const groups = useMemo(() => {
    const sorted = [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    const map = new Map<string, NotificationItem[]>();
    sorted.forEach((n) => {
      const label = formatGroupLabel(Date.parse(n.createdAt));
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(n);
    });
    return Array.from(map.entries());
  }, [items]);

  const markRead = (id: string) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <View style={styles.main}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <AppMenuButton active="notifications" />
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {unreadCount > 0 && (
          <View style={styles.unreadRow}>
            <Text style={styles.unreadText}>
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={markAllRead}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        )}

        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={32} weight="light" color="rgba(0,0,0,0.3)" />
            <Text style={styles.emptyStateText}>You're all caught up — no notifications.</Text>
          </View>
        ) : (
          groups.map(([label, group]) => (
            <View key={label} style={{ gap: 8 }}>
              <Text style={styles.groupLabel}>{label}</Text>
              {group.map((item) => (
                <NotificationRow key={item.id} item={item} onRead={() => markRead(item.id)} />
              ))}
            </View>
          ))
        )}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  unreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadText: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  rowTitleRead: {
    fontWeight: '500',
  },
  rowTime: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
  },
  rowMessage: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.55)',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginTop: 4,
  },
});
