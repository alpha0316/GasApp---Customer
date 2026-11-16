import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/authStore';
import { addContact, requestOtp } from '@/features/auth/api';
import { isValidEmail } from '@/features/auth/profileGate';
import OtpCodeInput from '@/features/auth/OtpCodeInput';
import { errorMessage } from '@/lib/api/client';

// Finishes sign-up: the API needs a first name before the account is usable.
// The full name is split at the first space (last name may stay empty).
// Email is optional here so sign-up never gets blocked on it; entering one
// switches to an inline OTP step, after which Finish saves both.
export default function CompleteProfile() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const saveProfile = useAuthStore((s) => s.saveProfile);
  const setUser = useAuthStore((s) => s.setUser);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);

  const nameValid = fullName.trim() !== '';
  const emailValid = isValidEmail(email);

  const finishProfile = async () => {
    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    setSubmitting(true);
    try {
      // The auth store moves the user to Home once the name is saved.
      await saveProfile(firstName, rest.join(' '));
    } catch (error) {
      Alert.alert('Could not save your profile', errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEmailCode = async () => {
    const value = email.trim();
    setSending(true);
    try {
      await requestOtp('email', value);
      setSentTo(value);
    } catch (error) {
      Alert.alert('Could not send the code', errorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!sentTo) return;
    setSubmitting(true);
    try {
      setUser(await addContact('email', sentTo, code));
      await finishProfile();
    } catch (error) {
      Alert.alert('Could not verify the code', errorMessage(error));
      setSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <BackButton onPress={() => setSentTo(null)} />
        </View>

        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>Enter the code we sent to {sentTo}.</Text>

        <OtpCodeInput target={sentTo} onChange={setCode} onResend={() => requestOtp('email', sentTo)}>
          <PrimaryButton
            title={submitting ? 'Verifying...' : 'Verify'}
            disabled={code === '' || submitting}
            onPress={handleVerifyEmail}
          />
        </OtpCodeInput>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <Text style={styles.title}>Complete Your Profile</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        returnKeyType="next"
        placeholder="Enter your full name"
        accessibilityLabel="Full name"
        maxLength={120}
      />

      <Text style={styles.label}>Email (optional)</Text>
      <Text style={styles.helperText}>We use your email for receipts and card payments.</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        returnKeyType="done"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        accessibilityLabel="Email"
      />

      {email.trim() !== '' ? (
        <TouchableOpacity
          onPress={handleSendEmailCode}
          disabled={!emailValid || sending}
          accessibilityRole="button"
          style={styles.link}
        >
          <Text style={[styles.linkText, (!emailValid || sending) && styles.linkTextDisabled]}>
            {sending ? 'Sending code...' : 'Verify email'}
          </Text>
        </TouchableOpacity>
      ) : null}

      <PrimaryButton title={submitting ? 'Saving...' : 'Finish'} disabled={!nameValid || submitting} onPress={finishProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.60)',
    marginBottom: 8,
    marginTop: -4,
  },
  input: {
    height: 50,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    borderWidth: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
  },
  link: { alignItems: 'center', paddingVertical: 4, marginBottom: 12, marginTop: -8 },
  linkText: { fontWeight: '700', color: '#000' },
  linkTextDisabled: { color: 'rgba(0,0,0,0.3)' },
});
