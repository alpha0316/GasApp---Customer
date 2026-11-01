import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View, Text, ScrollView, TextInput, Keyboard } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import SecondaryButton from '@/components/SecondaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import Slider from '@react-native-community/slider';

export default function Amount() {
  const [amount, setAmount] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [sliderValue, setSliderValue] = useState(0)
  const [selectedKg, setSelectedKg] = useState(2)
  const [pricePerKg, setPricePerKg] = useState(5)

  const navigation = useNavigation();
  const route = useRoute();
  const { offerName, offerPrice, price, cylinderCost } = route.params as {
    offerName: string;
    offerPrice: number;
    price: string;
    cylinderCost?: number;
  };


  {/*useEffect(() => {
    // Convert offerPrice, price, and amount to numbers and calculate total cost
    const numericOfferPrice = parseFloat(offerPrice);
    const numericPrice = parseFloat(price);
    const numericAmount = parseFloat(amount) || 0; // Default to 0 if amount is not a number

    // Calculate total cost
    const calculatedTotalCost = numericOfferPrice + numericPrice + numericAmount;
    setTotalCost(calculatedTotalCost);
  }, [amount, offerPrice, price]);*/}

  useEffect(() => {
    // Convert offerPrice, cylinderCost, and amount to numbers and calculate total cost
    const numericOfferPrice = Number(offerPrice) || 0;
    const numericCylinderCost = cylinderCost !== undefined ? Number(cylinderCost) || 0 : parseFloat(price) || 0;
    const numericAmount = parseFloat(amount) || 0; // Default to 0 if amount is not a number

    // Calculate total cost
    const calculatedTotalCost = numericOfferPrice + numericCylinderCost + numericAmount;
    setTotalCost(calculatedTotalCost);
  }, [amount, offerPrice, price, cylinderCost]);

  const handleSliderChange = (value: number) => {
    setSliderValue(value)

    const kg = 2 + Math.round(value * 22)
    setSelectedKg(kg)

    const calculatedPrice = kg * pricePerKg
    setAmount(calculatedPrice.toFixed(2))
  }


const MINIMUM_AMOUNT = 20;
const numericAmount = parseFloat(amount) || 0;
const isBelowMinimum = amount !== '' && numericAmount < MINIMUM_AMOUNT;
const isButtonDisabled = !amount || isBelowMinimum

  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <BackButton />
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Amount</Text>
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Enter Amount You Want To Buy</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          onSubmitEditing={Keyboard.dismiss}
          returnKeyType="done"
        />
        {isBelowMinimum && (
          <Text style={styles.errorText}>Minimum amount is GHC {MINIMUM_AMOUNT}.00</Text>
        )}
      </View>
    
      <View style={{
        flexDirection : 'row',
        gap : 8,
        alignItems : 'center',
        justifyContent : 'space-between'
      }}>
        <View style={{
          width : 170,
          height : 1,
          justifyContent : 'space-between',
          backgroundColor : 'rgba(0,0,0,0.2)'
        }}></View>

        <Text>OR</Text>

        <View style={{
          width : 170,
          height : 1,
          backgroundColor : 'rgba(0,0,0,0.2)'
        }}></View>
      </View>

        <View style={{
          gap : 8,
          borderRadius : 16,
          borderColor : 'rgba(0,0,0,0.1)',
          backgroundColor : '#FAFAFA',
          padding : 16,
          borderWidth : 1
        }}>

        <View style={{
          flexDirection : 'row',
          justifyContent : 'space-between',
          alignItems : 'center'
        }}>
            <Text style ={{
              fontSize : 18,
              fontWeight : '600'
            }}>Slider</Text>

            <View style={{
              gap : 8,
              flexDirection : 'row',
              alignItems : 'center'
            }}>
              <Text style={{
                color: 'rgba(0,0,0,0.5)',
                padding : 4,
                backgroundColor : '#fff',
                borderRadius : 8,
                borderWidth : 1,
                borderColor : 'rgba(0,0,0,0.1)',
              }}>{selectedKg}Kg</Text>

              <Text style ={{
              fontSize : 18,
              fontWeight : '600'
            }}>GHC {amount}</Text>
            </View>
        </View>

            <Slider
              style={{width: '100%', height: 40}}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor='rgba(0,0,0,0.1)'
              value={sliderValue}
              onValueChange={handleSliderChange}
              />

            <View style ={{
              flexDirection : 'row',
              alignItems : 'center',
              justifyContent : 'space-between'
            }}>
              <Text style={{
                color: 'rgba(0,0,0,0.5)'
              }}>Min < Text style={{
                color: 'black'
              }} >(2kg)</Text> </Text>

              <Text style={{
                color: 'rgba(0,0,0,0.5)'
              }}>Min < Text style={{
                color: 'black'
              }} >(24kg)</Text> </Text>
            </View>
            <Text style={{
                color: 'rgba(0,0,0,0.5)'
              }} >Use the slider below to select the amount you'd like to fill your gas cylinder</Text>

        </View>

           


      <View style={styles.footer}>
        <Text style={{ fontWeight: '700', fontSize: 18 }}>Cost Summary</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: 'rgba(0, 0, 0, 0.60)' }}>{offerName}</Text>
          <Text style={styles.price}>GHC {offerPrice}.00</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: 'rgba(0, 0, 0, 0.60)' }}>Cylinder Size</Text>
          <Text>{price}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: 'rgba(0, 0, 0, 0.60)' }}>Amount You Want To Buy</Text>
          <Text>{amount ? `GHC ${amount}` : 'n/a'}</Text>
        </View>
        <View style={{ width: 'auto', height: 1, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.10)' }}></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: 'rgba(0, 0, 0, 0.60)' }}>Total Cost</Text>
          <Text>GHC {totalCost}.00</Text>
        </View>
        <PrimaryButton title={'Continue'} 
        onPress={() => navigation.navigate('FindingRider', { offerName, offerPrice, totalCost, price, amount })}
        disabled={isButtonDisabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    gap: 16,
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: "100%",
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    paddingBottom: 8,
    alignSelf: 'stretch',
  },
  scrollContainer: {
    maxHeight: '55%',
    overflow: 'hidden',
  },
  MainContainer: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    gap: 12,
    marginBottom: 12,
  },
  cylinderContainer: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.10)',
    padding: 12,
    gap: 8,
    overflow: 'hidden',
  },
  imgContainer: {
    alignSelf: 'stretch',
    height: 198,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 200,
  },
  footer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.10)',
    backgroundColor: '#F5F5F5',
    alignSelf: 'stretch',
    position: 'absolute',
    bottom: -40,
    width: '109%',
    gap: 16,
    paddingBottom: 44,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceText: {
    color: 'rgba(0, 0, 0, 0.60)',
  },
  price: {
    fontWeight: '700',
  },
  selectedBackground: {
    backgroundColor: '#F6F6F6', // Replace with your desired color
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.50)'
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.80)',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    borderWidth: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: 6,
  }
});
