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
  ContactUs: undefined;
  SetPassword: undefined;
  Account: undefined;
  AddContact: { channel: 'email' | 'phone'; required?: boolean };
  FindingRider: { orderIds: string[] };
  Tracker: { orderId: string; orderIds?: string[] };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export {};
