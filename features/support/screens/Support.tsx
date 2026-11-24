import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretRight, ChatsCircle, FileText, Headset, PhoneCall, type Icon } from 'phosphor-react-native';
import { useOrderHistory } from '@/features/orders/hooks';
import { toOrderItem } from '@/features/orders/orderView';
import { isActive } from '@/features/orders/status';
import { CYLINDER_IMAGES } from '@/features/orders/home/constants';
import { useSettings, useStations } from '@/features/catalog/hooks';
import { displayMoney } from '@/lib/money';
import { HELP_TOPICS } from '@/features/support/content';
import { LargeHeader, SUPPORT_GREEN, TILE_BG, TOPIC_ICONS } from '@/features/support/ui';
import type { RootStackParamList } from '@/types/navigation';

// A big grey tile with a label on the left and an illustration-sized icon on the right (Bolt).
function ActionTile({ label, detail, icon: Glyph, color, onPress }: { label: string; detail?: string; icon: Icon; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionTile} onPress={onPress} accessibilityRole="button" activeOpacity={0.7}>
      <View style={styles.flex}>
        <Text style={styles.actionLabel}>{label}</Text>
        {!!detail && <Text style={styles.actionDetail}>{detail}</Text>}
      </View>
      <View style={[styles.actionIcon, { backgroundColor: `${color}1A` }]}>
        <Glyph size={30} weight="duotone" color={color} />
      </View>
    </TouchableOpacity>
  );
}

// Help & Support: the latest order (the usual reason people come here), help topics,
// then ways to reach a person. A mix of Uber's Help and Bolt's Support pages.
export default function Support() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useRoute().params as RootStackParamList['ContactUs'];
  const contact = useSettings().data?.contact;
  const stations = useStations().data ?? [];
  const latestRaw = useOrderHistory().data?.pages[0]?.orders[0];
  const latest = latestRaw ? toOrderItem(latestRaw, stations) : null;

  const phone = contact?.phones[0]?.number;
  const whatsApp = contact?.phones.find((p) => p.isWhatsApp)?.number;
  const digits = (n: string) => n.replace(/[^\d]/g, '').replace(/^0/, '233');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.topCard}>
          <LargeHeader title="Support" subtitle="What can we help with?" showBack={!!params?.fromProfile} />

          {latest && (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>{isActive(latest.status) ? 'Current order' : 'Recent orders'}</Text>
                <TouchableOpacity style={styles.seeAll} onPress={() => navigation.navigate('Orders')} accessibilityRole="button">
                  <Text style={styles.seeAllText}>See all</Text>
                  <CaretRight size={16} weight="bold" color={SUPPORT_GREEN} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.7}
                accessibilityRole="button"
                onPress={() =>
                  isActive(latest.status)
                    ? navigation.navigate('Tracker', { orderId: latest.id })
                    : navigation.navigate('OrderDetails', { orderId: latest.id })
                }
              >
                <Image source={CYLINDER_IMAGES[latest.size]} style={styles.orderImage} resizeMode="contain" />
                <View style={styles.flex}>
                  <Text style={styles.orderPlace} numberOfLines={2}>
                    {latest.address || latest.stationName}
                  </Text>
                  <Text style={styles.orderDate}>
                    {new Date(latest.createdAt).toLocaleString(undefined, {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.orderPrice}>{displayMoney(latest.total, latest.currency)}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.sheet}>
          <Text style={styles.sectionTitle}>Browse help topics</Text>
          <View style={styles.grid}>
            {HELP_TOPICS.map((topic) => {
              const { Icon, color } = TOPIC_ICONS[topic.icon];
              return (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicTile}
                  onPress={() => navigation.navigate('HelpTopic', { topicId: topic.id })}
                  accessibilityRole="button"
                  activeOpacity={0.7}
                >
                  <Icon size={22} weight="duotone" color={color} />
                  <View style={styles.topicRow}>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <CaretRight size={14} color="rgba(0,0,0,0.35)" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sheet}>
          <Text style={styles.sectionTitle}>Something else</Text>
          <View style={styles.actions}>
            <ActionTile
              label="Contact a support agent"
              detail="We reply within 24 hours"
              icon={Headset}
              color={SUPPORT_GREEN}
              onPress={() => navigation.navigate('ContactSupport', {})}
            />
            {!!phone && <ActionTile label="Call us" detail={phone} icon={PhoneCall} color="#007AFF" onPress={() => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`)} />}
            {!!whatsApp && (
              <ActionTile
                label="Chat on WhatsApp"
                detail={whatsApp}
                icon={ChatsCircle}
                color="#25A244"
                onPress={() => Linking.openURL(`https://wa.me/${digits(whatsApp)}`)}
              />
            )}
            <ActionTile label="Terms & Privacy" icon={FileText} color="#6B7280" onPress={() => navigation.navigate('TermsPrivacy')} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EDEEEE' },
  flex: { flex: 1 },
  topCard: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 24,
  },
  section: { paddingHorizontal: 20, marginTop: 24, gap: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 21, fontWeight: '700', color: '#111' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: 16, fontWeight: '600', color: SUPPORT_GREEN },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: TILE_BG,
  },
  orderImage: { width: 48, height: 60 },
  orderPlace: { fontSize: 16, color: '#111', lineHeight: 21 },
  orderDate: { fontSize: 13, color: 'rgba(0,0,0,0.55)', marginTop: 4 },
  orderPrice: { fontSize: 16, fontWeight: '700', color: '#111' },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 28,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  topicTile: {
    width: '48.5%',
    minHeight: 96,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'space-between',
    gap: 12,
  },
  topicRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 },
  topicTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: '#111' },
  actions: { gap: 10 },
  actionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 80,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: TILE_BG,
  },
  actionLabel: { fontSize: 17, color: '#111' },
  actionDetail: { fontSize: 13, color: 'rgba(0,0,0,0.5)', marginTop: 3 },
  actionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
