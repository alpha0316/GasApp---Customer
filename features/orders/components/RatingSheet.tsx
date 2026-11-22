import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check, CheckCircle, Flag, Star } from 'phosphor-react-native';
import FloatingSheet, { SheetButton } from '@/components/FloatingSheet';
import { NeedsEmailError, REPORT_REASONS } from '@/features/orders/report';
import { errorMessage } from '@/lib/api/client';

const STAR = '#F5A623';

interface RatingSheetProps {
  visible: boolean;
  riderName?: string;
  onClose: () => void;
  // Resolves when the rating is saved; rejects when the server refuses it.
  onSubmit: (rating: number, feedback: string) => Promise<void>;
  // Sends a problem report to support. Without it the Report button is hidden.
  onReport?: (reason: string, details: string) => Promise<void>;
}

type View_ = 'rate' | 'report' | 'rated' | 'reported';

// Shown after a delivery completes and from the "Rate" row on Order Details:
// rate the rider, or report a problem with the delivery.
export default function RatingSheet({ visible, riderName, onClose, onSubmit, onReport }: RatingSheetProps) {
  const navigation = useNavigation();
  const [view, setView] = useState<View_>('rate');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setView('rate');
    setRating(0);
    setFeedback('');
    setReason(null);
    setDetails('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setBusy(true);
    try {
      await onSubmit(rating, feedback.trim());
      setView('rated');
    } catch (error) {
      Alert.alert('Could not send your rating', errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleReport = async () => {
    if (!reason || !onReport) return;
    setBusy(true);
    try {
      await onReport(reason, details.trim());
      setView('reported');
    } catch (error) {
      if (error instanceof NeedsEmailError) {
        Alert.alert('Add an email first', error.message, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add email',
            onPress: () => {
              handleClose();
              navigation.navigate('AddContact', { channel: 'email' });
            },
          },
        ]);
      } else {
        Alert.alert('Could not send your report', errorMessage(error));
      }
    } finally {
      setBusy(false);
    }
  };

  const footer =
    view === 'rate' ? (
      <>
        {onReport && (
          <SheetButton
            title="Report"
            variant="secondary"
            icon={<Flag size={16} weight="fill" color="#D92D20" />}
            onPress={() => setView('report')}
          />
        )}
        <SheetButton title={busy ? 'Sending…' : 'Submit'} disabled={rating === 0 || busy} onPress={handleSubmit} />
      </>
    ) : view === 'report' ? (
      <>
        <SheetButton title="Back" variant="secondary" onPress={() => setView('rate')} />
        <SheetButton title={busy ? 'Sending…' : 'Send report'} disabled={!reason || busy} onPress={handleReport} />
      </>
    ) : (
      <SheetButton title="Done" onPress={handleClose} />
    );

  return (
    <FloatingSheet visible={visible} onClose={handleClose} footer={footer} contentStyle={styles.content}>
      {view === 'rate' && (
        <>
          <View style={styles.headerText}>
            <Text style={styles.title}>How was your delivery?</Text>
            <Text style={styles.subtitle}>{riderName ? `Rate your delivery with ${riderName}` : 'Rate your delivery'}</Text>
          </View>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setRating(value)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${value} star${value > 1 ? 's' : ''}`}
              >
                <Star size={36} weight={value <= rating ? 'fill' : 'regular'} color={value <= rating ? STAR : 'rgba(0,0,0,0.2)'} />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Anything you'd like to add? (optional)"
            placeholderTextColor="rgba(0,0,0,0.35)"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            maxLength={500}
          />

          <TouchableOpacity onPress={handleClose} accessibilityRole="button">
            <Text style={styles.skip}>Skip for now</Text>
          </TouchableOpacity>
        </>
      )}

      {view === 'report' && (
        <>
          <View style={styles.headerText}>
            <Text style={styles.title}>Report a problem</Text>
            <Text style={styles.subtitle}>Tell us what went wrong and our support team will follow up.</Text>
          </View>

          <View style={styles.reasons}>
            {REPORT_REASONS.map((r) => {
              const selected = reason === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={styles.reasonRow}
                  onPress={() => setReason(r)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected && <Check size={10} color="#fff" weight="bold" />}
                  </View>
                  <Text style={styles.reasonText}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Add details (optional)"
            placeholderTextColor="rgba(0,0,0,0.35)"
            value={details}
            onChangeText={setDetails}
            multiline
            maxLength={1000}
          />
        </>
      )}

      {(view === 'rated' || view === 'reported') && (
        <View style={styles.done}>
          <View style={styles.doneIcon}>
            {view === 'rated' ? (
              <CheckCircle size={36} weight="fill" color="#22C55E" />
            ) : (
              <Flag size={32} weight="fill" color="#D92D20" />
            )}
          </View>
          <Text style={styles.title}>{view === 'rated' ? 'Thanks for your feedback!' : 'Report sent'}</Text>
          <Text style={styles.subtitle}>
            {view === 'rated'
              ? 'It helps us keep every delivery running smoothly.'
              : "Our support team will look into it and get back to you by email."}
          </Text>
        </View>
      )}
    </FloatingSheet>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'stretch', paddingHorizontal: 16, paddingTop: 24 },
  headerText: { alignItems: 'center', gap: 6 },
  title: { fontSize: 18, fontWeight: '600', color: '#000', textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(0,0,0,0.5)', textAlign: 'center', lineHeight: 19 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 16,
    padding: 12,
    minHeight: 72,
    textAlignVertical: 'top',
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  skip: { fontSize: 14, fontWeight: '600', color: 'rgba(0,0,0,0.45)', textAlign: 'center' },
  reasons: { gap: 2 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  reasonText: { fontSize: 15, color: '#000' },
  done: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
