import { Platform } from 'react-native';

// Public values only. EXPO_PUBLIC_* is bundled into the app, so it must never hold a secret.
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!rawApiUrl) {
  throw new Error('EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and set it.');
}

export const API_URL = rawApiUrl.replace(/\/+$/, '');

// The Socket.IO server lives on the API host, not under /api/v1.
export const SOCKET_URL = API_URL.replace(/\/api\/v1$/, '');

// Google client IDs are public identifiers, not secrets.
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// TEMP: the iOS build this app runs in (Expo Go / an unrebuilt dev client) doesn't have
// RNGoogleSignin linked, which crashes the app the moment this native module loads.
// Google sign-in stays on for Android (where the APK build has it linked) and off for iOS
// until the iOS dev client is rebuilt with the module included — then drop this flag.
export const GOOGLE_SIGNIN_ENABLED = Platform.OS === 'android';
