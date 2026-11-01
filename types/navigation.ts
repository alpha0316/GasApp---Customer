// Registers every screen + its params with React Navigation's global type,
// so `useNavigation().navigate(...)` is properly typed everywhere instead
// of falling back to `never` (the default when no RootParamList is
// declared). Several screens pass loosely-shaped param bags today, so
// those are typed `any` here rather than invented strict shapes that don't
// match what's actually sent.
export type RootStackParamList = {
  SplashScreen: undefined;
  PhoneNumber: undefined;
  EmailSignIn: undefined;
  OTPVerification: { channel: 'phone' | 'email'; target: string } | undefined;
  CompleteProfile: any;
  OrderIDPage: undefined;
  SelectHostel: { schoolId?: string } | undefined;
  SelectSchool: undefined;
  Home: undefined;
  Orders: undefined;
  Notification: undefined;
  SelectCylinder: any;
  SelectLocation: any;
  Amount: any;
  FindingRider: any;
  Tracker: any;
  MonthlyOffer: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export {};
