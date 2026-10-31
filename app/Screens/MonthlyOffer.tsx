import React, { useState } from 'react';
import { Image, StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import BackButton from '@/components/BackButton';
import SecondaryButton from '@/components/SecondaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

type Offer = { month: string; price: number };

export default function MonthlyOffer() {
  const navigation = useNavigation();
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [offerDetails, setOfferDetails] = useState<Offer[]>([])

  const offers: Offer[] = [
    { month: 'January', price: 70 },
    { month: 'February', price: 70 },
    { month: 'March', price: 70 },
    { month: 'April', price: 70 },
  ]

  const toggleMonth = (month: string, price: number) => {
    if (selectedMonths.includes(month)){
      setSelectedMonths(selectedMonths.filter(selected => selected !== month))
      setOfferDetails(offerDetails.filter(offer => offer.month != month))
    } else {
      setSelectedMonths([...selectedMonths, month])
      setOfferDetails([...offerDetails, {month,price}])
    }
  }


  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <BackButton />
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Select LPG Cylinder Size</Text>
      </View>

      <View style={{
        gap : 12
      }}>
        <View style={{
          padding: 16,
          borderWidth : 1,
          borderRadius : 16,
          borderColor : 'rgba(0, 0, 0, 0.10)',
          gap : 20,
          backgroundColor : '#FAFAFA'
        }}>
            <View style={{
               flexDirection : 'row',
              justifyContent : 'space-between',
              alignItems : 'center'
            }}>
                  <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
                    <Path d="M16.75 4.06V2.5C16.75 2.09 16.41 1.75 16 1.75C15.59 1.75 15.25 2.09 15.25 2.5V4H8.75V2.5C8.75 2.09 8.41 1.75 8 1.75C7.59 1.75 7.25 2.09 7.25 2.5V4.06C4.55 4.31 3.24 5.92 3.04 8.31C3.02 8.6 3.26 8.84 3.54 8.84H20.46C20.75 8.84 20.99 8.59 20.96 8.31C20.76 5.92 19.45 4.31 16.75 4.06Z" fill="rgba(0, 0, 0, 0.60)" fill-opacity="0.5"/>
                    <Path d="M20 10.3398H4C3.45 10.3398 3 10.7898 3 11.3398V17.4998C3 20.4998 4.5 22.4998 8 22.4998H16C19.5 22.4998 21 20.4998 21 17.4998V11.3398C21 10.7898 20.55 10.3398 20 10.3398ZM9.21 18.7098C9.11 18.7998 9 18.8698 8.88 18.9198C8.76 18.9698 8.63 18.9998 8.5 18.9998C8.37 18.9998 8.24 18.9698 8.12 18.9198C8 18.8698 7.89 18.7998 7.79 18.7098C7.61 18.5198 7.5 18.2598 7.5 17.9998C7.5 17.7398 7.61 17.4798 7.79 17.2898C7.89 17.1998 8 17.1298 8.12 17.0798C8.36 16.9798 8.64 16.9798 8.88 17.0798C9 17.1298 9.11 17.1998 9.21 17.2898C9.39 17.4798 9.5 17.7398 9.5 17.9998C9.5 18.2598 9.39 18.5198 9.21 18.7098ZM9.42 14.8798C9.37 14.9998 9.3 15.1098 9.21 15.2098C9.11 15.2998 9 15.3698 8.88 15.4198C8.76 15.4698 8.63 15.4998 8.5 15.4998C8.37 15.4998 8.24 15.4698 8.12 15.4198C8 15.3698 7.89 15.2998 7.79 15.2098C7.7 15.1098 7.63 14.9998 7.58 14.8798C7.53 14.7598 7.5 14.6298 7.5 14.4998C7.5 14.3698 7.53 14.2398 7.58 14.1198C7.63 13.9998 7.7 13.8898 7.79 13.7898C7.89 13.6998 8 13.6298 8.12 13.5798C8.36 13.4798 8.64 13.4798 8.88 13.5798C9 13.6298 9.11 13.6998 9.21 13.7898C9.3 13.8898 9.37 13.9998 9.42 14.1198C9.47 14.2398 9.5 14.3698 9.5 14.4998C9.5 14.6298 9.47 14.7598 9.42 14.8798ZM12.71 15.2098C12.61 15.2998 12.5 15.3698 12.38 15.4198C12.26 15.4698 12.13 15.4998 12 15.4998C11.87 15.4998 11.74 15.4698 11.62 15.4198C11.5 15.3698 11.39 15.2998 11.29 15.2098C11.11 15.0198 11 14.7598 11 14.4998C11 14.2398 11.11 13.9798 11.29 13.7898C11.39 13.6998 11.5 13.6298 11.62 13.5798C11.86 13.4698 12.14 13.4698 12.38 13.5798C12.5 13.6298 12.61 13.6998 12.71 13.7898C12.89 13.9798 13 14.2398 13 14.4998C13 14.7598 12.89 15.0198 12.71 15.2098Z" fill="rgba(0, 0, 0, 0.60)" fill-opacity="0.5"/>
                  </Svg>

                <View style={{
                  flexDirection: 'row',
                  alignItems : 'center',
                  gap : 8
                }}>
                  <View style={{
                    gap: 4,
                    padding: 8,
                    borderWidth: 1,
                    borderRadius: 24,
                    borderColor: 'rgba(0, 0, 0, 0.10)',
                    backgroundColor: '#FAFAFA',
                    flexDirection : 'row'
                  }}>
                    <Text style={{
                      color : 'rgba(0, 0, 0, 0.50)'
                    }}>Average</Text>
                    <Text>GH200 / Sem</Text>
                  </View>

                  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z" fill="black"/>
              </Svg>
              </View>        
            </View>
                <View style={{
                  gap : 8
                }}>
                  <Text style={{
                      fontSize : 18,
                      fontWeight : '600'
                    }}>Full 4-Semester Subscription Plan</Text>

                      <Text style={{
                      fontSize : 14,
                      color : 'rgba(0,0,0,0.6)'
                    }}>Get reliable refills throughout the entire 4-semester period. With this plan, you'll receive between 4 to 6 refills each semester, ensuring you never run out of gas</Text>
              </View>      
        </View>

      </View>
      
      <View style={{
        gap : 12
      }}>
        <View style={[
          styles.wrapper,
          {
            borderColor: selectedMonths ? '#000' : 'rgba(0, 0, 0, 0.20)',
            backgroundColor: selectedMonths ? '#fff' : '#F4F4F4',
          },
        ]}>
            <View style={{
               flexDirection : 'row',
              justifyContent : 'space-between',
              alignItems : 'center'
            }}>
                 <Svg width="24" height="24" viewBox="0 0 24 25" fill="none">
                  <Path d="M8 2.5V5.5" stroke="black" stroke-opacity="0.6" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                  <Path d="M16 2.5V5.5" stroke="black" stroke-opacity="0.6" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                  <Path d="M3.5 9.58984H20.5" stroke="black" stroke-opacity="0.6" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                  <Path d="M18 23.5C20.2091 23.5 22 21.7091 22 19.5C22 17.2909 20.2091 15.5 18 15.5C15.7909 15.5 14 17.2909 14 19.5C14 21.7091 15.7909 23.5 18 23.5Z" stroke="black" stroke-opacity="0.6" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                  <Path d="M19.49 19.5498H16.51" stroke="black" stroke-opacity="0.6" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                  <Path d="M18 18.0898V21.0798" stroke="black" stroke-opacity="0.6" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                  <Path d="M21 9V16.86C20.27 16.03 19.2 15.5 18 15.5C15.79 15.5 14 17.29 14 19.5C14 20.25 14.21 20.96 14.58 21.56C14.79 21.92 15.06 22.24 15.37 22.5H8C4.5 22.5 3 20.5 3 17.5V9C3 6 4.5 4 8 4H16C19.5 4 21 6 21 9Z" stroke="black" stroke-opacity="0.6" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                  <Path d="M11.9955 14.2002H12.0045" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <Path d="M8.29431 14.2002H8.30329" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <Path d="M8.29431 17.2002H8.30329" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </Svg>

                <View style={{
                  flexDirection: 'row',
                  alignItems : 'center',
                  gap : 8
                }}>
                  <View style={[styles.container, selectedMonths.length ? styles.containerActive : undefined]}>
                    <Text style={{
                      color : 'rgba(0, 0, 0, 0.50)'
                    }}>Average</Text>
                    <Text>GH 70 / Sem</Text>
                  </View>

                    
                  <View style={{
                        width : 20,
                        height : 20,
                        borderRadius: 50,
                        borderWidth : 1,
                        borderColor : 'rgba(0,0,0,0.2)'
                      }}></View>
              </View>        
            </View>
                <View style={{
                  gap : 8
                }}>
                  <Text style={{
                      fontSize : 18,
                      fontWeight : '600'
                    }}>Custom Refill Plan</Text>

                      <Text style={{
                      fontSize : 14,
                      color : 'rgba(0,0,0,0.6)'
                    }}>Create a custom plan by selecting the exact number of months you want refills. Perfect if you prefer more flexibility with your gas usage</Text>
                </View>      
                  
                <View style={{
                  gap : 8
                }}>
                  
                  {offers.map((offer, index) => (
                      <TouchableOpacity
                          key={index}
                          style={[
                            styles.offerBox,
                            selectedMonths.includes(offer.month) ? styles.selectedOffer : styles.offerBox
                          ]}
                          onPress={() => toggleMonth(offer.month, offer.price)}
                      >
                        <View style={[ selectedMonths.includes(offer.month) ? styles.offerBox : styles.selectedOffer]}>
                        <Text>{offer.month}</Text>
                        

                        {
                          selectedMonths.includes(offer.month) ? <View style={{
                          width : 20,
                          height : 20,
                          borderRadius: 50,
                          borderWidth : 1,
                          borderColor : 'rgba(0,0,0,0.2)'
                        }}></View> :

                        
                        <Svg width="20" height="21" viewBox="0 0 20 21" fill="none">
                          <Path d="M9.99999 2.1665C5.40832 2.1665 1.66666 5.90817 1.66666 10.4998C1.66666 15.0915 5.40832 18.8332 9.99999 18.8332C14.5917 18.8332 18.3333 15.0915 18.3333 10.4998C18.3333 5.90817 14.5917 2.1665 9.99999 2.1665ZM13.9833 8.58317L9.25832 13.3082C9.14166 13.4248 8.98332 13.4915 8.81666 13.4915C8.64999 13.4915 8.49166 13.4248 8.37499 13.3082L6.01666 10.9498C5.77499 10.7082 5.77499 10.3082 6.01666 10.0665C6.25832 9.82484 6.65832 9.82484 6.89999 10.0665L8.81666 11.9832L13.1 7.69984C13.3417 7.45817 13.7417 7.45817 13.9833 7.69984C14.225 7.9415 14.225 8.33317 13.9833 8.58317Z" fill="#000"/>
                        </Svg>}

                        </View>
                       
                      
                      </TouchableOpacity>
                  ))}

                  {/*<View style={{
                    alignItems: 'center',
                    justifyContent : 'space-between',
                    borderRadius : 12,
                    flexDirection : 'row',
                    padding : 12,
                    borderColor : 'rgba(0,0,0,0.2)',
                    borderWidth : 1,
                    backgroundColor : 'white',
        
                  }}>
                      <Text style={{
                        fontSize : 14,
                        color : 'rgba(0,0,0,0.6)'
                      }}>1st Month</Text>

                      <View style={{
                        width : 20,
                        height : 20,
                        borderRadius: 50,
                        borderWidth : 1,
                        borderColor : 'rgba(0,0,0,0.2)'
                      }}></View>
                  </View>
                  <View style={{
                    alignItems: 'center',
                    justifyContent : 'space-between',
                    borderRadius : 12,
                    flexDirection : 'row',
                    padding : 12,
                    borderColor : 'rgba(0,0,0,0.2)',
                    borderWidth : 1,
                    backgroundColor : 'white',
        
                  }}>
                      <Text style={{
                        fontSize : 14,
                        color : 'rgba(0,0,0,0.6)'
                      }}>1st Month</Text>

                      <View style={{
                        width : 20,
                        height : 20,
                        borderRadius: 50,
                        borderWidth : 1,
                        borderColor : 'rgba(0,0,0,0.2)'
                      }}></View>
                  </View>
                  <View style={{
                    alignItems: 'center',
                    justifyContent : 'space-between',
                    borderRadius : 12,
                    flexDirection : 'row',
                    padding : 12,
                    borderColor : 'rgba(0,0,0,0.2)',
                    borderWidth : 1,
                    backgroundColor : 'white',
        
                  }}>
                      <Text style={{
                        fontSize : 14,
                        color : 'rgba(0,0,0,0.6)'
                      }}>3rd Month</Text>

                      <View style={{
                        width : 20,
                        height : 20,
                        borderRadius: 50,
                        borderWidth : 1,
                        borderColor : 'rgba(0,0,0,0.2)'
                      }}></View>
                  </View>
                  <View style={{
                    alignItems: 'center',
                    justifyContent : 'space-between',
                    borderRadius : 12,
                    flexDirection : 'row',
                    padding : 12,
                    borderColor : 'rgba(0,0,0,0.2)',
                    borderWidth : 1,
                    backgroundColor : 'white',
        
                  }}>
                      <Text style={{
                        fontSize : 14,
                        color : 'rgba(0,0,0,0.6)'
                      }}>4th Month</Text>

                      <View style={{
                        width : 20,
                        height : 20,
                        borderRadius: 50,
                        borderWidth : 1,
                        borderColor : 'rgba(0,0,0,0.2)'
                      }}></View>
                  </View>*/}
                </View> 

        </View>

      </View>
      
        <PrimaryButton
          title={'Continue'}
          onPress={() => navigation.navigate('Home')}
        />
     
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
  offerBox: {
    alignItems: 'center',
    justifyContent : 'space-between',
    borderRadius : 12,
    flexDirection : 'row',
    padding : 12,
    borderColor : 'rgba(0,0,0,0.2)',
    borderWidth : 1,
    backgroundColor : 'white',
  },
  selectedOffer: {
    alignItems: 'center',
    justifyContent : 'space-between',
    borderRadius : 12,
    flexDirection : 'row',
    padding : 12,
    borderColor : 'rgba(0,0,0,0.5)',
    borderWidth : 1,
    backgroundColor : '#f4f4f4',
  },
  container : {
    gap: 4,
    padding: 8,
    borderWidth: 1,
    borderRadius: 24,
    borderColor: 'rgba(0, 0, 0, 0.10)',
    backgroundColor: '#FAFAFA',
    flexDirection : 'row'
  },
  containerActive : {
    backgroundColor: '#000',
  },
  wrapper : {
    padding: 16,
    borderWidth : 1,
    borderRadius : 16,
    borderColor : 'rgba(0, 0, 0, 0.10)',
    gap : 20,
    
  }
  
});
