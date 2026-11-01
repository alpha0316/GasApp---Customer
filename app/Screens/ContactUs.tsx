import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Linking, Modal } from 'react-native';
import { CheckCircle, EnvelopeSimple, MapPin, Phone } from 'phosphor-react-native';
import BackButton from '@/components/BackButton';
import PrimaryButton from '@/components/PrimaryButton';

const PRIMARY = '#007AFF';
const PRIMARY_TINT = 'rgba(0,122,255,0.10)';
const GREEN = '#52B922';

const SUPPORT_EMAIL = 'princeessandoh316@gmail.com';
const SUPPORT_PHONES = ['055 948 8201', '020 091 0403'];

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
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
      />
    </View>
  );
}

export default function ContactUs() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [sentAlert, setSentAlert] = useState(false);

  const canSubmit = !!(name.trim() && contact.trim() && message.trim());

  // No support-ticket backend exists yet — this just confirms receipt
  // locally so the form is fully demonstrable. Swap for a real API call
  // once a contact/support endpoint is wired up.
  const handleSubmit = () => {
    if (!canSubmit) return;
    setSentAlert(true);
    setName('');
    setContact('');
    setMessage('');
  };

  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View>
            <Text style={styles.cardTitle}>We're here to help</Text>
            <Text style={styles.cardSubtitle}>
              Questions about your order, delivery, or becoming a rider? Reach out any of these ways and we'll get
              back to you within 24 hours.
            </Text>
          </View>

          <View>
            <ContactRow icon={EnvelopeSimple} label="Email Support" value={SUPPORT_EMAIL} href={`mailto:${SUPPORT_EMAIL}`} />
            <View style={styles.divider} />
            <ContactRow
              icon={Phone}
              label="Phone / WhatsApp"
              value={SUPPORT_PHONES.join('\n')}
              href={`tel:${SUPPORT_PHONES[0].replace(/\s/g, '')}`}
            />
            <View style={styles.divider} />
            <ContactRow icon={MapPin} label="Locate Us At" value={'Accra, Ghana\nKumasi, Ghana'} />
          </View>
        </Card>

        <Card>
          <View>
            <Text style={styles.cardTitle}>Send us a message</Text>
            <Text style={styles.cardSubtitle}>Fill in your details and we'll follow up.</Text>
          </View>

          <FormField label="Full Name" value={name} onChange={setName} />
          <FormField label="Email or Phone" value={contact} onChange={setContact} keyboardType="email-address" />
          <FormField label="Message" value={message} onChange={setMessage} multiline />

          <PrimaryButton title="Send Message" onPress={handleSubmit} disabled={!canSubmit} />
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
