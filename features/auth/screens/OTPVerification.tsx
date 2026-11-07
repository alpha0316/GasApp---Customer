import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { requestOtp } from '@/features/auth/api';
import OtpCodeInput from '@/features/auth/OtpCodeInput';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';

const OTPVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const signInWithOtp = useAuthStore((s) => s.signInWithOtp);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { channel = 'phone', target = '' } = (route?.params as { channel?: string; target?: string }) || {};
  const apiChannel = channel === 'email' ? 'email' : 'sms';

  const handleVerifyOTP = async () => {
    setVerifying(true);
    try {
      // On success the auth store swaps the navigator to Home (or to the profile step).
      await signInWithOtp(apiChannel, target, code);
    } catch (error) {
      Alert.alert('Could not verify the code', errorMessage(error));
      setVerifying(false);
    }
  };

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

      <OtpCodeInput target={target} onChange={setCode} onResend={() => requestOtp(apiChannel, target)} />

      <PrimaryButton title={verifying ? 'Verifying...' : 'Verify'} disabled={code === '' || verifying} onPress={handleVerifyOTP} />
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
});

export default OTPVerification;
