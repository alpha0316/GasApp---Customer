import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { requestOtp } from '@/features/auth/api';
import OtpCodeInput from '@/features/auth/OtpCodeInput';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';

const OTPVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const signInWithOtp = useAuthStore((s) => s.signInWithOtp);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { channel = 'phone', target = '' } = (route?.params as { channel?: string; target?: string }) || {};
  const apiChannel = channel === 'email' ? 'email' : 'sms';

  const handleVerifyOTP = async (entered: string = code) => {
    if (verifying) return;
    setVerifying(true);
    try {
      // On success the auth store swaps the navigator to Home (or to the profile step).
      await signInWithOtp(apiChannel, target, entered);
    } catch (error) {
      Alert.alert('Could not verify the code', errorMessage(error));
      setVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.label}>Enter OTP Code</Text>
      <Text style={styles.subtitle}>
        Enter the verification code we just sent to {channel === 'email' ? 'your email' : 'your mobile number'}.
      </Text>

      <OtpCodeInput target={target} onChange={setCode} onComplete={handleVerifyOTP} onResend={() => requestOtp(apiChannel, target)}>
        <PrimaryButton title={verifying ? 'Verifying...' : 'Verify'} disabled={code === '' || verifying} onPress={() => handleVerifyOTP()} />
      </OtpCodeInput>
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
    marginBottom: 16,
  },
});

export default OTPVerification;
