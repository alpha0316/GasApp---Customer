import { Briefcase, ForkKnife, GraduationCap, House, Star, Storefront, type Icon } from 'phosphor-react-native';
import type { PlaceIcon } from './store';

export const PLACE_ICONS: { key: PlaceIcon; label: string; Icon: Icon }[] = [
  { key: 'home', label: 'Home', Icon: House },
  { key: 'work', label: 'Work', Icon: Briefcase },
  { key: 'restaurant', label: 'Restaurant', Icon: ForkKnife },
  { key: 'business', label: 'Business', Icon: Storefront },
  { key: 'school', label: 'School', Icon: GraduationCap },
  { key: 'star', label: 'Other', Icon: Star },
];

export const placeIcon = (key: PlaceIcon): Icon => PLACE_ICONS.find((i) => i.key === key)?.Icon ?? Star;
