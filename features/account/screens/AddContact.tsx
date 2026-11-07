import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { addContact, requestOtp } from '@/features/auth/api';
import OtpCodeInput from '@/features/auth/OtpCodeInput';
import { isValidEmail, isValidPhone } from '@/features/auth/profileGate';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';
import type { RootStackParamList } from '@/types/navigation';

type Params = RootStackParamList['AddContact'];

// Adds an email or phone number to the signed-in account: enter it, then confirm with a code.
// When `required` is set (sign-up gate) there is no back button; the navigator moves on once
// the account has an email.
export default function AddContact() {
  const navigation = useNavigation();
  const { channel, required = false } = useRoute().params as Params;
  const setUser = useAuthStore((s) => s.setUser);
  const signOut = useAuthStore((s) => s.signOut);
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

  const handleVerify = async () => {
    if (!sentTo) return;
    setBusy(true);
    try {
      setUser(await addContact(apiChannel, sentTo, code));
      if (!required) navigation.goBack();
    } catch (error) {
      Alert.alert('Could not verify the code', errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>{required ? null : <BackButton />}</View>

      <View style={styles.body}>
        <Text style={styles.title}>{isEmail ? 'Add your email' : 'Add your phone number'}</Text>
        <Text style={styles.subtitle}>
          {sentTo
            ? `Enter the code we sent to ${sentTo}.`
            : isEmail
              ? 'We use your email for receipts and card payments.'
              : 'We use your phone number to text you about your orders.'}
        </Text>

        {sentTo ? (
          <>
            <OtpCodeInput target={sentTo} onChange={setCode} onResend={() => requestOtp(apiChannel, sentTo)} />
            <PrimaryButton title={busy ? 'Verifying...' : 'Verify'} disabled={code === '' || busy} onPress={handleVerify} />
            <TouchableOpacity onPress={() => setSentTo(null)} accessibilityRole="button" style={styles.link}>
              <Text style={styles.linkText}>{isEmail ? 'Use a different email' : 'Use a different number'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>{isEmail ? 'Email' : 'Phone Number'}</Text>
            <TextInput
              style={styles.input}
              value={target}
              onChangeText={setTarget}
              placeholder={isEmail ? 'you@example.com' : '024 000 0000'}
              keyboardType={isEmail ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType={isEmail ? 'emailAddress' : 'telephoneNumber'}
              accessibilityLabel={isEmail ? 'Email' : 'Phone number'}
              returnKeyType="done"
              onSubmitEditing={valid && !busy ? handleSend : undefined}
            />
            <PrimaryButton title={busy ? 'Sending...' : 'Send code'} disabled={!valid || busy} onPress={handleSend} />
          </>
        )}

        {required ? (
          <TouchableOpacity onPress={signOut} accessibilityRole="button" style={styles.link}>
            <Text style={styles.linkText}>Use a different account</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  header: { marginVertical: 16, minHeight: 40 },
  body: { gap: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 16, color: 'rgba(0,0,0,0.6)', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600' },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F4F4F4',
    marginBottom: 12,
  },
  link: { alignItems: 'center', paddingVertical: 12 },
  linkText: { fontWeight: '700', color: '#000' },
});
