import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, FIREBASE_AUTH } from '../../firebaseConfig';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';



const PhoneNumber = () => {
  const navigation = useNavigation();

  
  const [phoneNumber, setPhoneNumber] = useState('');



  {/*const isButtonDisabled = email === '' || password === ''
   const handleSignIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword (auth, email, password)
      console.log(response)
      navigation.navigate('SelectHostel')
    } catch (error) {
      console.error('Error signing in: ', error);
      alert('Sign in failed:' + error.message);
    } finally{
      setLoading(false)
    }
  };
  */}

  const isButtonDisabled = phoneNumber.length < 10  

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
            keyboardType='numeric'
            autoCapitalize="none"
            placeholder='Enter your phone number'
            placeholderTextColor={'rgba(0,0,0,.5)'}
            returnKeyType="done"
            
          />
          <PrimaryButton
            title='Continue'
            disabled={isButtonDisabled}
            onPress={() => navigation.navigate('OTPVerification', { channel: 'phone', target: phoneNumber })}
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
