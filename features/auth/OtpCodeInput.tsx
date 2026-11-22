import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { errorMessage } from '@/lib/api/client';

export const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

interface Props {
  // Called on every change with the full code, or '' until all digits are entered.
  onChange: (code: string) => void;
  // Called once each time the last digit lands (typed, pasted or SMS-autofilled),
  // so screens can verify without waiting for a tap on the button.
  onComplete?: (code: string) => void;
  // Sends a new code. The 60 s timer restarts when it resolves.
  onResend: () => Promise<void>;
  // Shown in the "new code sent" alert.
  target: string;
  // Rendered between the code boxes and the resend row, e.g. the Verify button,
  // so it sits within easy thumb reach instead of below the resend timer.
  children?: React.ReactNode;
}

// Six code boxes plus the resend timer, shared by every screen that verifies an OTP.
// The boxes are drawn from one invisible TextInput stretched over them. iOS SMS
// autofill and paste insert the whole code into a single field, so one input
// with maxLength 6 receives all digits at once instead of only the first box.
export default function OtpCodeInput({ onChange, onComplete, onResend, target, children }: Props) {
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (value: string) => {
    const next = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    const wasComplete = code.length === OTP_LENGTH;
    setCode(next);
    const complete = next.length === OTP_LENGTH;
    onChange(complete ? next : '');
    if (complete && !wasComplete) onComplete?.(next);
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

  const activeIndex = Math.min(code.length, OTP_LENGTH - 1);

  return (
    <>
      <View style={styles.otpContainer}>
        {Array.from({ length: OTP_LENGTH }, (_, index) => {
          const digit = code[index] ?? '';
          const active = focused && index === activeIndex;
          return (
            <View
              key={index}
              style={[
                styles.box,
                {
                  borderColor: digit || active ? '#000' : 'rgba(0, 0, 0, 0.20)',
                  backgroundColor: digit || active ? '#fff' : '#F4F4F4',
                },
              ]}
            >
              <Text style={styles.digit}>{digit}</Text>
            </View>
          );
        })}

        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={OTP_LENGTH}
          selection={{ start: code.length, end: code.length }}
          caretHidden
          accessibilityLabel="Verification code"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {children}

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
  box: {
    height: 60,
    width: 48,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  // Covers the boxes so a tap anywhere on them focuses it; its own text is invisible.
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    color: 'transparent',
    backgroundColor: 'transparent',
    fontSize: 1,
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
