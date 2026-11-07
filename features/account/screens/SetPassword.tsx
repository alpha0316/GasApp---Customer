import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { setPassword } from '@/features/auth/api';
import { errorMessage } from '@/lib/api/client';

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

export default function SetPassword() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const tooShort = newPassword.length > 0 && newPassword.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== newPassword;
  const disabled = newPassword.length < MIN_LENGTH || newPassword !== confirm || saving;

  const handleSave = async () => {
    setSaving(true);
    try {
      await setPassword(newPassword, currentPassword || undefined);
      Alert.alert('Password saved', 'You can now sign in with your password.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not save the password', errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Password</Text>
        <Text style={styles.subtitle}>Set a password to sign in without a code. Use 8 to 128 characters.</Text>

        <Text style={styles.label}>Current password (only if you already have one)</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Current password"
          placeholderTextColor="rgba(0,0,0,.5)"
          accessibilityLabel="Current password"
        />

        <Text style={styles.label}>New password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={MAX_LENGTH}
          placeholder="New password"
          placeholderTextColor="rgba(0,0,0,.5)"
          accessibilityLabel="New password"
        />
        {tooShort && <Text style={styles.error}>Use at least {MIN_LENGTH} characters.</Text>}

        <Text style={styles.label}>Confirm new password</Text>
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={MAX_LENGTH}
          placeholder="Confirm new password"
          placeholderTextColor="rgba(0,0,0,.5)"
          accessibilityLabel="Confirm new password"
        />
        {mismatch && <Text style={styles.error}>The passwords do not match.</Text>}

        <PrimaryButton title={saving ? 'Saving…' : 'Save Password'} disabled={disabled} onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  body: { marginTop: 32, gap: 12 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 16, color: 'rgba(0,0,0,0.6)' },
  label: { fontSize: 16 },
  error: { fontSize: 13, color: '#D92D20' },
  input: {
    height: 50,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    borderWidth: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F4F4F4',
  },
});
