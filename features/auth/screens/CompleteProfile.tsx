import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';

// Finishes sign-up: the API needs a first name before the account is usable.
// The full name is split at the first space (last name may stay empty).
export default function CompleteProfile() {
  const navigation = useNavigation();
  const saveProfile = useAuthStore((s) => s.saveProfile);
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isButtonDisabled = submitting || fullName.trim() === '';

  const handleFinish = async () => {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
      </View>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        returnKeyType="done"
        onSubmitEditing={handleFinish}
        placeholder="Enter your full name"
        accessibilityLabel="Full name"
        maxLength={120}
      />

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
