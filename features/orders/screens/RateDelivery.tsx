import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FloatingSheet, { SheetButton } from '@/components/FloatingSheet';
import { Check, CheckCircle, Flag } from 'phosphor-react-native';
import { RatingFields, RatingHeader, ratingComment, ratingStyles, useRatingForm } from '@/components/rating/RatingFields';
import { useAuthStore } from '@/features/auth/authStore';
import { useOrder, useRateOrder } from '@/features/orders/hooks';
import { NeedsEmailError, REPORT_REASONS, reportDeliveryIssue } from '@/features/orders/report';
import { RATING_BANDS } from '@/features/orders/rating';
import { DEMO_ORDER_ID } from '@/features/tracking/demo';
import { errorMessage } from '@/lib/api/client';
import type { RootStackParamList } from '@/types/navigation';

type Params = RootStackParamList['RateDelivery'];
type Mode = 'rate' | 'report' | 'rated' | 'reported';

// A bottom sheet over the screen it was opened from: stars, then tags that change with the
// score, then a comment. Opened when a delivery completes and from "Rate" on Order Details.
export default function RateDelivery() {
  const navigation = useNavigation();
  const { orderId } = useRoute().params as Params;
  const isDemo = orderId === DEMO_ORDER_ID;
  const user = useAuthStore((s) => s.user);
  const detail = useOrder(orderId).data;
  const rateOrder = useRateOrder(orderId);
  const rider = detail && typeof detail.order.riderId === 'object' ? detail.order.riderId : null;

  const [mode, setMode] = useState<Mode>('rate');
  const form = useRatingForm(RATING_BANDS);
  const { score, tags, comment } = form;
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => !busy && navigation.goBack();

  // Leave the sheet before opening another screen, or the modal would cover it.
  const goTo = (fn: () => void) => {
    navigation.goBack();
    setTimeout(fn, 0);
  };

  const submitRating = async () => {
    if (!score) return;
    setBusy(true);
    try {
      if (!isDemo) await rateOrder.mutateAsync({ score, comment: ratingComment(tags, comment) });
      setMode('rated');
    } catch (error) {
      Alert.alert('Could not send your rating', errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const submitReport = async () => {
    if (!reason) return;
    setBusy(true);
    try {
      if (!isDemo) await reportDeliveryIssue(user, orderId, reason, details.trim());
      setMode('reported');
    } catch (error) {
      if (error instanceof NeedsEmailError) {
        Alert.alert('Add an email first', error.message, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add email', onPress: () => goTo(() => navigation.navigate('AddContact', { channel: 'email' })) },
        ]);
      } else {
        Alert.alert('Could not send your report', errorMessage(error));
      }
    } finally {
      setBusy(false);
    }
  };

  const footer =
    mode === 'rate' ? (
      <SheetButton title={busy ? 'Sending…' : 'Submit'} disabled={!score || busy} onPress={submitRating} />
    ) : mode === 'report' ? (
      <>
        <SheetButton title="Back" variant="secondary" onPress={() => setMode('rate')} disabled={busy} />
        <SheetButton title={busy ? 'Sending…' : 'Send report'} disabled={!reason || busy} onPress={submitReport} />
      </>
    ) : (
      <SheetButton title="Done" onPress={() => navigation.goBack()} />
    );

  return (
    <FloatingSheet visible onClose={close} footer={footer} contentStyle={ratingStyles.content}>
      {mode === 'rate' && (
        <>
          <RatingHeader title={rider ? `Rate ${rider.firstName} ${rider.lastName}`.trim() : 'Rate your delivery'} onClose={close} />
          <RatingFields form={form} />

          <TouchableOpacity style={styles.reportLink} onPress={() => setMode('report')} accessibilityRole="button">
            <Flag size={13} weight="fill" color="#D92D20" />
            <Text style={styles.reportText}>Report a problem</Text>
          </TouchableOpacity>
        </>
      )}

      {mode === 'report' && (
        <>
          <RatingHeader title="Report a problem" onClose={close} />
          <Text style={styles.subtitle}>Tell us what went wrong and our support team will follow up.</Text>
          <View style={styles.card}>
            {REPORT_REASONS.map((r) => {
              const selected = reason === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={styles.reasonRow}
                  onPress={() => setReason(r)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                >
                  <View style={[styles.radio, selected && styles.radioOn]}>{selected && <Check size={10} color="#fff" weight="bold" />}</View>
                  <Text style={styles.reasonText}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Add details (optional)"
            placeholderTextColor="rgba(0,0,0,0.4)"
            value={details}
            onChangeText={setDetails}
            multiline
            maxLength={1000}
            accessibilityLabel="Report details"
          />
        </>
      )}

      {(mode === 'rated' || mode === 'reported') && (
        <View style={styles.done}>
          <View style={styles.doneIcon}>
            {mode === 'rated' ? <CheckCircle size={40} weight="fill" color="#22C55E" /> : <Flag size={34} weight="fill" color="#D92D20" />}
          </View>
          <Text style={[styles.title, styles.center]}>{mode === 'rated' ? 'Thanks for your feedback!' : 'Report sent'}</Text>
          <Text style={[styles.subtitle, styles.center]}>
            {mode === 'rated'
              ? 'It helps us keep every delivery running smoothly.'
              : 'Our support team will look into it and get back to you by email.'}
          </Text>
        </View>
      )}
    </FloatingSheet>
  );
}

const styles = StyleSheet.create({
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: '#000' },
  center: { flex: 0, textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(0,0,0,0.55)', lineHeight: 19 },
  // The bordered inner card, as on the app's other sheets (Order Details).
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#FAFAFA',
    padding: 14,
    gap: 10,
  },
  input: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: 10,
    paddingTop: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  reportLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 2 },
  reportText: { fontSize: 13, fontWeight: '600', color: '#D92D20' },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  reasonText: { flex: 1, fontSize: 15, color: '#000' },
  done: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
