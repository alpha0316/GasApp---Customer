import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle } from 'phosphor-react-native';
import PrimaryButton from '@/components/PrimaryButton';
import { FormNote, FormRow, FormScreen, FormSection } from '@/components/form/Form';
import { useAuthStore } from '@/features/auth/authStore';
import { sendContactMessage } from '@/features/account/api';
import { isValidEmail } from '@/features/auth/profileGate';
import { errorMessage } from '@/lib/api/client';
import type { RootStackParamList } from '@/types/navigation';

// Message a support agent. Lands on the admin dashboard's Messages page; the reply comes by email.
export default function ContactSupport() {
  const navigation = useNavigation();
  const { subject } = (useRoute().params ?? {}) as NonNullable<RootStackParamList['ContactSupport']>;
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim());
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const send = useMutation({ mutationFn: sendContactMessage });

  const canSubmit = !!name.trim() && isValidEmail(email) && message.trim().length >= 5 && !send.isPending;

  const handleSubmit = async () => {
    // The API wants a first and a last name; a single word is sent as the first name.
    const [firstName, ...rest] = name.trim().split(/\s+/);
    try {
      await send.mutateAsync({
        firstName,
        lastName: rest.join(' ') || '-',
        email: email.trim(),
        message: [subject ? `Topic: ${subject}` : null, user?.phoneNumber ? `Phone: ${user.phoneNumber}` : null, '', message.trim()]
          .filter((l) => l !== null)
          .join('\n')
          .trim(),
      });
      setSent(true);
    } catch (error) {
      Alert.alert('Could not send your message', errorMessage(error));
    }
  };

  if (sent) {
    return (
      <FormScreen title="Contact support" footer={<PrimaryButton title="Done" onPress={() => navigation.goBack()} />}>
        <View style={styles.done}>
          <View style={styles.doneIcon}>
            <CheckCircle size={44} weight="fill" color="#22C55E" />
          </View>
          <Text style={styles.doneTitle}>Message sent</Text>
          <Text style={styles.doneText}>Thanks for reaching out. Our team will reply to {email.trim()} within 24 hours.</Text>
        </View>
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title="Contact support"
      footer={<PrimaryButton title={send.isPending ? 'Sending…' : 'Send message'} onPress={handleSubmit} disabled={!canSubmit} />}
    >
      <FormSection title="Your details">
        <FormRow label="Name" value={name} onChangeText={setName} autoCapitalize="words" textContentType="name" />
        <FormRow label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" />
        {!!subject && <FormRow label="Topic" value={subject} readOnly />}
      </FormSection>

      <FormSection title="How can we help?">
        <TextInput
          style={styles.message}
          value={message}
          onChangeText={setMessage}
          placeholder="Tell us what happened. Include your order date if it's about an order."
          placeholderTextColor="rgba(0,0,0,0.4)"
          multiline
          maxLength={2000}
          accessibilityLabel="Message"
        />
        <FormNote>We reply by email, usually within 24 hours.</FormNote>
      </FormSection>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  message: {
    marginHorizontal: 16,
    marginTop: 12,
    minHeight: 150,
    padding: 14,
    paddingTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    backgroundColor: '#FAFAFA',
    fontSize: 15,
    textAlignVertical: 'top',
  },
  done: { alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingTop: 60 },
  doneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  doneTitle: { fontSize: 20, fontWeight: '700', color: '#000' },
  doneText: { fontSize: 14, color: 'rgba(0,0,0,0.6)', textAlign: 'center', lineHeight: 20 },
});
