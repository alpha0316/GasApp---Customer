import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import SplashScreen from '@/features/auth/screens/SplashScreen';
import PhoneNumber from '@/features/auth/screens/PhoneNumber';
import EmailSignIn from '@/features/auth/screens/EmailSignIn';
import PasswordSignIn from '@/features/auth/screens/PasswordSignIn';
import OTPVerification from '@/features/auth/screens/OTPVerification';
import CompleteProfile from '@/features/auth/screens/CompleteProfile';
import Home from '@/features/orders/screens/Home';
import Orders from '@/features/orders/screens/Orders';
import OrderDetails from '@/features/orders/screens/OrderDetails';
import FindingRider from '@/features/orders/screens/FindingRider';
import Tracker from '@/features/tracking/screens/Tracker';
import Notification from '@/features/notifications/screens/Notification';
import ContactUs from '@/features/account/screens/ContactUs';
import SetPassword from '@/features/account/screens/SetPassword';
import Account from '@/features/account/screens/Account';
import AddContact from '@/features/account/screens/AddContact';
import { selectNeedsEmail, selectNeedsName, useAuthStore } from '@/features/auth/authStore';
import { useRealtime } from '@/features/notifications/useRealtime';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const noHeader = { headerShown: false } as const;

// The session decides which screens exist, so signing out (or an expired token)
// returns to the splash without any manual navigation.
export default function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const splashDone = useAuthStore((s) => s.splashDone);
  const needsName = useAuthStore(selectNeedsName);
  const needsEmail = useAuthStore(selectNeedsEmail);
  useRealtime();

  if (status === 'loading' || (status === 'signedIn' && !splashDone)) {
    return (
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={noHeader} />
      </Stack.Navigator>
    );
  }

  if (status === 'signedOut') {
    return (
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={noHeader} />
        <Stack.Screen name="PhoneNumber" component={PhoneNumber} options={noHeader} />
        <Stack.Screen name="EmailSignIn" component={EmailSignIn} options={noHeader} />
        <Stack.Screen name="PasswordSignIn" component={PasswordSignIn} options={noHeader} />
        <Stack.Screen name="OTPVerification" component={OTPVerification} options={noHeader} />
      </Stack.Navigator>
    );
  }

  // Sign-up gate: a name first, then a verified email.
  if (needsName) {
    return (
      <Stack.Navigator initialRouteName="CompleteProfile">
        <Stack.Screen name="CompleteProfile" component={CompleteProfile} options={noHeader} />
      </Stack.Navigator>
    );
  }

  if (needsEmail) {
    return (
      <Stack.Navigator initialRouteName="AddContact">
        <Stack.Screen
          name="AddContact"
          component={AddContact}
          initialParams={{ channel: 'email', required: true }}
          options={noHeader}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} options={noHeader} />
      <Stack.Screen name="Orders" component={Orders} options={noHeader} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} options={noHeader} />
      <Stack.Screen name="Notification" component={Notification} options={noHeader} />
      <Stack.Screen name="ContactUs" component={ContactUs} options={noHeader} />
      <Stack.Screen name="SetPassword" component={SetPassword} options={noHeader} />
      <Stack.Screen name="Account" component={Account} options={noHeader} />
      <Stack.Screen name="AddContact" component={AddContact} options={noHeader} />
      <Stack.Screen name="FindingRider" component={FindingRider} options={noHeader} />
      <Stack.Screen name="Tracker" component={Tracker} options={noHeader} />
    </Stack.Navigator>
  );
}
