import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Bell } from 'phosphor-react-native';
import { eventStyle } from '@/features/trip/eventStyle';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTripStore, type TripInboxItem } from '@/features/trip/store';
import AppMenuButton from '@/components/AppMenu';
import { useMarkAllRead, useMarkRead, useNotifications } from '@/features/notifications/hooks';
import { errorMessage } from '@/lib/api/client';
import type { AppNotification } from '@/lib/api/types';

const PRIMARY = '#007AFF';

interface NotificationItem {
  id: string;
  // The server's template key (e.g. "picked_up") or the app's trip event (e.g. "arriving_dropoff").
  kind: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  // Set for trip alerts the app saved on this device; tapping one opens the tracker.
  tripOrderId?: string;
}

function toItem(n: AppNotification): NotificationItem {
  return {
    id: n.id,
    kind: n.type,
    title: n.title,
    message: n.body,
    createdAt: n.createdAt,
    read: !!n.readAt,
  };
}

function fromTrip(n: TripInboxItem): NotificationItem {
  return {
    id: n.id,
    kind: n.event,
    title: n.title,
    message: n.body,
    createdAt: n.createdAt,
    read: n.read,
    tripOrderId: n.orderId,
  };
}

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

function iconFor(kind: string) {
  const { Icon, color, xml, image } = eventStyle(kind);
  // Same hue, faint, behind the glyph.
  return { Icon, color, xml, image, bg: `${color}1A` };
}

function NotificationRow({ item, onRead }: { item: NotificationItem; onRead: () => void }) {
  const { Icon, color, xml, image, bg } = iconFor(item.kind);
  return (
    <TouchableOpacity style={styles.row} onPress={onRead} activeOpacity={0.7}>
      <View style={[styles.rowIcon, { backgroundColor: bg }]}>
        {image ? (
          <Image source={image} style={{ width: 22, height: 22 }} resizeMode="contain" />
        ) : xml ? (
          <SvgXml xml={xml} width={22} height={22} />
        ) : (
          <Icon size={18} weight="fill" color={color} />
        )}
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
  const query = useNotifications();
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();
  const navigation = useNavigation();
  const tripInbox = useTripStore((s) => s.inbox);
  const markTripRead = useTripStore((s) => s.markInboxRead);
  const items = useMemo(
    () => [...(query.data?.pages ?? []).flatMap((p) => p.notifications).map(toItem), ...tripInbox.map(fromTrip)],
    [query.data, tripInbox],
  );

  // The server counts across all pages; the first page carries the current total.
  const unreadCount = (query.data?.pages[0]?.unreadCount ?? 0) + tripInbox.filter((n) => !n.read).length;

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

  const markRead = (item: NotificationItem) => {
    if (item.tripOrderId) {
      markTripRead(item.id);
      navigation.navigate('Tracker', { orderId: item.tripOrderId });
    } else if (!item.read) {
      markReadMutation.mutate(item.id);
    }
  };
  const markAllRead = () => {
    markTripRead();
    if ((query.data?.pages[0]?.unreadCount ?? 0) > 0) markAllReadMutation.mutate();
  };

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

        {query.isPending && tripInbox.length === 0 ? (
          <ActivityIndicator accessibilityLabel="Loading notifications" />
        ) : query.isError && tripInbox.length === 0 ? (
          <TouchableOpacity style={styles.emptyState} onPress={() => query.refetch()} accessibilityRole="button">
            <Text style={styles.emptyStateText}>{errorMessage(query.error)} Tap to try again.</Text>
          </TouchableOpacity>
        ) : groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={32} weight="light" color="rgba(0,0,0,0.3)" />
            <Text style={styles.emptyStateText}>You&apos;re all caught up — no notifications.</Text>
          </View>
        ) : (
          groups.map(([label, group]) => (
            <View key={label} style={{ gap: 8 }}>
              <Text style={styles.groupLabel}>{label}</Text>
              {group.map((item) => (
                <NotificationRow key={item.id} item={item} onRead={() => markRead(item)} />
              ))}
            </View>
          ))
        )}

        {query.hasNextPage && (
          <TouchableOpacity onPress={() => query.fetchNextPage()} disabled={query.isFetchingNextPage} accessibilityRole="button">
            <Text style={styles.markAllText}>{query.isFetchingNextPage ? 'Loading…' : 'Load more'}</Text>
          </TouchableOpacity>
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
