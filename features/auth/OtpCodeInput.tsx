import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { errorMessage } from '@/lib/api/client';

export const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

interface Props {
  // Called on every change with the full code, or '' while a box is empty.
  onChange: (code: string) => void;
  // Sends a new code. The 60 s timer restarts when it resolves.
  onResend: () => Promise<void>;
  // Shown in the "new code sent" alert.
  target: string;
}

// Six code boxes plus the resend timer, shared by every screen that verifies an OTP.
export default function OtpCodeInput({ onChange, onResend, target }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    onChange(next.some((d) => d === '') ? '' : next.join(''));

    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    } else if (!digit && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    try {
      await onResend();
      setSecondsLeft(RESEND_SECONDS);
      Alert.alert('OTP Resent', `A new verification code has been sent to ${target || 'your contact'}.`);
    } catch (error) {
      Alert.alert('Could not send the code', errorMessage(error));
    }
  };

  return (
    <>
      <View style={styles.otpContainer}>
        {digits.map((value, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputsRef.current[index] = ref; }}
            style={[
              styles.input,
              {
                borderColor: value ? '#000' : 'rgba(0, 0, 0, 0.20)',
                backgroundColor: value ? '#fff' : '#F4F4F4',
              },
            ]}
            value={value}
            onChangeText={(text) => handleChange(text, index)}
            maxLength={1}
            accessibilityLabel={`Code digit ${index + 1}`}
            textContentType="oneTimeCode"
            keyboardType="numeric"
            returnKeyType="next"
            autoCapitalize="none"
          />
        ))}
      </View>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn’t receive a code? </Text>
        <TouchableOpacity onPress={handleResend} disabled={secondsLeft > 0} accessibilityRole="button">
          <Text style={styles.resendLink}>{secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  input: {
    height: 60,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    borderWidth: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
    width: 48,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: {
    color: 'rgba(0, 0, 0, 0.60)',
    fontSize: 14,
  },
  resendLink: {
    fontWeight: '700',
    color: '#000',
  },
});
