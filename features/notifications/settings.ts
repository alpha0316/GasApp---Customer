import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

// The customer's notification choices. Kept on this device; the API has no endpoint for them.
export interface NotificationSettings {
  // In-app toasts for trip progress (rider on the way, filling, ...).
  tripToasts: boolean;
  // The full-screen "almost there" cards when the rider is close.
  arrivalCards: boolean;
  // Trip alerts posted to the phone's Notification Center.
  phoneAlerts: boolean;
  // Sound with phone alerts.
  sound: boolean;
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  tripToasts: true,
  arrivalCards: true,
  phoneAlerts: true,
  sound: true,
};

const KEY = 'notification-settings';

interface SettingsState extends NotificationSettings {
  loaded: boolean;
  load: () => Promise<void>;
  set: (patch: Partial<NotificationSettings>) => void;
}

const pick = (s: NotificationSettings): NotificationSettings => ({
  tripToasts: s.tripToasts,
  arrivalCards: s.arrivalCards,
  phoneAlerts: s.phoneAlerts,
  sound: s.sound,
});

export const useNotificationSettings = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      // Spread over the defaults so settings added later get their default value.
      set({ ...DEFAULT_SETTINGS, ...(raw ? (JSON.parse(raw) as Partial<NotificationSettings>) : {}), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  set: (patch) => {
    set(patch);
    SecureStore.setItemAsync(KEY, JSON.stringify(pick({ ...get(), ...patch }))).catch((e: unknown) =>
      console.warn('Could not save notification settings', e),
    );
  },
}));

// For non-React code (the trip watcher) that reads the current choice at the moment it acts.
export const notificationSettings = (): NotificationSettings => pick(useNotificationSettings.getState());
