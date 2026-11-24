import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  CaretRight,
  FileText,
  Headset,
  MapPin,
  Play,
  ShieldCheck,
  SignOut,
  Star,
  User,
  type Icon,
} from 'phosphor-react-native';
import AppMenuButton from '@/components/AppMenu';
import { useAuthStore } from '@/features/auth/authStore';
import { useOrderHistory } from '@/features/orders/hooks';
import { DEMO_MODE, DEMO_ORDER_ID } from '@/features/tracking/demo';
import { profileStats } from '@/features/account/profileStats';
import { displayMoney } from '@/lib/money';
import RateAppSheet from '@/features/account/RateAppSheet';

const PRIMARY = '#0A6CFF';


interface RowProps {
  icon: Icon;
  color: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function Row({ icon: Glyph, color, label, onPress, danger }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button" activeOpacity={0.6}>
      <View style={[styles.rowIcon, { backgroundColor: color }]}>
        <Glyph size={14} weight="fill" color="#fff" />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {!danger && <CaretRight size={16} weight="bold" color="#000" />}
    </TouchableOpacity>
  );
}

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      {value === null ? <ActivityIndicator size="small" /> : <Text style={styles.statValue}>{value}</Text>}
    </View>
  );
}


// Profile: who the customer is, their order totals, and links to account settings and help.
export default function Account() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const history = useOrderHistory();

  // The totals need every order, so keep loading pages until the server has no more.
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = history;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const stats = useMemo(
    () => (history.data ? profileStats(history.data.pages.flatMap((p) => p.orders)) : null),
    [history.data],
  );
  const statsReady = !!stats && !hasNextPage;

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'GasApp customer';
  const initial = (user?.firstName?.[0] ?? fullName[0] ?? 'G').toUpperCase();
  // Phone and email side by side when the customer has both.
  const contact = [user?.phoneNumber, user?.email].filter(Boolean).join('  ·  ');

  const [rateAppOpen, setRateAppOpen] = useState(false);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <AppMenuButton />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.name} numberOfLines={1}>
            {fullName}
          </Text>
          {!!contact && (
            <Text style={styles.contact} numberOfLines={1} adjustsFontSizeToFit>
              {contact}
            </Text>
          )}
          <View style={styles.statsRow}>
            <Stat label="Total Orders" value={statsReady ? String(stats.totalOrders) : null} />
            <View style={styles.statDivider} />
            <Stat
              label="Total Expenses"
              value={
                statsReady
                  ? displayMoney(stats.totalSpent, stats.currency)
                  : null
              }
            />
            <View style={styles.statDivider} />
            <Stat label="Cylinders" value={statsReady ? String(stats.cylinders) : null} />
          </View>
        </View>

        <Text style={styles.section}>Account</Text>
        <Row icon={User} color="#8E2DA8" label="Personal Information" onPress={() => navigation.navigate('PersonalInfo')} />
        <Row icon={ShieldCheck} color="#2F3DE0" label="Privacy & Security" onPress={() => navigation.navigate('PrivacySecurity')} />
        <Row icon={MapPin} color="#E5262A" label="Saved Addresses" onPress={() => navigation.navigate('SavedPlaces')} />

        <Text style={styles.section}>Help & Preferences</Text>
        <Row icon={Bell} color="#F08A00" label="Notification" onPress={() => navigation.navigate('NotificationSettings')} />
        <Row icon={Headset} color="#12A150" label="Help & Support" onPress={() => navigation.navigate('ContactUs', { fromProfile: true })} />
        <Row icon={Star} color="#E6B000" label="Rate GasApp" onPress={() => setRateAppOpen(true)} />
        <Row icon={FileText} color="#0E8C9C" label="Terms & Privacy" onPress={() => navigation.navigate('TermsPrivacy')} />

        {DEMO_MODE && (
          <>
            <Text style={styles.section}>Demo</Text>
            <Row
              icon={Play}
              color="#5B5BD6"
              label="Rider queue tracking"
              onPress={() => navigation.navigate('Tracker', { orderId: DEMO_ORDER_ID })}
            />
          </>
        )}

        <View style={styles.signOutGap} />
        <Row icon={SignOut} color="#6B7280" label="Sign Out" onPress={signOut} danger />

      </ScrollView>

      <RateAppSheet
        visible={rateAppOpen}
        onClose={() => setRateAppOpen(false)}
        onAddEmail={() => {
          setRateAppOpen(false);
          navigation.navigate('AddContact', { channel: 'email' });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  body: { paddingHorizontal: 16, paddingTop: 16 },
  avatar: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '700' },
  summary: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,0.18)',
    paddingTop: 16,
    alignItems: 'center',
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  name: { fontSize: 18, fontWeight: '600', color: '#000', paddingHorizontal: 16 },
  contact: { fontSize: 13, color: 'rgba(0,0,0,0.5)', marginTop: 2, letterSpacing: 0.5 },
  statsRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.12)',
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 8 },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(0,0,0,0.12)' },
  statLabel: { fontSize: 11, color: 'rgba(0,0,0,0.55)' },
  statValue: { fontSize: 15, fontWeight: '700', color: '#000' },
  section: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 24,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, color: '#000' },
  rowLabelDanger: { color: '#D92D20', fontWeight: '600' },
  signOutGap: { height: 16 },
});
