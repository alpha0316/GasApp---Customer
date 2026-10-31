import React, { useState } from 'react';
import { Image, StyleSheet, View, Text, ScrollView } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import SecondaryButton from '@/components/SecondaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function SelectCylinder() {
  const [selectedSmall, setSelectedSmall] = useState(false); 
  const [selectedMedium, setSelectedMedium] = useState(false); 
  const [price, setPrice] = useState('n/a');
  const [totalCost, setTotalCost] = useState(0);

  const handlePressSmall = () => {
    setSelectedSmall(!selectedSmall);
    setSelectedMedium(false);
    if (!selectedSmall) {
      setPrice('GHC 3.00');
      calculateTotalCost('GHC 3.00'); 
    } else {
      setPrice('n/a');
      setTotalCost(0); 
    }
  };

  const handlePressMedium = () => {
    setSelectedMedium(!selectedMedium);
    setSelectedSmall(false); 
    if (!selectedMedium) {
      setPrice('GHC 6.00');
      calculateTotalCost('GHC 6.00');
    } else {
      setPrice('n/a');
      setTotalCost(0); 
    }
  };

  const calculateTotalCost = (selectedPrice: string) => {
    let cylinderCost = parseFloat(selectedPrice.split(' ')[1]);
    let total = parseFloat(offerPrice) + cylinderCost;
    setTotalCost(total);
  };

  const navigation = useNavigation();
  const route = useRoute();
  const { offerName, offerPrice, offerId } = route.params as {
    offerName: string;
    offerPrice: string;
    offerId?: string;
  };

  const isButtonDisabled = !selectedMedium && !selectedSmall

  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <BackButton />
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Select LPG Cylinder Size</Text>
      </View>
      <ScrollView style={styles.scrollContainer} bounces={false}>
        <View style={styles.MainContainer}>
          <View style={[styles.cylinderContainer, selectedSmall ? styles.selectedBackground : null]}>
            <View style={styles.imgContainer}>
              <Image source={require('./../../assets/images/smallSize.png')} style={styles.image} />
            </View>
            <View style={styles.textContainer}>
              <Text>Small Size</Text>
              <Text style={styles.priceText}>GHC 3.00</Text>
            </View>
            <SecondaryButton title={'Select'} onPress={handlePressSmall} />
          </View>
        </View>
        <View style={styles.MainContainer}>
          <View style={[styles.cylinderContainer, selectedMedium ? styles.selectedBackground : null]}>
            <View style={styles.imgContainer}>
              <Image source={require('./../../assets/images/mediumSize.png')} style={styles.image} />
            </View>
            <View style={styles.textContainer}>
              <Text>Medium Size</Text>
              <Text style={styles.priceText}>GHC 6.00</Text>
            </View>
            <SecondaryButton title={'Select'} onPress={handlePressMedium} />
          </View>
        </View>
      </ScrollView>
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
          <Text>GHC {totalCost.toFixed(2)}</Text>
        </View>
        <PrimaryButton
          title={'Continue'}
          onPress={() => navigation.navigate('SelectLocation', { offerName, offerPrice, totalCost, price })}
          disabled={isButtonDisabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    gap: 24,
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 46,
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
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  selectedBackground: {
    backgroundColor: '#F6F6F6', // Replace with your desired color
    borderWidth: 1,
    borderColor : 'rgba(0, 0, 0, 0.50)'
  },
});
