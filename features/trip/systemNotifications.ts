import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'trip-updates';
const SOURCE = 'trip';

let ready: Promise<void> | null = null;

// Trip alerts posted by the app itself go to Notification Center while the app is open
// (the in-app pop-up already shows them, so no second banner) and show as normal banners
// in the background. Server pushes keep the old behaviour: not shown while the app is open.
function setup(): Promise<void> {
  ready ??= (async () => {
    Notifications.setNotificationHandler({
      handleNotification: async (n) => {
        const isTrip = n.request.content.data?.source === SOURCE;
        return { shouldShowBanner: false, shouldShowList: isTrip, shouldPlaySound: false, shouldSetBadge: false };
      },
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Delivery updates',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
  })();
  return ready;
}

// Posts a trip alert as a phone notification. Silently skipped without permission
// (the app asks for it at sign-in, with push registration).
export async function postTripNotification(orderId: string, title: string, body: string, sound = true): Promise<void> {
  if (Platform.OS === 'web') return;
  await setup();
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: { source: SOURCE, orderId }, sound },
    trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
  });
}

// Calls back with the order id when the customer taps a trip notification.
export function onTripNotificationTap(handler: (orderId: string) => void): () => void {
  void setup();
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.source === SOURCE && typeof data.orderId === 'string') handler(data.orderId);
  });
  return () => sub.remove();
}
