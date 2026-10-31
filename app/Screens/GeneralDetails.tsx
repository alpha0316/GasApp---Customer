import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createUser, findUserByPhone, setSession } from '@/lib/mockUserStore';

// Finishes sign-up for whichever method the user came from — fields shown
// depend on what that method already knows about them:
//   phone + OTP  -> full name (required), email (optional)
//   google       -> phone number (required); name/email already known
//   email + OTP  -> full name (required), phone number (required)
export default function GeneralDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    method = 'phone',
    knownFullName = '',
    knownEmail = '',
    knownPhone = '',
    requireFullName = true,
    requireEmail = false,
    requirePhone = false,
    optionalEmail = method === 'phone',
  } = (route.params as any) || {};

  const [fullName, setFullName] = useState(knownFullName);
  const [email, setEmail] = useState(knownEmail);
  const [phone, setPhone] = useState(knownPhone);
  const [submitting, setSubmitting] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const isButtonDisabled =
    submitting ||
    (requireFullName && fullName.trim() === '') ||
    (requirePhone && phone.trim().length < 10);

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const resolvedPhone = requirePhone ? phone : knownPhone;

      if (requirePhone && resolvedPhone) {
        const existing = await findUserByPhone(resolvedPhone);
        if (existing) {
          Alert.alert(
            'Account already exists',
            'This phone number is linked to an existing account. Signing you in there instead.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await setSession(existing);
                  navigation.navigate('Home');
                },
              },
            ],
          );
          return;
        }
      }

      await createUser({
        fullName: requireFullName ? fullName.trim() : knownFullName,
        email: requireEmail || optionalEmail ? email.trim() || undefined : knownEmail || undefined,
        phone: resolvedPhone || undefined,
        method,
      });
      navigation.navigate('Home');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
      </View>

      {requireFullName && (
        <>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            returnKeyType={requireEmail || optionalEmail ? 'next' : requirePhone ? 'next' : 'done'}
            onSubmitEditing={() => (requireEmail || optionalEmail ? emailRef.current?.focus() : phoneRef.current?.focus())}
            placeholder="Enter your full name"
          />
        </>
      )}

      {(requireEmail || optionalEmail) && (
        <>
          <Text style={styles.label}>Email {optionalEmail && !requireEmail ? '(optional)' : ''}</Text>
          <TextInput
            ref={emailRef}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType={requirePhone ? 'next' : 'done'}
            onSubmitEditing={() => phoneRef.current?.focus()}
            placeholder="Enter your email"
          />
        </>
      )}

      {requirePhone && (
        <>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            ref={phoneRef}
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
            returnKeyType="done"
            placeholder="Enter your phone number"
          />
        </>
      )}

      <PrimaryButton title={submitting ? 'Saving...' : 'Finish'} disabled={isButtonDisabled} onPress={handleFinish} />
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
    gap: 12,
    marginVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
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
});
