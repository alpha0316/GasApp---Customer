import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import { requestOtp } from '@/features/auth/api';
import { errorMessage } from '@/lib/api/client';

const PhoneNumber = () => {
  const navigation = useNavigation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [sending, setSending] = useState(false);

  const isButtonDisabled = phoneNumber.trim().length < 10 || sending

  const handleContinue = async () => {
    const target = phoneNumber.trim();
    setSending(true);
    try {
      await requestOtp('sms', target);
      navigation.navigate('OTPVerification', { channel: 'phone', target });
    } catch (error) {
      Alert.alert('Could not send the code', errorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
       <View style={styles.header}>
        <BackButton />
      </View>

      <View style={{
        marginTop : 64,
        gap : 12
      }}>

        <View style ={{
          gap : 4
        }}>
            <Text style={{
              fontSize : 24,
              fontWeight : '700'
            }}>Get your gas refilled effortlessly</Text>
    
            <Text style={{
              fontSize : 16,
              color : 'rgba(0,0,0,0.6)'
            }}>Enter your phone number to start!</Text>
        </View>



          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input,
              {
                borderColor: phoneNumber ? '#000' : 'rgba(0, 0, 0, 0.20)',
                backgroundColor: phoneNumber ? '#fff' : '#F4F4F4',
              }
            ]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType='phone-pad'
            autoCapitalize="none"
            placeholder='Enter your phone number'
            placeholderTextColor={'rgba(0,0,0,.5)'}
            returnKeyType="done"
            accessibilityLabel="Phone number"
          />
          <PrimaryButton
            title='Continue'
            disabled={isButtonDisabled}
            onPress={handleContinue}
          />
          <View>
            <Text style={{
                fontSize : 16,
                color : 'rgba(0,0,0,0.6)',
                textAlign : 'center'
            }}>An OTP code will be sent to your number for verification</Text>
          </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor : 'white'
  },
  label: {
    fontSize: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: '110%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    height: 50,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    borderWidth: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  text : {
    flexDirection : 'row',
    alignItems : 'center',
    justifyContent : 'center',
    gap : 4,
  }

});

export default PhoneNumber;
