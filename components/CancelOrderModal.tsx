import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Check } from 'phosphor-react-native';

const CANCEL_REASONS = [
  'Changed my mind',
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Taking too long',
  'Other',
];

interface CancelOrderModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function CancelOrderModal({ visible, onClose, onConfirm }: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');

  const isOther = selectedReason === 'Other';
  const canConfirm = selectedReason !== null && (!isOther || customReason.trim().length > 0);

  const handleConfirm = () => {
    if (!canConfirm || !selectedReason) return;
    const reason = isOther ? customReason.trim() : selectedReason;
    onConfirm(reason);
    setSelectedReason(null);
    setCustomReason('');
  };

  const handleClose = () => {
    setSelectedReason(null);
    setCustomReason('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>Cancel Order</Text>
          <Text style={styles.subtitle}>Let us know why you're cancelling</Text>

          <View style={styles.reasonList}>
            {CANCEL_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={styles.reasonRow}
                  onPress={() => setSelectedReason(reason)}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <Check size={10} color="#fff" weight="bold" />}
                  </View>
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isOther && (
            <TextInput
              style={styles.input}
              placeholder="Tell us more"
              value={customReason}
              onChangeText={setCustomReason}
              multiline
              returnKeyType="done"
            />
          )}

          <TouchableOpacity
            style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
            disabled={!canConfirm}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm Cancellation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.keepButton} onPress={handleClose}>
            <Text style={styles.keepButtonText}>Keep Order</Text>
          </TouchableOpacity>
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
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
    marginTop: -12,
  },
  reasonList: {
    gap: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: '#D92D20',
    borderColor: '#D92D20',
  },
  reasonText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  confirmButton: {
    backgroundColor: '#D92D20',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  keepButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  keepButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.6)',
  },
});
