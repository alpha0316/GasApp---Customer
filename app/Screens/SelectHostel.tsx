import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HostelContext } from './HostelContext';

const hostels = [
  

  { id: '10', schoolId: '2', name: 'Anodams Hostel', schoolName: 'UPSA' },
  { id: '15', schoolId: '2', name: 'Bendavid Hostel', schoolName: 'UPSA' },
  { id: '9', schoolId: '2', name: 'Campus Annex Student Hostel', schoolName: 'UPSA' },
  { id: '20', schoolId: '2', name: 'Chief’s Palace Hostel', schoolName: 'UPSA' },
  { id: '12', schoolId: '2', name: 'Chika Hostel', schoolName: 'UPSA' },
  { id: '26', schoolId: '2', name: 'Goodwill hostel', schoolName: 'UPSA' },
  { id: '16', schoolId: '2', name: 'Green Hostel', schoolName: 'UPSA' },
  { id: '8', schoolId: '2', name: 'Heavens Gate Hostel', schoolName: 'UPSA' },
  { id: '22', schoolId: '2', name: 'Henrich Hostel', schoolName: 'UPSA' },
  { id: '7', schoolId: '2', name: 'Joy Hostel', schoolName: 'UPSA' },
  { id: '2', schoolId: '2', name: 'Kitatsu Hostel', schoolName: 'UPSA' },
  { id: '19', schoolId: '2', name: 'Lillypot Hostel', schoolName: 'UPSA' },
  { id: '5', schoolId: '2', name: 'MB3 Hostel', schoolName: 'UPSA' },
  { id: '4', schoolId: '2', name: 'Makasella Hostel', schoolName: 'UPSA' },
  { id: '6', schoolId: '2', name: 'Makasella Hostel', schoolName: 'UPSA' },
  { id: '11', schoolId: '2', name: 'New Century Hostel', schoolName: 'UPSA' },
  { id: '13', schoolId: '2', name: 'Oasis Hostel', schoolName: 'UPSA' },
  { id: '18', schoolId: '2', name: 'Paulino Hostel', schoolName: 'UPSA' },
  { id: '17', schoolId: '2', name: 'Precious Hostel', schoolName: 'UPSA' },
  { id: '3', schoolId: '2', name: 'Prestige Hostel', schoolName: 'UPSA' },
  { id: '14', schoolId: '2', name: 'Student Hostel', schoolName: 'UPSA' },
  { id: '21', schoolId: '2', name: 'Joe Hostel', schoolName: 'UPSA' },
  { id: '23', schoolId: '2', name: 'West End Hostel', schoolName: 'UPSA' },

  { id: '1', schoolId : '1',name: 'PUC - 1 ', schoolName : 'PUC'},
  { id: '24', schoolId : '1',name: 'PUC - 2 ', schoolName : 'PUC'},
  { id: '25', schoolId : '1',name: 'PUC - 2 ', schoolName : 'PUC'},
];

export default function SelectHostel() {
  const navigation = useNavigation();
  const { setSelectedHostel } = useContext(HostelContext); 
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [searchTerm, setSearchTerm] = useState('')

  const route = useRoute()
  const { schoolId } = route.params as { schoolId: string };

  const filteredHostels = hostels.filter(
    (hostel) =>
      hostel.schoolId === schoolId &&
      hostel.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
  )

  const handleSelectHostel = (hostelId: string) => {
    const hostel = hostels.find(h => h.id === hostelId);
    if (!hostel) return;
    setSelectedHostel(hostel);
    setSelectedHostelId(hostelId);
  };

  
  const handleContinue = () => {
    navigation.navigate('Home');
  };

  
  const isButtonDisabled = !selectedHostelId;

  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Select Hostel</Text>
      </View>
      
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Search Hostel</Text>
        <TextInput
          style={[styles.input,
            {
              borderColor: searchTerm ? '#000' : 'rgba(0, 0, 0, 0.20)',
              backgroundColor: searchTerm ? '#fff' : '#F4F4F4',
            }
          ]}
          placeholder="Enter Name Of Hostel"
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="done"
          placeholderTextColor={'rgba(0,0,0,.5)'}
        />
      </View>

      <ScrollView style={styles.scrollContainer} bounces={false}>
      <View style={styles.hostelWrapper}>
        {filteredHostels.map((hostel) => (
          <TouchableOpacity
            key={hostel.id}
            style={[
              styles.hostelContainer,
              selectedHostelId === hostel.id && styles.selectedHostelContainer,
            ]}
            onPress={() => handleSelectHostel(hostel.id)}
          >
            <Text style={[styles.hostelName,  selectedHostelId === hostel.id && styles.selectedHostelName]}>
              {hostel.name}
            </Text>
            {selectedHostelId === hostel.id && (
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={styles.selectedIcon}>
                <Path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z" fill="black"/>
              </Svg>
            )}
          </TouchableOpacity>
        ))}
      </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton title="Continue" onPress={() => navigation.navigate('Home')} disabled={isButtonDisabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    gap : '80%'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 16,
  },
  hostelWrapper: {
    marginTop: 16,
  },
  hostelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'rgba(0, 0, 0, 0.10)',
    marginBottom: 8,
  },
  selectedHostelContainer: {
    borderColor: '#000', 
  },
  selectedHostelName: {
    color: '#000', 
  },
  selectedIcon: {
    width: 24,
    height: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    paddingTop : 12
  },
  hostelName: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.60)',
  },
  scrollContainer: {
    maxHeight: '100%',
    marginBottom : 88
  },
  inputWrapper: {
    marginVertical: 8,
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
