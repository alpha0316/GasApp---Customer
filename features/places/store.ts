import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

// The icon a customer picks for a place.
export type PlaceIcon = 'home' | 'work' | 'restaurant' | 'business' | 'school' | 'star';

export interface SavedPlace {
  id: string;
  label: string;
  icon: PlaceIcon;
  address: string;
  latitude: number;
  longitude: number;
  // Home and Work are fixed slots on the Saved places list (one of each).
  slot?: 'home' | 'work';
}

// The API has no saved-places endpoint yet, so places live on the device, per account.
// Each place has its own SecureStore entry (Android caps a value at ~2 KB), plus an index of ids.
// TODO: move to the API when it gains saved addresses, so places follow the customer across devices.
const indexKey = (userId: string) => `gasapp.places.${userId.replace(/[^\w.-]/g, '_')}`;
const placeKey = (userId: string, id: string) => `${indexKey(userId)}.${id}`;

async function readAll(userId: string): Promise<SavedPlace[]> {
  try {
    const ids: string[] = JSON.parse((await SecureStore.getItemAsync(indexKey(userId))) ?? '[]');
    const places = await Promise.all(
      ids.map(async (id) => {
        const raw = await SecureStore.getItemAsync(placeKey(userId, id));
        return raw ? (JSON.parse(raw) as SavedPlace) : null;
      }),
    );
    return places.filter((p): p is SavedPlace => p !== null);
  } catch (error) {
    console.warn('Could not read saved places', error);
    return [];
  }
}

interface PlacesState {
  userId: string | null;
  places: SavedPlace[];
  loaded: boolean;
  load: (userId: string) => Promise<void>;
  save: (place: Omit<SavedPlace, 'id'> & { id?: string }) => Promise<SavedPlace>;
  remove: (id: string) => Promise<void>;
}

export const usePlacesStore = create<PlacesState>((set, get) => {
  const writeIndex = (userId: string, places: SavedPlace[]) =>
    SecureStore.setItemAsync(indexKey(userId), JSON.stringify(places.map((p) => p.id)));

  return {
    userId: null,
    places: [],
    loaded: false,

    load: async (userId) => {
      if (get().userId === userId && get().loaded) return;
      set({ userId, places: [], loaded: false });
      const places = await readAll(userId);
      // Ignore a stale read if the account changed meanwhile.
      if (get().userId === userId) set({ places, loaded: true });
    },

    save: async (input) => {
      const { userId, places } = get();
      if (!userId) throw new Error('Not signed in');
      // Saving into the Home or Work slot replaces whatever was there.
      const existing =
        places.find((p) => p.id === input.id) ?? (input.slot ? places.find((p) => p.slot === input.slot) : undefined);
      const place: SavedPlace = { ...input, id: existing?.id ?? `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` };
      const next = existing ? places.map((p) => (p.id === existing.id ? place : p)) : [...places, place];
      await SecureStore.setItemAsync(placeKey(userId, place.id), JSON.stringify(place));
      await writeIndex(userId, next);
      set({ places: next });
      return place;
    },

    remove: async (id) => {
      const { userId, places } = get();
      if (!userId) return;
      const next = places.filter((p) => p.id !== id);
      await SecureStore.deleteItemAsync(placeKey(userId, id));
      await writeIndex(userId, next);
      set({ places: next });
    },
  };
});

// Home first, then Work, then the rest in the order they were added.
export function orderedPlaces(places: SavedPlace[]) {
  return {
    home: places.find((p) => p.slot === 'home') ?? null,
    work: places.find((p) => p.slot === 'work') ?? null,
    others: places.filter((p) => !p.slot),
  };
}
