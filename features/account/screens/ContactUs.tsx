import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Linking, Modal, Alert } from 'react-native';
import { CheckCircle, EnvelopeSimple, MapPin, Phone } from 'phosphor-react-native';
import { useMutation } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppMenuButton from '@/components/AppMenu';
import PrimaryButton from '@/components/PrimaryButton';
import { sendContactMessage } from '@/features/account/api';
import { useSettings } from '@/features/catalog/hooks';
import { errorMessage } from '@/lib/api/client';

const PRIMARY = '#007AFF';
const PRIMARY_TINT = 'rgba(0,122,255,0.10)';
const GREEN = '#52B922';

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ size: number; weight: 'bold'; color: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <View style={styles.contactRow}>
      <View style={styles.contactIcon}>
        <Icon size={18} weight="bold" color={PRIMARY} />
      </View>
      <View style={{ gap: 2, flexShrink: 1 }}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
    </View>
  );

  if (!href) return content;
  return (
    <TouchableOpacity onPress={() => Linking.openURL(href)} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

function FormField({
  label,
  value,
  onChange,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : undefined}
        accessibilityLabel={label}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
      />
    </View>
  );
}

export default function ContactUs() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sentAlert, setSentAlert] = useState(false);

  const contactInfo = useSettings().data?.contact;
  const send = useMutation({ mutationFn: sendContactMessage });

  const looksLikeEmail = /^\S+@\S+\.\S+$/.test(email.trim());
  const canSubmit = !!(name.trim() && looksLikeEmail && message.trim().length >= 5) && !send.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    // The API wants a first and a last name; a single word is sent as the first name.
    const [firstName, ...rest] = name.trim().split(/\s+/);
    try {
      await send.mutateAsync({
        firstName,
        lastName: rest.join(' ') || '-',
        email: email.trim(),
        message: message.trim(),
      });
      setSentAlert(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      Alert.alert('Could not send your message', errorMessage(error));
    }
  };

  return (
    <View style={styles.main}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <AppMenuButton active="contact" />
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View>
            <Text style={styles.cardTitle}>We&apos;re here to help</Text>
            <Text style={styles.cardSubtitle}>
              Questions about your order, delivery, or becoming a rider? Reach out any of these ways and we&apos;ll get
              back to you within 24 hours.
            </Text>
          </View>

          <View>
            {!!contactInfo?.supportEmail && (
              <ContactRow
                icon={EnvelopeSimple}
                label="Email Support"
                value={contactInfo.supportEmail}
                href={`mailto:${contactInfo.supportEmail}`}
              />
            )}
            {!!contactInfo?.phones.length && (
              <>
                <View style={styles.divider} />
                <ContactRow
                  icon={Phone}
                  label="Phone / WhatsApp"
                  value={contactInfo.phones.map((p) => p.number).join('\n')}
                  href={`tel:${contactInfo.phones[0].number.replace(/\s/g, '')}`}
                />
              </>
            )}
            {!!contactInfo?.addresses.length && (
              <>
                <View style={styles.divider} />
                <ContactRow icon={MapPin} label="Locate Us At" value={contactInfo.addresses.join('\n')} />
              </>
            )}
          </View>
        </Card>

        <Card>
          <View>
            <Text style={styles.cardTitle}>Send us a message</Text>
            <Text style={styles.cardSubtitle}>Fill in your details and we&apos;ll follow up.</Text>
          </View>

          <FormField label="Full Name" value={name} onChange={setName} />
          <FormField label="Email" value={email} onChange={setEmail} keyboardType="email-address" />
          <FormField label="Message" value={message} onChange={setMessage} multiline />

          <PrimaryButton title={send.isPending ? 'Sending…' : 'Send Message'} onPress={handleSubmit} disabled={!canSubmit} />
        </Card>
      </ScrollView>

      <Modal visible={sentAlert} animationType="fade" transparent onRequestClose={() => setSentAlert(false)}>
        <View style={styles.alertOverlay}>
          <View style={styles.alertCard}>
            <View style={styles.alertIconCircle}>
              <CheckCircle size={28} weight="fill" color={GREEN} />
            </View>
            <Text style={styles.alertTitle}>Message Sent</Text>
            <Text style={styles.alertMessage}>
              Thanks for reaching out — our team will get back to you within 24 hours.
            </Text>
            <TouchableOpacity style={styles.alertButton} onPress={() => setSentAlert(false)}>
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 4,
    lineHeight: 19,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PRIMARY_TINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FAFAFA',
    fontSize: 14,
  },
  fieldInputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  alertCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  alertIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(82,185,34,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  alertMessage: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 8,
  },
  alertButton: {
    alignSelf: 'stretch',
    backgroundColor: '#000',
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
