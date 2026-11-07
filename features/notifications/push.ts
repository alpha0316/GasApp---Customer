import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerPushTokenApi, removePushTokenApi } from './api';

let currentToken: string | null = null;

// Registers the Expo push token with the backend. Returns false when the user
// declined permission or the app has no EAS project id (for example Expo Go).
export async function registerPushToken(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const existing = await Notifications.getPermissionsAsync();
  const granted =
    existing.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return false;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return false;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  await registerPushTokenApi(data);
  currentToken = data;
  return true;
}

// Call before the JWT is deleted: the API needs auth to remove the token.
export async function unregisterPushToken(): Promise<void> {
  if (!currentToken) return;
  const token = currentToken;
  currentToken = null;
  await removePushTokenApi(token);
}
