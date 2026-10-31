import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { findUserByPhone, findUserByEmail, setSession } from '@/lib/mockUserStore';

const OTPVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const { channel = 'phone', target = '' } = (route?.params as { channel?: string; target?: string }) || {};

  const handleInputChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    // Placeholder verification — any 4-digit code is accepted until the real
    // OTP backend (SMS/email sending + verification) is wired up.
    setVerifying(true);
    try {
      const existing = channel === 'phone' ? await findUserByPhone(target) : await findUserByEmail(target);

      if (existing) {
        await setSession(existing);
        navigation.navigate('Home');
        return;
      }

      if (channel === 'phone') {
        navigation.navigate('CompleteProfile', {
          method: 'phone',
          knownPhone: target,
          requireFullName: true,
          requireEmail: false,
          requirePhone: false,
        });
      } else {
        navigation.navigate('CompleteProfile', {
          method: 'email',
          knownEmail: target,
          requireFullName: true,
          requireEmail: false,
          requirePhone: true,
        });
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOTP = () => {
    Alert.alert('OTP Resent', `A new verification code has been sent to ${target || 'your contact'}.`);
  };

  const isButtonDisabled = otp.some((value) => value === '');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButtonWrapper}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <Text style={styles.headerTitle}>OTP Verification</Text>
      </View>
      <Text style={styles.label}>Enter OTP Code</Text>
      <Text style={styles.subtitle}>
        Enter the verification code we just sent to {channel === 'email' ? 'your email' : 'your mobile number'}.
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((value, index) => (
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
            onChangeText={(text) => handleInputChange(text, index)}
            maxLength={1}
            keyboardType="numeric"
            returnKeyType="next"
            autoCapitalize="none"
          />
        ))}
      </View>

      <PrimaryButton title={verifying ? 'Verifying...' : 'Verify'} disabled={isButtonDisabled || verifying} onPress={handleVerifyOTP} />

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn’t receive a code? </Text>
        <TouchableOpacity onPress={handleResendOTP}>
          <Text style={styles.resendLink}>Resend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 20,
    marginBottom: 8,
    marginTop: 50,
    fontWeight: '600',
  },
  subtitle: {
    marginBottom: 24,
    color: 'rgba(0, 0, 0, 0.60)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  backButtonWrapper: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between'
  },
  input: {
    height: 60,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    borderWidth: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
    width: 80,
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

export default OTPVerification;
