import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import { FormNote, FormRow, FormScreen, FormSection } from '@/components/form/Form';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';

// Name, phone and email. Opened from the Profile screen. The name is edited here; a phone or
// email is added through AddContact, which confirms it with a code.
export default function PersonalInfo() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const saveProfile = useAuthStore((s) => s.saveProfile);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);

  const unchanged = firstName.trim() === (user?.firstName ?? '') && lastName.trim() === (user?.lastName ?? '');
  const initial = (firstName.trim()[0] ?? user?.firstName?.[0] ?? 'G').toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile(firstName.trim(), lastName.trim());
      Alert.alert('Saved', 'Your name was updated.');
    } catch (error) {
      Alert.alert('Could not save your name', errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen
      title="Personal Information"
      footer={
        <PrimaryButton
          title={saving ? 'Saving...' : 'Save'}
          disabled={saving || unchanged || firstName.trim() === ''}
          onPress={handleSave}
        />
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <FormSection title="Basic info">
        <FormRow label="First name" value={firstName} onChangeText={setFirstName} maxLength={60} autoCapitalize="words" textContentType="givenName" />
        <FormRow label="Last name" value={lastName} onChangeText={setLastName} maxLength={60} autoCapitalize="words" textContentType="familyName" />
      </FormSection>

      <FormSection title="Contact">
        {user?.phoneNumber ? (
          <FormRow label="Phone" value={user.phoneNumber} readOnly />
        ) : (
          <FormRow label="Phone" placeholder="Add phone number" onPress={() => navigation.navigate('AddContact', { channel: 'phone' })} />
        )}
        {user?.email ? (
          <FormRow label="Email" value={user.email} readOnly />
        ) : (
          <FormRow label="Email" placeholder="Add email" onPress={() => navigation.navigate('AddContact', { channel: 'email' })} />
        )}
        <FormNote>Your phone number and email are verified with a code, so they can&apos;t be edited here.</FormNote>
      </FormSection>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#0A6CFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '700' },
});
