import React, { useState, useContext } from 'react';
import { Image, StyleSheet, View, Text, ScrollView, TextInput } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import SecondaryButton from '@/components/SecondaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { HostelContext } from './HostelContext';

export default function ConfirmLocation() {
  const [selectedSmall, setSelectedSmall] = useState(false); // Track selected state for Small Size
  const [selectedMedium, setSelectedMedium] = useState(false); // Track selected state for Medium Size
  
  const { selectedHostel } = useContext(HostelContext);



  const navigation = useNavigation();
  const route = useRoute();
  const { offerName, offerPrice, totalCost, price } = route.params as {
    offerName: string;
    offerPrice: number;
    totalCost: number;
    price: string;
  };

  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <BackButton />
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Confirm Location</Text>
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Select A New Hostel</Text>
        <TextInput
          style={styles.input}
          placeholder="Search Hostel"
        />
      </View>
      <View style={{
        gap : 12
      }}>
          <View>
            <Text style={{
              fontSize : 20,
              fontWeight : '600'
            }}>Selected Hostel</Text>
            <Text style={{
              fontSize : 14,
              color : 'rgba(0, 0, 0, 0.50)'
            }}>Confirm your hostel to continue</Text>
          </View>
          <View style ={{
            flexDirection : 'row',
            alignItems : 'center',
            justifyContent : 'space-between',
            padding : 12,
            borderRadius : 12,
            borderWidth : 1,
            borderColor : 'rgba(82, 185, 34, 0.50)',
            backgroundColor: '#FAFAFA'
          }}>
              <Text> {selectedHostel?.name}</Text>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z" fill="#52B922"/>
              </Svg>
          </View>
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
          <Text>n/a</Text>
        </View>
        <View style={{ width: 'auto', height: 1, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.10)' }}></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: 'rgba(0, 0, 0, 0.60)' }}>Total Cost</Text>
          <Text>GHC {totalCost}.00</Text>
        </View>
        <PrimaryButton title={'Continue'} 
            onPress={() => navigation.navigate('Amount', { offerName, offerPrice, totalCost, price })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    gap: 20,
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 66,
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
    borderColor : 'rgba(0, 0, 0, 0.50)'
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
  }
});
