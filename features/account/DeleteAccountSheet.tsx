import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import FloatingSheet, { SheetButton } from '@/components/FloatingSheet';
import { DANGER } from '@/components/form/Form';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';
import { DELETE_REASONS, requestAccountDeletion, type DeleteReason } from './deleteAccount';

// Asks why the customer is leaving before sending the deletion request, so the team can
// follow up. "Other" needs a few words; the other reasons take optional details.
export default function DeleteAccountSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [reason, setReason] = useState<DeleteReason | null>(null);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);

  // Start fresh each time it opens.
  useEffect(() => {
    if (visible) {
      setReason(null);
      setDetails('');
    }
  }, [visible]);

  const needsDetails = reason === 'Other' && details.trim().length < 3;
  const canSubmit = !!reason && !needsDetails && !sending;

  const submit = async () => {
    if (!reason || !user?.email) return;
    setSending(true);
    try {
      await requestAccountDeletion({ ...user, email: user.email }, reason, details);
      onClose();
      Alert.alert('Request sent', "We'll delete your account and confirm by email. You'll be signed out now.", [
        { text: 'OK', onPress: () => void signOut() },
      ]);
    } catch (error) {
      Alert.alert('Could not send the request', errorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <FloatingSheet
      visible={visible}
      onClose={sending ? () => {} : onClose}
      contentStyle={styles.content}
      footer={
        <>
          <SheetButton title="Cancel" variant="secondary" onPress={onClose} disabled={sending} />
          <SheetButton title={sending ? 'Sending…' : 'Delete account'} variant="danger" onPress={submit} disabled={!canSubmit} />
        </>
      }
    >
      <View style={styles.headerText}>
        <Text style={styles.title}>Why are you leaving?</Text>
        <Text style={styles.subtitle}>
          Your profile, saved details and order history will be permanently deleted. Tell us why so we can do better.
        </Text>
      </View>

      <View accessibilityRole="radiogroup" style={styles.reasons}>
        {DELETE_REASONS.map((r) => {
          const selected = reason === r;
          return (
            <TouchableOpacity
              key={r}
              style={styles.reason}
              onPress={() => setReason(r)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              activeOpacity={0.6}
            >
              <View style={[styles.radio, selected && styles.radioOn]}>{selected && <View style={styles.radioDot} />}</View>
              <Text style={styles.reasonText}>{r}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!!reason && (
        <TextInput
          style={styles.details}
          value={details}
          onChangeText={setDetails}
          placeholder={reason === 'Other' ? 'Tell us what happened' : 'Anything else? (optional)'}
          placeholderTextColor="rgba(0,0,0,0.4)"
          multiline
          maxLength={500}
          accessibilityLabel="More details"
        />
      )}
    </FloatingSheet>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'stretch', paddingHorizontal: 16 },
  headerText: { gap: 6 },
  title: { fontSize: 18, fontWeight: '700', color: '#000' },
  subtitle: { fontSize: 13, color: 'rgba(0,0,0,0.6)', lineHeight: 18 },
  reasons: { gap: 2 },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: DANGER },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: DANGER },
  reasonText: { flex: 1, fontSize: 15, color: '#000' },
  details: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: 12,
    paddingTop: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    backgroundColor: '#FAFAFA',
  },
});
