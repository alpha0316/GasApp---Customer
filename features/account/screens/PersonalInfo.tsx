import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';

// Name, email and phone number. Opened from the Profile screen.
export default function PersonalInfo() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const saveProfile = useAuthStore((s) => s.saveProfile);
  const currentName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  const [fullName, setFullName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  const unchanged = fullName.trim() === currentName;

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
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          maxLength={120}
          accessibilityLabel="Full name"
        />
        <PrimaryButton
          title={saving ? 'Saving...' : 'Save name'}
          disabled={saving || unchanged || fullName.trim() === ''}
          onPress={handleSave}
        />

        <Text style={styles.label}>Email</Text>
        {user?.email ? (
          <Text style={styles.value}>{user.email}</Text>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('AddContact', { channel: 'email' })} accessibilityRole="button">
            <Text style={styles.action}>Add email</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Phone Number</Text>
        {user?.phoneNumber ? (
          <Text style={styles.value}>{user.phoneNumber}</Text>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('AddContact', { channel: 'phone' })} accessibilityRole="button">
            <Text style={styles.action}>Add phone number</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  body: { gap: 12, padding: 16 },
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
