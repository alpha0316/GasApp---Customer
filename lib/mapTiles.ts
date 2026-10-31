// CARTO's "Positron" basemap — clean, low-clutter and mostly grayscale so
// route lines, pins and card UI stand out, matching the web app's map.
// Shared by any screen that renders a MapView (Home, Tracker, ...).
const MAP_TILE_KEY = process.env.EXPO_PUBLIC_MAP_TILE_KEY;

export const MAP_TILE_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png${
  MAP_TILE_KEY ? `?key=${MAP_TILE_KEY}` : ''
}`;
