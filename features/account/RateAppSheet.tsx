import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import FloatingSheet, { SheetButton } from '@/components/FloatingSheet';
import { RatingFields, RatingHeader, ratingStyles, useRatingForm } from '@/components/rating/RatingFields';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';
import { APP_RATING_BANDS, sendAppRating } from './appRating';

// Android only: iOS needs the App Store id, which the app does not have until it is listed.
const PLAY_STORE_URL = 'market://details?id=com.gasapp.customer';

// "Rate GasApp" from Profile: the same sheet as the delivery rating, with tags about the app.
// Happy customers are then invited to leave a store review.
export default function RateAppSheet({
  visible,
  onClose,
  onAddEmail,
}: {
  visible: boolean;
  onClose: () => void;
  onAddEmail: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const form = useRatingForm(APP_RATING_BANDS);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  // Start fresh each time it opens.
  const { reset } = form;
  useEffect(() => {
    if (visible) {
      reset();
      setSent(false);
    }
    // reset is recreated each render; only re-run when the sheet opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const submit = async () => {
    if (!form.band || !user) return;
    if (!user.email) {
      Alert.alert('Add an email first', 'We need an email address so we can follow up on your feedback.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add email', onPress: onAddEmail },
      ]);
      return;
    }
    setBusy(true);
    try {
      await sendAppRating({ ...user, email: user.email }, form.score, form.band.label, form.tags, form.comment);
      setSent(true);
    } catch (error) {
      Alert.alert('Could not send your rating', errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const askForReview = sent && form.score >= 4 && Platform.OS === 'android';

  const footer = !sent ? (
    <SheetButton title={busy ? 'Sending…' : 'Submit'} disabled={!form.score || busy} onPress={submit} />
  ) : askForReview ? (
    <>
      <SheetButton title="Not now" variant="secondary" onPress={onClose} />
      <SheetButton
        title="Rate on Google Play"
        onPress={() => {
          onClose();
          Linking.openURL(PLAY_STORE_URL).catch(() => {});
        }}
      />
    </>
  ) : (
    <SheetButton title="Done" onPress={onClose} />
  );

  return (
    <FloatingSheet visible={visible} onClose={busy ? () => {} : onClose} footer={footer} contentStyle={ratingStyles.content}>
      {!sent ? (
        <>
          <RatingHeader title="Rate GasApp" onClose={onClose} />
          <Text style={styles.subtitle}>How has GasApp been for you so far?</Text>
          <RatingFields form={form} placeholder="What should we improve?" />
        </>
      ) : (
        <View style={styles.done}>
          <View style={styles.doneIcon}>
            <CheckCircle size={40} weight="fill" color="#22C55E" />
          </View>
          <Text style={styles.doneTitle}>Thanks for your feedback!</Text>
          <Text style={styles.doneText}>
            {askForReview
              ? 'Glad you like GasApp. Would you share a quick review on Google Play? It helps others find us.'
              : 'Our team reads every rating and uses it to make GasApp better.'}
          </Text>
        </View>
      )}
    </FloatingSheet>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, color: 'rgba(0,0,0,0.55)', marginTop: -8 },
  done: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: { fontSize: 20, fontWeight: '700', color: '#000', textAlign: 'center' },
  doneText: { fontSize: 14, color: 'rgba(0,0,0,0.55)', textAlign: 'center', lineHeight: 19 },
});
