import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Key, Trash } from 'phosphor-react-native';
import { DANGER, FormActionRow, FormNote, FormScreen, FormSection } from '@/components/form/Form';
import { useAuthStore } from '@/features/auth/authStore';
import DeleteAccountSheet from '@/features/account/DeleteAccountSheet';

function RowIcon({ color, children }: { color: string; children: React.ReactNode }) {
  return <View style={[styles.icon, { backgroundColor: color }]}>{children}</View>;
}

// Sign-in password and account deletion. Opened from Profile > Privacy & Security.
export default function PrivacySecurity() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteAccount = () => {
    // The request is confirmed by email, so the account needs one first.
    if (!user?.email) {
      Alert.alert('Add an email first', 'We need an email address to confirm your account deletion.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add email', onPress: () => navigation.navigate('AddContact', { channel: 'email' }) },
      ]);
      return;
    }
    setDeleteOpen(true);
  };

  return (
    <FormScreen title="Privacy & Security">
      <FormSection title="Sign in">
        <FormActionRow
          label="Set password"
          detail="Sign in with a password instead of a code"
          onPress={() => navigation.navigate('SetPassword')}
          icon={
            <RowIcon color="#2F3DE0">
              <Key size={14} weight="fill" color="#fff" />
            </RowIcon>
          }
        />
      </FormSection>

      <FormSection title="Account">
        <FormActionRow
          label="Delete Account"
          danger
          onPress={deleteAccount}
          icon={
            <RowIcon color={DANGER}>
              <Trash size={14} weight="fill" color="#fff" />
            </RowIcon>
          }
        />
        <FormNote>Permanently removes your account, saved details and order history.</FormNote>
      </FormSection>

      <DeleteAccountSheet visible={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  icon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
