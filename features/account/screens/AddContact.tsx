import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import { FormNote, FormRow, FormScreen, FormSection } from '@/components/form/Form';
import { addContact, requestOtp } from '@/features/auth/api';
import OtpCodeInput from '@/features/auth/OtpCodeInput';
import { isValidEmail, isValidPhone } from '@/features/auth/profileGate';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';
import type { RootStackParamList } from '@/types/navigation';

type Params = RootStackParamList['AddContact'];

// Adds an email or phone number to the signed-in account: enter it, then confirm with a code.
export default function AddContact() {
  const navigation = useNavigation();
  const { channel } = useRoute().params as Params;
  const setUser = useAuthStore((s) => s.setUser);
  const [target, setTarget] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const isEmail = channel === 'email';
  const apiChannel = isEmail ? 'email' : 'sms';
  const valid = isEmail ? isValidEmail(target) : isValidPhone(target);

  const handleSend = async () => {
    const value = target.trim();
    setBusy(true);
    try {
      await requestOtp(apiChannel, value);
      setSentTo(value);
    } catch (error) {
      Alert.alert('Could not send the code', errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (entered: string = code) => {
    if (!sentTo || busy) return;
    setBusy(true);
    try {
      setUser(await addContact(apiChannel, sentTo, entered));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not verify the code', errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const footer = sentTo ? (
    <PrimaryButton title={busy ? 'Verifying...' : 'Verify'} disabled={code === '' || busy} onPress={() => handleVerify()} />
  ) : (
    <PrimaryButton title={busy ? 'Sending...' : 'Send code'} disabled={!valid || busy} onPress={handleSend} />
  );

  return (
    <FormScreen title={isEmail ? 'Add Email' : 'Add Phone Number'} footer={footer}>
      {sentTo ? (
        <View style={styles.codeStep}>
          <Text style={styles.codeIntro}>
            Enter the code we sent to <Text style={styles.codeTarget}>{sentTo}</Text>.
          </Text>
          <OtpCodeInput target={sentTo} onChange={setCode} onComplete={handleVerify} onResend={() => requestOtp(apiChannel, sentTo)} />
          <TouchableOpacity onPress={() => setSentTo(null)} accessibilityRole="button" style={styles.link}>
            <Text style={styles.linkText}>{isEmail ? 'Use a different email' : 'Use a different number'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FormSection title="Contact">
          <FormRow
            label={isEmail ? 'Email' : 'Phone'}
            value={target}
            onChangeText={setTarget}
            placeholder={isEmail ? 'you@example.com' : '024 000 0000'}
            keyboardType={isEmail ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            textContentType={isEmail ? 'emailAddress' : 'telephoneNumber'}
            returnKeyType="done"
            onSubmitEditing={valid && !busy ? handleSend : undefined}
          />
          <FormNote>
            {isEmail
              ? "We use your email for receipts and card payments. We'll send a code to confirm it."
              : "We use your phone number to text you about your orders. We'll send a code to confirm it."}
          </FormNote>
        </FormSection>
      )}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  codeStep: { padding: 16, gap: 16 },
  codeIntro: { fontSize: 15, color: 'rgba(0,0,0,0.6)' },
  codeTarget: { color: '#000', fontWeight: '600' },
  link: { alignItems: 'center', paddingVertical: 12 },
  linkText: { fontWeight: '700', color: '#000' },
});
