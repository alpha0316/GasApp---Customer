import React, { useState, useRef, useEffect,  } from 'react';
import { View, Text, Image, Alert, StyleSheet, TouchableOpacity, ImageSourcePropType, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '@/components/PrimaryButton';
import Svg, { Path } from 'react-native-svg';


import BackButton from '@/components/BackButton';

const OrderIDPage = () => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [afterDelay, setAfterDelay] = useState(false);



 const topAnim = useRef(new Animated.Value(-200)).current; // Start at -70

  useEffect(() => {
    Animated.timing(topAnim, {
      toValue: afterDelay ? -100 : 0,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [afterDelay]);

  
///bento animation

//first card
  const topBent = useRef(new Animated.Value(-200)).current; // Start at -70

  useEffect(() => {
    Animated.timing(topBent, {
      toValue: afterDelay ? -20 : 0,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [afterDelay]);

  //second card
  const secBent = useRef(new Animated.Value(-200)).current; // Start at -70

  useEffect(() => {
    Animated.timing(secBent, {
      toValue: afterDelay ? -10 : -30,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [afterDelay]);

    //third card
  const thiBent = useRef(new Animated.Value(-200)).current; // Start at -70

  useEffect(() => {
    Animated.timing(thiBent, {
      toValue: afterDelay ? -40 : -60,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [afterDelay]);





  return (
    <View style={styles.container}>

    <View style = {{
    }}>
      
        <Animated.Image style={{
        position: 'relative',
        top: topAnim,
      }} source={require('./../../assets/images/congra.png')} />

      


    </View>

    <View style={{
      display : 'flex',
      width : '100%',
      alignItems : 'center',
      top : "-10%",
   
      
    }}>

      <Animated.View style={{
        display : 'flex',
        paddingHorizontal: 16,
        width : '100%',
         backgroundColor : 'white',
        zIndex : 11,
        top : topBent,
      }} >
      <View style={{
        paddingHorizontal : 16,
        paddingVertical : 16,
        borderRadius : 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        alignItems : 'center',
        justifyContent : 'space-between',
        flexDirection: 'row',
      }}>

        <View style={{
          display : 'flex',
          flexDirection: 'row',
          gap : 8,
        }}>
            <Image source={require('./../../assets/images/Avatar.png')} />
            <View  style={{
              display : 'flex',
              flexDirection: 'column',
            }}>
              <Text>Essandoh Prince Takyi</Text>
              <Text style={{
                fontSize : 12,
                color : 'rgba(0, 0, 0, 0.60)',
              }}>GA - 007</Text>
            </View>
        </View>

        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <Path d="M17.9667 8.94997L16.8333 7.6333C16.6167 7.3833 16.4417 6.91663 16.4417 6.5833L16.4417 5.16663C16.4417 4.2833 15.7167 3.5583 14.8333 3.5583L13.4167 3.5583C13.0917 3.5583 12.6167 3.3833 12.3667 3.16663L11.05 2.0333C10.475 1.54163 9.53334 1.54163 8.95 2.0333L7.64167 3.17497C7.39167 3.3833 6.91667 3.5583 6.59167 3.5583L5.15 3.5583C4.26667 3.5583 3.54167 4.2833 3.54167 5.16663L3.54167 6.59163C3.54167 6.91663 3.36667 7.3833 3.15834 7.6333L2.03334 8.9583C1.55 9.5333 1.55 10.4666 2.03334 11.0416L3.15834 12.3666C3.36667 12.6166 3.54167 13.0833 3.54167 13.4083L3.54167 14.8333C3.54167 15.7166 4.26667 16.4416 5.15 16.4416L6.59167 16.4416C6.91667 16.4416 7.39167 16.6166 7.64167 16.8333L8.95834 17.9666C9.53334 18.4583 10.475 18.4583 11.0583 17.9666L12.375 16.8333C12.625 16.6166 13.0917 16.4416 13.425 16.4416L14.8417 16.4416C15.725 16.4416 16.45 15.7166 16.45 14.8333L16.45 13.4166C16.45 13.0916 16.625 12.6166 16.8417 12.3666L17.975 11.05C18.4583 10.475 18.4583 9.52497 17.9667 8.94997ZM13.4667 8.42497L9.44167 12.45C9.325 12.5666 9.16667 12.6333 9 12.6333C8.83334 12.6333 8.67501 12.5666 8.55834 12.45L6.54167 10.4333C6.3 10.1916 6.3 9.79163 6.54167 9.54997C6.78334 9.3083 7.18334 9.3083 7.425 9.54997L9 11.125L12.5833 7.54163C12.825 7.29997 13.225 7.29997 13.4667 7.54163C13.7083 7.7833 13.7083 8.1833 13.4667 8.42497Z" fill="#52B922"/>
        </Svg>

      </View>
    </Animated.View>

    <Animated.View style={{
        display : 'flex',
        paddingHorizontal: 16,
        width : 380,
        // display : 'absolute',
        top : secBent,
        zIndex : 1,
        backgroundColor : 'white',

      }} >
      <View style={{
        paddingHorizontal : 16,
        paddingVertical : 8,
        borderRadius : 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        alignItems : 'center',
        justifyContent : 'space-between',
        flexDirection: 'row',
        opacity : 0.9
      }}>

        <View style={{
          display : 'flex',
          flexDirection: 'row',
          gap : 8,
        }}>
            <View style={{
              width: 28,
              height: 28,
              borderRadius :50,
              backgroundColor : '#f4f4f4'
            }}></View>
            <View  style={{
              display : 'flex',
              flexDirection: 'column',
            }}>
              <Text>Nana Yaa Akyaa</Text>
              <Text style={{
                fontSize : 12,
                color : 'rgba(0, 0, 0, 0.60)',
              }}>GA - 008</Text>
            </View>
        </View>

        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <Path d="M17.9667 8.94997L16.8333 7.6333C16.6167 7.3833 16.4417 6.91663 16.4417 6.5833L16.4417 5.16663C16.4417 4.2833 15.7167 3.5583 14.8333 3.5583L13.4167 3.5583C13.0917 3.5583 12.6167 3.3833 12.3667 3.16663L11.05 2.0333C10.475 1.54163 9.53334 1.54163 8.95 2.0333L7.64167 3.17497C7.39167 3.3833 6.91667 3.5583 6.59167 3.5583L5.15 3.5583C4.26667 3.5583 3.54167 4.2833 3.54167 5.16663L3.54167 6.59163C3.54167 6.91663 3.36667 7.3833 3.15834 7.6333L2.03334 8.9583C1.55 9.5333 1.55 10.4666 2.03334 11.0416L3.15834 12.3666C3.36667 12.6166 3.54167 13.0833 3.54167 13.4083L3.54167 14.8333C3.54167 15.7166 4.26667 16.4416 5.15 16.4416L6.59167 16.4416C6.91667 16.4416 7.39167 16.6166 7.64167 16.8333L8.95834 17.9666C9.53334 18.4583 10.475 18.4583 11.0583 17.9666L12.375 16.8333C12.625 16.6166 13.0917 16.4416 13.425 16.4416L14.8417 16.4416C15.725 16.4416 16.45 15.7166 16.45 14.8333L16.45 13.4166C16.45 13.0916 16.625 12.6166 16.8417 12.3666L17.975 11.05C18.4583 10.475 18.4583 9.52497 17.9667 8.94997ZM13.4667 8.42497L9.44167 12.45C9.325 12.5666 9.16667 12.6333 9 12.6333C8.83334 12.6333 8.67501 12.5666 8.55834 12.45L6.54167 10.4333C6.3 10.1916 6.3 9.79163 6.54167 9.54997C6.78334 9.3083 7.18334 9.3083 7.425 9.54997L9 11.125L12.5833 7.54163C12.825 7.29997 13.225 7.29997 13.4667 7.54163C13.7083 7.7833 13.7083 8.1833 13.4667 8.42497Z" fill="#52B922"/>
        </Svg>

      </View>
    </Animated.View>

    <Animated.View style={{
        display : 'flex',
        paddingHorizontal: 16,
        width : 320,
        // display : 'absolute',
        top : thiBent,
      }} >
      <View style={{
        paddingHorizontal : 16,
        paddingVertical : 8,
        borderRadius : 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        alignItems : 'center',
        justifyContent : 'space-between',
        flexDirection: 'row',
        opacity : 0.7
      }}>

        <View style={{
          display : 'flex',
          flexDirection: 'row',
          gap : 8,
        }}>
            <View style={{
              width: 28,
              height: 28,
              borderRadius :50,
              backgroundColor : '#f4f4f4'
            }}></View>
            <View  style={{
              display : 'flex',
              flexDirection: 'column',
            }}>
              <Text>Rashida Mohammed</Text>
              <Text style={{
                fontSize : 12,
                color : 'rgba(0, 0, 0, 0.60)',
              }}>GA - 009</Text>
            </View>
        </View>

        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <Path d="M17.9667 8.94997L16.8333 7.6333C16.6167 7.3833 16.4417 6.91663 16.4417 6.5833L16.4417 5.16663C16.4417 4.2833 15.7167 3.5583 14.8333 3.5583L13.4167 3.5583C13.0917 3.5583 12.6167 3.3833 12.3667 3.16663L11.05 2.0333C10.475 1.54163 9.53334 1.54163 8.95 2.0333L7.64167 3.17497C7.39167 3.3833 6.91667 3.5583 6.59167 3.5583L5.15 3.5583C4.26667 3.5583 3.54167 4.2833 3.54167 5.16663L3.54167 6.59163C3.54167 6.91663 3.36667 7.3833 3.15834 7.6333L2.03334 8.9583C1.55 9.5333 1.55 10.4666 2.03334 11.0416L3.15834 12.3666C3.36667 12.6166 3.54167 13.0833 3.54167 13.4083L3.54167 14.8333C3.54167 15.7166 4.26667 16.4416 5.15 16.4416L6.59167 16.4416C6.91667 16.4416 7.39167 16.6166 7.64167 16.8333L8.95834 17.9666C9.53334 18.4583 10.475 18.4583 11.0583 17.9666L12.375 16.8333C12.625 16.6166 13.0917 16.4416 13.425 16.4416L14.8417 16.4416C15.725 16.4416 16.45 15.7166 16.45 14.8333L16.45 13.4166C16.45 13.0916 16.625 12.6166 16.8417 12.3666L17.975 11.05C18.4583 10.475 18.4583 9.52497 17.9667 8.94997ZM13.4667 8.42497L9.44167 12.45C9.325 12.5666 9.16667 12.6333 9 12.6333C8.83334 12.6333 8.67501 12.5666 8.55834 12.45L6.54167 10.4333C6.3 10.1916 6.3 9.79163 6.54167 9.54997C6.78334 9.3083 7.18334 9.3083 7.425 9.54997L9 11.125L12.5833 7.54163C12.825 7.29997 13.225 7.29997 13.4667 7.54163C13.7083 7.7833 13.7083 8.1833 13.4667 8.42497Z" fill="#52B922"/>
        </Svg>

      </View>
    </Animated.View>


    </View>


      <View style={{
        display : 'flex',
        padding: 16,
        top : "-16%",
        gap : 16
      }}>
        
        <View style={{
        display : 'flex',
        gap : 8
      }}>
        <Text style={styles.label}> Your GasApp Account Has Been Created Successfully</Text>
        <Text style={styles.subtitle}>
          Use this ID to track your orders
        </Text>
        </View>

        <View style={{ display : 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 16,
            backgroundColor: '#Fafafa',
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: 'rgba(0, 0, 0, 0.10)',
            width: '35%',
            alignSelf: 'center',
            gap : 12,
            paddingHorizontal: 1,
            paddingVertical: 4,
            flexDirection: 'row',
         }}>
          <Text style={{
            
            textAlign: 'center',
            fontSize: 20,
            fontWeight: '700',
            color: '#52B922',
          }}>
            GA - 007
          </Text>
          <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <Path d="M10.6666 8.60004V11.4C10.6666 13.7334 9.73331 14.6667 7.39998 14.6667H4.59998C2.26665 14.6667 1.33331 13.7334 1.33331 11.4V8.60004C1.33331 6.26671 2.26665 5.33337 4.59998 5.33337H7.39998C9.73331 5.33337 10.6666 6.26671 10.6666 8.60004Z" fill="#00000060" />
            <Path d="M11.4 1.33337H8.60003C6.67933 1.33337 5.7117 1.97031 5.42926 3.49264C5.32767 4.04021 5.79502 4.50004 6.35193 4.50004H7.40003C10.2 4.50004 11.5 5.80004 11.5 8.60004V9.64814C11.5 10.205 11.9599 10.6724 12.5074 10.5708C14.0298 10.2884 14.6667 9.32074 14.6667 7.40004V4.60004C14.6667 2.26671 13.7334 1.33337 11.4 1.33337Z" fill="#00000060"/>
          </Svg>
        </View>
        
        <PrimaryButton title="Start Ordering" onPress={() => navigation.navigate('Home')} />
      </View>


     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 8,
    backgroundColor: 'white',
    display : 'flex',
    // justifyContent: 'center',
    position : 'absolute',
    height : '100%',
  },
  label: {
    fontSize: 26,
    fontWeight: '700',
    textAlign : 'center'
  },
  subtitle: {
    // marginBottom: 24,
    color: 'rgba(0, 0, 0, 0.60)',
    textAlign : 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap : '80%'

  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    borderWidth: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
    width: 50,
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

export default OrderIDPage;
