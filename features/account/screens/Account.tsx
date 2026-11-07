import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';

// Profile view: edit the name, add a missing phone number, set a password, sign out.
export default function Account() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const saveProfile = useAuthStore((s) => s.saveProfile);
  const signOut = useAuthStore((s) => s.signOut);
  const [fullName, setFullName] = useState(`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim());
  const [saving, setSaving] = useState(false);

  const unchanged = fullName.trim() === `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  const handleSave = async () => {
    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    setSaving(true);
    try {
      await saveProfile(firstName, rest.join(' '));
      Alert.alert('Saved', 'Your name was updated.');
    } catch (error) {
      Alert.alert('Could not save your name', errorMessage(error));
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
        <Text style={styles.title}>My Account</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          maxLength={120}
          accessibilityLabel="Full name"
        />
        <PrimaryButton title={saving ? 'Saving...' : 'Save name'} disabled={saving || unchanged || fullName.trim() === ''} onPress={handleSave} />

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? 'Not added'}</Text>

        <Text style={styles.label}>Phone Number</Text>
        {user?.phoneNumber ? (
          <Text style={styles.value}>{user.phoneNumber}</Text>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('AddContact', { channel: 'phone' })} accessibilityRole="button">
            <Text style={styles.action}>Add phone number</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('SetPassword')} accessibilityRole="button">
          <Text style={styles.action}>Set or change password</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={signOut} accessibilityRole="button">
          <Text style={styles.action}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  header: { marginVertical: 16 },
  body: { gap: 12 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  value: { fontSize: 16, color: 'rgba(0,0,0,0.7)' },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F4F4F4',
  },
  action: { fontSize: 16, fontWeight: '700', color: '#007AFF', paddingVertical: 8 },
});
