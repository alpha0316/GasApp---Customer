import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import Svg, { Path, Defs, Pattern, Use } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { HostelContext } from './HostelContext';

const schools = [
  { id: '1', 
    name: 'Pentecost University College (PUC)', 
    location : 'Sowutuom, Greater Accra Region',
    img :  require('./../../assets/images/PUC.jpg')
  },

  { id: '2', 
    name: 'The University of Professional Studies (UPSA)', 
    location : 'Madina, Greater Accra Region',
    img : require('./../../assets/images/UPSA.jpg')
  },

];

export default function SelectSchool() {
  const navigation = useNavigation();
  const { setSelectedHostel } = useContext(HostelContext); 
  const [selectedHostelId, setSelectedHostelId] = useState('');


  const handleSelectHostel = (schoolId: string) => {
    const school = schools.find(h => h.id === schoolId);
    if (!school) return;
    setSelectedHostel(school);
    setSelectedHostelId(schoolId);
  };


  const handleContinue = () => {
    navigation.navigate('SelectHostel', { schoolId : selectedHostelId});
  };

  
  const isButtonDisabled = !selectedHostelId;

  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Select School</Text>
          
      </View>
      <View style={styles.hostelWrapper}>
        {schools.map((school) => (
          <TouchableOpacity
            key={school.id}
            style={[
              styles.hostelContainer,
              selectedHostelId === school.id && styles.selectedHostelContainer,
            ]}
            onPress={() => handleSelectHostel(school.id)}
          >

            <View style={{
              flexDirection : 'row',
              gap :12
            }}>
                <Image source={school.img} style={{
                  width : 24,
                  height : 24             
                }}/>
                <View style={{
                      gap : 4
                }}>
                    <Text style={[styles.schoolName,  selectedHostelId === school.id && styles.selectedHostelName]}>
                      {school.name}
                    </Text>
                    <Text style={[styles.location,  selectedHostelId === school.id && styles.selectedHostelName]}>
                      {school.location}
                    </Text>
                </View>
            </View>

           
         
            {selectedHostelId === school.id && (
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={styles.selectedIcon}>
                <Path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z" fill="black"/>
              </Svg>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.footer}>
        <PrimaryButton title="Continue" onPress={handleContinue} disabled={isButtonDisabled} />
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
    gap : '70%'
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
    alignItems: 'flex-start',
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
  schoolName: {
    fontSize: 16,
    maxWidth : "90%"
  },
  location : {
    color : 'rgba(0,0,0,.6)'
  }
});
