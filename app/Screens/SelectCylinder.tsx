import React, { useState } from 'react';
import { Image, StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import SecondaryButton from '@/components/SecondaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

const CYLINDER_OPTIONS = [
  {
    id: 'small',
    name: 'Small Size',
    price: 3.0,
    image: require('./../../assets/images/smallSize.png'),
  },
  {
    id: 'medium',
    name: 'Medium Size',
    price: 6.0,
    image: require('./../../assets/images/mediumSize.png'),
  },
];

export default function SelectCylinder() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleCylinder = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const removeCylinder = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const navigation = useNavigation();
  const route = useRoute();
  const { offerName, offerPrice, offerId } = route.params as {
    offerName: string;
    offerPrice: string;
    offerId?: string;
  };

  const selectedCylinders = CYLINDER_OPTIONS.filter((option) => selectedIds.includes(option.id));
  const cylinderCost = selectedCylinders.reduce((sum, option) => sum + option.price, 0);
  const totalCost = (parseFloat(offerPrice) || 0) + cylinderCost;
  const price = selectedCylinders.length
    ? selectedCylinders.map((option) => `GHC ${option.price.toFixed(2)}`).join(', ')
    : 'n/a';

  const isButtonDisabled = selectedIds.length === 0;

  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <BackButton />
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Select LPG Cylinder Size</Text>
      </View>
      <ScrollView style={styles.scrollContainer} bounces={false}>
        {CYLINDER_OPTIONS.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          return (
            <View style={styles.MainContainer} key={option.id}>
              <View style={[styles.cylinderContainer, isSelected ? styles.selectedBackground : null]}>
                <View style={styles.imgContainer}>
                  <Image source={option.image} style={styles.image} />
                </View>
                <View style={styles.textContainer}>
                  <Text>{option.name}</Text>
                  <Text style={styles.priceText}>GHC {option.price.toFixed(2)}</Text>
                </View>
                <SecondaryButton
                  title={isSelected ? 'Selected' : 'Select'}
                  onPress={() => toggleCylinder(option.id)}
                />
              </View>
            </View>
          );
        })}

        {selectedCylinders.length > 0 && (
          <View style={styles.selectedListContainer}>
            <Text style={styles.selectedListTitle}>Selected Cylinders</Text>
            {selectedCylinders.map((option) => (
              <View style={styles.selectedRow} key={option.id}>
                <Text>{option.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={styles.priceText}>GHC {option.price.toFixed(2)}</Text>
                  <TouchableOpacity
                    onPress={() => removeCylinder(option.id)}
                    accessibilityLabel={`Remove ${option.name}`}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
          onPress={() => navigation.navigate('SelectLocation', { offerName, offerPrice, totalCost, price, cylinderCost })}
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
  selectedListContainer: {
    gap: 8,
    marginBottom: 24,
  },
  selectedListTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.10)',
    borderRadius: 12,
    padding: 12,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.60)',
  },
});
