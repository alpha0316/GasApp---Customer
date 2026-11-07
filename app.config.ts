import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json holds the static config. The Google Maps key is a build-time value,
// not an EXPO_PUBLIC one: set GOOGLE_MAPS_ANDROID_API_KEY in .env or as an EAS secret.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  android: {
    ...config.android,
    config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY } },
  },
});
