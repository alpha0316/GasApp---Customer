import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Star } from 'phosphor-react-native';

const PRIMARY = '#007AFF';

interface RatingSheetProps {
  visible: boolean;
  riderName?: string;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
}

// No feedback/ratings backend exists yet — submitting just closes the
// sheet with a thank-you, same "demo until integration starts" approach
// used across the rest of the app (Orders' fallback data, Tracker's demo
// modes). Reused both automatically after a delivery completes and from
// the "Rate" row on the Order Details page.
export default function RatingSheet({ visible, riderName, onClose, onSubmit }: RatingSheetProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setRating(0);
    setFeedback('');
    setSubmitted(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, feedback.trim());
    setSubmitted(true);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          {submitted ? (
            <View style={styles.thankYou}>
              <Text style={styles.thankYouTitle}>Thanks for your feedback!</Text>
              <Text style={styles.thankYouMessage}>It helps us keep every delivery running smoothly.</Text>
              <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.title}>How was your delivery?</Text>
              <Text style={styles.subtitle}>{riderName ? `Rate your delivery with ${riderName}` : 'Rate your delivery'}</Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity key={value} onPress={() => setRating(value)} hitSlop={8}>
                    <Star size={36} weight={value <= rating ? 'fill' : 'regular'} color={value <= rating ? '#F5A623' : 'rgba(0,0,0,0.2)'} />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Tell us about any issues (optional)"
                value={feedback}
                onChangeText={setFeedback}
                multiline
                returnKeyType="done"
              />

              <TouchableOpacity
                style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
                disabled={rating === 0}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButton} onPress={handleClose}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
    marginTop: -12,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    padding: 12,
    minHeight: 72,
    textAlignVertical: 'top',
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.5)',
  },
  thankYou: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  thankYouTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  thankYouMessage: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
    marginBottom: 8,
  },
  doneButton: {
    alignSelf: 'stretch',
    backgroundColor: '#000',
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
