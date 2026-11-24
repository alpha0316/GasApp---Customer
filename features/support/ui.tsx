import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, DeviceMobile, GasCan, Package, ShieldCheck, UserCircle, type Icon } from 'phosphor-react-native';
import AppMenuButton from '@/components/AppMenu';
import type { Block, TopicIcon } from './content';

export const SUPPORT_GREEN = '#0B8457';
export const TILE_BG = '#F1F2F2';

export const TOPIC_ICONS: Record<TopicIcon, { Icon: Icon; color: string }> = {
  orders: { Icon: Package, color: '#007AFF' },
  payments: { Icon: CreditCard, color: '#0B8457' },
  safety: { Icon: ShieldCheck, color: '#2F3DE0' },
  cylinder: { Icon: GasCan, color: '#E5262A' },
  account: { Icon: UserCircle, color: '#8E2DA8' },
  app: { Icon: DeviceMobile, color: '#F08A00' },
};

// Uber-style large title. Shows a back arrow when the page was pushed from another screen
// (Profile, a help topic), and the app menu when it was opened as a top-level page.
export function LargeHeader({
  title,
  subtitle,
  showBack,
  right,
}: {
  title: string;
  subtitle?: string;
  showBack: boolean;
  right?: React.ReactNode;
}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerBar}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
        ) : (
          <AppMenuButton active="contact" />
        )}
        {right}
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

export function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'p':
      return <Text style={styles.p}>{block.text}</Text>;
    case 'list':
      return (
        <View style={styles.list}>
          {block.items.map((item) => (
            <View key={item} style={styles.listRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={[styles.p, styles.flex]}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case 'steps':
      return (
        <View style={styles.list}>
          {block.items.map((item, i) => (
            <View key={item} style={styles.listRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={[styles.p, styles.flex]}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case 'table':
      return (
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHead]}>
            <Text style={[styles.tableCell, styles.tableHeadText]}>{block.head[0]}</Text>
            <Text style={[styles.tableCell, styles.tableHeadText, styles.tableRight]}>{block.head[1]}</Text>
          </View>
          {block.rows.map(([a, b], i) => (
            <View key={a} style={[styles.tableRow, i === block.rows.length - 1 && styles.tableLast]}>
              <Text style={[styles.tableCell, styles.tableKey]}>{a}</Text>
              <Text style={[styles.tableCell, styles.tableRight, b.length > 14 && styles.tableLong]}>{b}</Text>
            </View>
          ))}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 8, backgroundColor: '#fff' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  back: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 34, fontWeight: '800', color: '#111', marginTop: 16, letterSpacing: -0.5 },
  subtitle: { fontSize: 20, color: 'rgba(0,0,0,0.6)', marginTop: 6 },
  flex: { flex: 1 },
  p: { fontSize: 15, lineHeight: 22, color: 'rgba(0,0,0,0.8)' },
  list: { gap: 8 },
  listRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bullet: { fontSize: 15, lineHeight: 22, color: 'rgba(0,0,0,0.5)' },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(11,132,87,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  stepNumText: { fontSize: 12, fontWeight: '700', color: SUPPORT_GREEN },
  table: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' },
  tableRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tableLast: { borderBottomWidth: 0 },
  tableHead: { backgroundColor: '#FAFAFA' },
  tableHeadText: { fontSize: 12, fontWeight: '700', color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase' },
  tableCell: { flex: 1, fontSize: 14, color: '#000', lineHeight: 20 },
  tableKey: { fontWeight: '600' },
  tableRight: { textAlign: 'right' },
  // Sentences (the status table) read better left-aligned and given more room.
  tableLong: { textAlign: 'left', flex: 1.6, color: 'rgba(0,0,0,0.7)' },
});
