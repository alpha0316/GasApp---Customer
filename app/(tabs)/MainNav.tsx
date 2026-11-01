import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import SplashScreen from '../Screens/SplashScreen';
import GeneralDetails from '../Screens/GeneralDetails';
import SelectHostel from '../Screens/SelectHostel';
import Home from '../Screens/Home';
import Orders from '../Screens/Orders';
import SelectCylinder from '../Screens/SelectCylinder';
import SelectLocation from '../Screens/SelectLocation';
import Amount from '../Screens/Amount';
import FindingRider from '../Screens/FindingRider';
import PhoneNumber from '../Screens/PhoneNumber';
import EmailSignIn from '../Screens/EmailSignIn';
import Tracker from '../Screens/Tracker';
import SelectSchool from '../Screens/SelectSchool';
import OTPVerification from '../Screens/OTPVerification';
import Notification from '../Screens/Notification'
import MonthlyOffer from '../Screens/MonthlyOffer';
import OrderIDPage from '../Screens/OrderIDPage';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainNav() {
  return (
    <Stack.Navigator initialRouteName="SplashScreen">
      <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PhoneNumber" component={PhoneNumber} options={{ headerShown: false }} />
      <Stack.Screen name="EmailSignIn" component={EmailSignIn} options={{ headerShown: false }} />
      <Stack.Screen name="OTPVerification" component={OTPVerification} options={{ headerShown: false }} />
      <Stack.Screen name="CompleteProfile" component={GeneralDetails} options={{ headerShown: false }} />
      <Stack.Screen name="OrderIDPage" component={OrderIDPage} options={{ headerShown: false }} />
      <Stack.Screen name="SelectHostel" component={SelectHostel} options={{ headerShown: false }} />
      <Stack.Screen name="SelectSchool" component={SelectSchool} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Orders" component={Orders} options={{ headerShown: false }} />
      <Stack.Screen name="Notification" component={Notification} options={{ headerShown: false }} />
      <Stack.Screen name="SelectCylinder" component={SelectCylinder} options={{ headerShown: false }} />
      <Stack.Screen name="SelectLocation" component={SelectLocation} options={{ headerShown: false }} />
      <Stack.Screen name="Amount" component={Amount} options={{ headerShown: false }} />
      <Stack.Screen name="FindingRider" component={FindingRider} options={{ headerShown: false }} />
      <Stack.Screen name="Tracker" component={Tracker} options={{ headerShown: false }} />
      <Stack.Screen name="MonthlyOffer" component={MonthlyOffer} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
