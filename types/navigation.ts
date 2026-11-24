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
  RateDelivery: { orderId: string };
  Notification: undefined;
  NotificationSettings: undefined;
  // Help & Support. fromProfile: opened from Profile, so it shows a back button instead of the menu.
  ContactUs: { fromProfile?: boolean } | undefined;
  HelpTopic: { topicId: string; articleId?: string };
  ContactSupport: { subject?: string } | undefined;
  TermsPrivacy: undefined;
  SetPassword: undefined;
  PrivacySecurity: undefined;
  SavedPlaces: undefined;
  // Edit a saved place by id, fill the Home/Work slot, or (neither) add a new place.
  PlacePicker: { placeId?: string; slot?: 'home' | 'work' } | undefined;
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
