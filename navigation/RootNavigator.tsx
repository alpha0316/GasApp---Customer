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
import NotificationSettings from '@/features/notifications/screens/NotificationSettings';
import ContactUs from '@/features/account/screens/ContactUs';
import SetPassword from '@/features/account/screens/SetPassword';
import Account from '@/features/account/screens/Account';
import AddContact from '@/features/account/screens/AddContact';
import PersonalInfo from '@/features/account/screens/PersonalInfo';
import { selectNeedsName, useAuthStore } from '@/features/auth/authStore';
import { useRealtime } from '@/features/notifications/useRealtime';
import TripAlertHost from '@/features/trip/TripAlertHost';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const noHeader = { headerShown: false } as const;

// The session decides which screens exist, so signing out (or an expired token)
// returns to the splash without any manual navigation.
export default function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const splashDone = useAuthStore((s) => s.splashDone);
  const needsName = useAuthStore(selectNeedsName);
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

  // Sign-up gate: a name is required before the app is usable; email is collected
  // on the same screen but optional, so it never blocks sign-up.
  if (needsName) {
    return (
      <Stack.Navigator initialRouteName="CompleteProfile">
        <Stack.Screen name="CompleteProfile" component={CompleteProfile} options={noHeader} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="Home"
      // Trip alerts float above every signed-in screen and open the tracker on tap.
      layout={({ children, navigation }) => (
        <>
          {children}
          <TripAlertHost onOpenOrder={(orderId) => navigation.navigate('Tracker', { orderId })} />
        </>
      )}
    >
      <Stack.Screen name="Home" component={Home} options={noHeader} />
      <Stack.Screen name="Orders" component={Orders} options={noHeader} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} options={noHeader} />
      <Stack.Screen name="Notification" component={Notification} options={noHeader} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={noHeader} />
      <Stack.Screen name="ContactUs" component={ContactUs} options={noHeader} />
      <Stack.Screen name="SetPassword" component={SetPassword} options={noHeader} />
      <Stack.Screen name="Account" component={Account} options={noHeader} />
      <Stack.Screen name="AddContact" component={AddContact} options={noHeader} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} options={noHeader} />
      <Stack.Screen name="FindingRider" component={FindingRider} options={noHeader} />
      <Stack.Screen name="Tracker" component={Tracker} options={noHeader} />
    </Stack.Navigator>
  );
}
