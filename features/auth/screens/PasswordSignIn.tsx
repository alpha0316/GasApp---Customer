import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';

// The navigator swaps to the signed-in screens once the session exists.
export default function PasswordSignIn() {
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const disabled = identifier.trim().length === 0 || password.length === 0 || submitting;

  const handleSignIn = async () => {
    setSubmitting(true);
    try {
      await signInWithPassword(identifier.trim(), password);
    } catch (error) {
      Alert.alert('Could not sign in', errorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <View style={styles.body}>
        <View style={{ gap: 4 }}>
          <Text style={styles.title}>Sign in with your password</Text>
          <Text style={styles.subtitle}>Use your phone number or email.</Text>
        </View>

        <Text style={styles.label}>Phone number or email</Text>
        <TextInput
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Enter your phone number or email"
          placeholderTextColor="rgba(0,0,0,.5)"
          returnKeyType="next"
          accessibilityLabel="Phone number or email"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Enter your password"
          placeholderTextColor="rgba(0,0,0,.5)"
          returnKeyType="done"
          onSubmitEditing={disabled ? undefined : handleSignIn}
          accessibilityLabel="Password"
        />

        <PrimaryButton title={submitting ? 'Signing in…' : 'Sign In'} disabled={disabled} onPress={handleSignIn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  body: { marginTop: 64, gap: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 16, color: 'rgba(0,0,0,0.6)' },
  label: { fontSize: 16 },
  input: {
    height: 50,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    borderWidth: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F4F4F4',
  },
});
