import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarBlank, CaretRight, MagnifyingGlass, Package, X } from 'phosphor-react-native';
import AppMenuButton from '@/components/AppMenu';
import { useOrderHistory } from '@/features/orders/hooks';
import { toOrderItem, type OrderItem } from '@/features/orders/orderView';
import { CANCELLED_STATUSES, INCOMING_STATUSES, SIZE_NAME } from '@/features/orders/status';
import { useStations } from '@/features/catalog/hooks';
import { errorMessage } from '@/lib/api/client';
import type { OrderStatus } from '@/lib/api/types';

const PRIMARY = '#007AFF';
const PRIMARY_TINT = 'rgba(0,122,255,0.10)';
const GREEN = '#52B922';
const RED = '#D92D20';

type Tab = 'incoming' | 'completed' | 'cancelled';

function orderTimestamp(order: OrderItem): number {
  const parsed = Date.parse(order.createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function statusMeta(status: OrderStatus): { label: string; color: string; bg: string } {
  if (status === 'delivered') return { label: 'Delivered', color: GREEN, bg: 'rgba(82,185,34,0.10)' };
  if (status === 'cancelled' || status === 'refunded') {
    return { label: status === 'refunded' ? 'Refunded' : 'Cancelled', color: RED, bg: 'rgba(217,45,32,0.08)' };
  }
  if (status === 'pending_payment') return { label: 'Pending Payment', color: '#B8860B', bg: 'rgba(184,134,11,0.10)' };
  return { label: 'In Progress', color: PRIMARY, bg: PRIMARY_TINT };
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
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatShortDate(date: Date | null) {
  if (!date) return '…';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function OrderCard({ order, onPress }: { order: OrderItem; onPress: () => void }) {
  const meta = statusMeta(order.status);
  const cylinderName = SIZE_NAME[order.size];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: meta.bg }]}>
          <Package size={18} color={meta.color} weight="fill" />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {cylinderName}
            {formatTime(orderTimestamp(order)) ? ` · ${formatTime(orderTimestamp(order))}` : ''}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {order.address}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>

        <CaretRight size={16} weight="bold" color="rgba(0,0,0,0.4)" />
      </View>
    </TouchableOpacity>
  );
}

function DateRangeModal({
  visible,
  draft,
  onChange,
  onApply,
  onClear,
  onClose,
}: {
  visible: boolean;
  draft: { from: Date | null; to: Date | null };
  onChange: (next: { from: Date | null; to: Date | null }) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [editingField, setEditingField] = useState<'from' | 'to' | null>(null);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <X size={14} weight="bold" color="#000" />
            </TouchableOpacity>
          </View>

          <View style={{ gap: 4 }}>
            <Text style={styles.modalFieldLabel}>From</Text>
            <TouchableOpacity
              style={styles.modalDateInput}
              onPress={() => setEditingField(editingField === 'from' ? null : 'from')}
            >
              <Text style={styles.modalDateInputText}>{formatShortDate(draft.from)}</Text>
            </TouchableOpacity>
            {editingField === 'from' && (
              <DateTimePicker
                value={draft.from ?? new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                maximumDate={draft.to ?? undefined}
                onChange={(_e, date) => {
                  if (Platform.OS === 'android') setEditingField(null);
                  if (date) onChange({ ...draft, from: date });
                }}
              />
            )}
          </View>

          <View style={{ gap: 4 }}>
            <Text style={styles.modalFieldLabel}>To</Text>
            <TouchableOpacity
              style={styles.modalDateInput}
              onPress={() => setEditingField(editingField === 'to' ? null : 'to')}
            >
              <Text style={styles.modalDateInputText}>{formatShortDate(draft.to)}</Text>
            </TouchableOpacity>
            {editingField === 'to' && (
              <DateTimePicker
                value={draft.to ?? new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={draft.from ?? undefined}
                onChange={(_e, date) => {
                  if (Platform.OS === 'android') setEditingField(null);
                  if (date) onChange({ ...draft, to: date });
                }}
              />
            )}
          </View>

          <TouchableOpacity style={styles.modalClearButton} onPress={onClear}>
            <Text style={styles.modalClearButtonText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalApplyButton} onPress={onApply}>
            <Text style={styles.modalApplyButtonText}>Apply</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function Orders() {
  const navigation = useNavigation();
  const history = useOrderHistory();
  const stationsQuery = useStations();
  const allOrders = useMemo(
    () => (history.data?.pages ?? []).flatMap((p) => p.orders).map((o) => toOrderItem(o, stationsQuery.data ?? [])),
    [history.data, stationsQuery.data],
  );
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('incoming');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [draftRange, setDraftRange] = useState(dateRange);

  const hasDateFilter = !!(dateRange.from || dateRange.to);

  const filtered = useMemo(() => {
    return allOrders.filter((o) => {
      if (tab === 'incoming') return INCOMING_STATUSES.includes(o.status);
      if (tab === 'completed') return o.status === 'delivered';
      return CANCELLED_STATUSES.includes(o.status);
    })
      .filter((o) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return o.id.toLowerCase().includes(q) || o.address.toLowerCase().includes(q);
      })
      .filter((o) => {
        if (!dateRange.from && !dateRange.to) return true;
        const ts = orderTimestamp(o);
        if (dateRange.from) {
          const start = new Date(dateRange.from);
          start.setHours(0, 0, 0, 0);
          if (ts < start.getTime()) return false;
        }
        if (dateRange.to) {
          const end = new Date(dateRange.to);
          end.setHours(23, 59, 59, 999);
          if (ts > end.getTime()) return false;
        }
        return true;
      })
      .sort((a, b) => orderTimestamp(b) - orderTimestamp(a));
  }, [allOrders, tab, search, dateRange]);

  const groups = useMemo(() => {
    const map = new Map<string, OrderItem[]>();
    filtered.forEach((o) => {
      const label = formatGroupLabel(orderTimestamp(o));
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(o);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <View style={styles.main}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <AppMenuButton active="orders" />
        <Text style={styles.headerTitle}>Orders</Text>
        <TouchableOpacity
          style={[styles.headerIconButton, searchOpen && styles.headerIconButtonActive]}
          onPress={() => setSearchOpen((v) => !v)}
        >
          <MagnifyingGlass size={16} weight="bold" color={searchOpen ? PRIMARY : '#000'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {searchOpen && (
          <TextInput
            autoFocus
            value={search}
            onChangeText={setSearch}
            placeholder="Search by order ID or address"
            style={styles.searchInput}
          />
        )}

        <View style={styles.filterRow}>
          <View style={styles.tabBar}>
            {(['incoming', 'completed', 'cancelled'] as Tab[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabButton, tab === t && styles.tabButtonActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabButtonText, tab === t && styles.tabButtonTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.dateFilterButton, hasDateFilter && styles.dateFilterButtonActive]}
            onPress={() => {
              setDraftRange(dateRange);
              setDateModalOpen(true);
            }}
          >
            <CalendarBlank size={18} weight="bold" color={hasDateFilter ? PRIMARY : '#000'} />
            {hasDateFilter && <View style={styles.dateFilterDot} />}
          </TouchableOpacity>
        </View>

        {hasDateFilter && (
          <View style={styles.activeFilterRow}>
            <Text style={styles.activeFilterText}>
              {formatShortDate(dateRange.from)} → {formatShortDate(dateRange.to)}
            </Text>
            <TouchableOpacity onPress={() => setDateRange({ from: null, to: null })}>
              <Text style={styles.activeFilterClear}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {history.isPending ? (
          <ActivityIndicator accessibilityLabel="Loading orders" />
        ) : history.isError ? (
          <TouchableOpacity style={styles.emptyState} onPress={() => history.refetch()} accessibilityRole="button">
            <Text style={styles.emptyStateText}>{errorMessage(history.error)} Tap to try again.</Text>
          </TouchableOpacity>
        ) : groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={32} weight="light" color="rgba(0,0,0,0.3)" />
            <Text style={styles.emptyStateText}>
              No {tab} orders{hasDateFilter ? ' in this date range' : ''}.
            </Text>
          </View>
        ) : (
          groups.map(([label, group]) => (
            <View key={label} style={{ gap: 8 }}>
              <Text style={styles.groupLabel}>{label}</Text>
              {group.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                />
              ))}
            </View>
          ))
        )}

        {history.hasNextPage && (
          <TouchableOpacity onPress={() => history.fetchNextPage()} disabled={history.isFetchingNextPage} accessibilityRole="button">
            <Text style={styles.activeFilterClear}>{history.isFetchingNextPage ? 'Loading…' : 'Load more'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <DateRangeModal
        visible={dateModalOpen}
        draft={draftRange}
        onChange={setDraftRange}
        onApply={() => {
          setDateRange(draftRange);
          setDateModalOpen(false);
        }}
        onClear={() => {
          setDraftRange({ from: null, to: null });
          setDateRange({ from: null, to: null });
          setDateModalOpen(false);
        }}
        onClose={() => setDateModalOpen(false)}
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
    fontSize: 20,
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
  headerIconButtonActive: {
    backgroundColor: PRIMARY_TINT,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 9999,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 9999,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.5)',
  },
  tabButtonTextActive: {
    color: '#000',
  },
  dateFilterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateFilterButtonActive: {
    backgroundColor: PRIMARY_TINT,
  },
  dateFilterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -8,
  },
  activeFilterText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
  },
  activeFilterClear: {
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFieldLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  modalDateInput: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FAFAFA',
  },
  modalDateInputText: {
    fontSize: 14,
  },
  modalClearButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  modalClearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
  modalApplyButton: {
    paddingVertical: 14,
    borderRadius: 9999,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  modalApplyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
