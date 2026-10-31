import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';

const EmailSignIn = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const isButtonDisabled = !email.includes('@') || !email.includes('.');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <View style={{ marginTop: 64, gap: 12 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 24, fontWeight: '700' }}>Get your gas refilled effortlessly</Text>
          <Text style={{ fontSize: 16, color: 'rgba(0,0,0,0.6)' }}>Enter your email to start!</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: email ? '#000' : 'rgba(0, 0, 0, 0.20)',
              backgroundColor: email ? '#fff' : '#F4F4F4',
            },
          ]}
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
          placeholder='Enter your email'
          placeholderTextColor={'rgba(0,0,0,.5)'}
          returnKeyType='done'
        />
        <PrimaryButton
          title='Continue'
          disabled={isButtonDisabled}
          onPress={() => navigation.navigate('OTPVerification', { channel: 'email', target: email })}
        />
        <View>
          <Text style={{ fontSize: 16, color: 'rgba(0,0,0,0.6)', textAlign: 'center' }}>
            An OTP code will be sent to your email for verification
          </Text>
        </View>
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
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  input: {
    height: 50,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    borderWidth: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
});

export default EmailSignIn;
