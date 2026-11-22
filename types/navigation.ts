// Registers every screen + its params with React Navigation's global type,
// so `useNavigation().navigate(...)` is properly typed everywhere.
export type RootStackParamList = {
  SplashScreen: undefined;
  PhoneNumber: undefined;
  EmailSignIn: undefined;
  PasswordSignIn: undefined;
  OTPVerification: { channel: 'phone' | 'email'; target: string } | undefined;
  CompleteProfile: undefined;
  Home: undefined;
  Orders: undefined;
  OrderDetails: { orderId: string };
  Notification: undefined;
  NotificationSettings: undefined;
  ContactUs: undefined;
  SetPassword: undefined;
  Account: undefined;
  PersonalInfo: undefined;
  AddContact: { channel: 'email' | 'phone' };
  FindingRider: { orderIds: string[] };
  Tracker: { orderId: string; orderIds?: string[] };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export {};
