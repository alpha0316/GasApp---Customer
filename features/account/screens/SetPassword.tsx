import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import { FormNote, FormRow, FormScreen, FormSection } from '@/components/form/Form';
import { setPassword } from '@/features/auth/api';
import { errorMessage } from '@/lib/api/client';

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

const passwordInput = {
  secureTextEntry: true,
  autoCapitalize: 'none',
  autoCorrect: false,
  maxLength: MAX_LENGTH,
} as const;

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
    <FormScreen
      title="Password"
      footer={<PrimaryButton title={saving ? 'Saving…' : 'Save Password'} disabled={disabled} onPress={handleSave} />}
    >
      <FormNote>Set a password to sign in without a code. Use 8 to 128 characters.</FormNote>

      <FormSection title="Current password">
        <FormRow label="Current" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Only if you have one" textContentType="password" {...passwordInput} />
      </FormSection>

      <FormSection title="New password">
        <FormRow label="New" value={newPassword} onChangeText={setNewPassword} placeholder="At least 8 characters" textContentType="newPassword" {...passwordInput} />
        <FormRow label="Confirm" value={confirm} onChangeText={setConfirm} placeholder="Type it again" textContentType="newPassword" {...passwordInput} />
        {tooShort && <FormNote error>Use at least {MIN_LENGTH} characters.</FormNote>}
        {mismatch && <FormNote error>The passwords do not match.</FormNote>}
      </FormSection>
    </FormScreen>
  );
}
