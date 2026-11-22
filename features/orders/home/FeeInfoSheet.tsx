import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Coins, Moped, Receipt, Wrench, X, XCircle, type Icon } from 'phosphor-react-native';
import FloatingSheet, { SheetButton } from '@/components/FloatingSheet';

interface Point {
  icon: Icon;
  color: string;
  title: string;
  body: string;
}

// What the customer should know before confirming: what each fee is, rounding, cancelling, extras.
const POINTS: Point[] = [
  {
    icon: Receipt,
    color: '#2F3DE0',
    title: 'What you pay for',
    body: 'Your gas at the station price, a Service Fee for taking your cylinder to the filling station, and a Delivery Fee for your rider.',
  },
  {
    icon: Moped,
    color: '#12A150',
    title: 'Delivery Fee and your station',
    body: 'The Delivery Fee pays your rider and is based on the closest filling station. Choosing a station farther away adds a small distance charge.',
  },
  {
    icon: Coins,
    color: '#F08A00',
    title: 'Rounded for cash',
    body: 'Every amount is rounded to the nearest cedi, so paying in cash never needs pesewas.',
  },
  {
    icon: XCircle,
    color: '#E5262A',
    title: 'Cancelling',
    body: 'Cancel for free until a rider accepts your order. Card payments are refunded automatically. After a rider accepts, contact support.',
  },
  {
    icon: Wrench,
    color: '#8E2DA8',
    title: 'Extras and your cylinder',
    body: 'The distance charge and any rubber change are paid to your rider in cash. Have your empty cylinder ready: the rider collects it first.',
  },
];

// The "?" next to Cost Summary at checkout opens this.
export default function FeeInfoSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <FloatingSheet
      visible={visible}
      onClose={onClose}
      contentStyle={styles.content}
      footer={<SheetButton title="Got it" onPress={onClose} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Fees & Terms</Text>
        <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <X size={20} color="rgba(0,0,0,0.5)" />
        </TouchableOpacity>
      </View>

      <View style={styles.points}>
        {POINTS.map(({ icon: Glyph, color, title, body }) => (
          <View key={title} style={styles.point}>
            <View style={[styles.iconDot, { backgroundColor: color }]}>
              <Glyph size={14} weight="fill" color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointTitle}>{title}</Text>
              <Text style={styles.pointBody}>{body}</Text>
            </View>
          </View>
        ))}
      </View>
    </FloatingSheet>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'stretch', paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '600', color: '#000' },
  points: { gap: 16 },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  pointTitle: { fontSize: 15, fontWeight: '600', color: '#000' },
  pointBody: { fontSize: 13, color: 'rgba(0,0,0,0.55)', lineHeight: 18, marginTop: 2 },
});
