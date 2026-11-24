import React, { useState } from 'react';
import { Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { CaretRight, MapPin, NavigationArrow, X, type Icon } from 'phosphor-react-native';
import { styles } from '@/features/orders/screens/homeStyles';
import { LOCATION_PIN_ICON_XML } from '@/features/orders/icons';

export interface PresetLocation {
  key: string;
  name: string;
  // A saved place's address, shown under its name and used as the delivery address.
  detail?: string;
  icon?: Icon;
  latitude: number;
  longitude: number;
}

interface Props {
  currentLocation: string;
  presets: PresetLocation[];
  onClose: () => void;
  onUseCurrent: () => void;
  onSelectPreset: (location: PresetLocation) => void;
}

export default function LocationSearch({ currentLocation, presets, onClose, onUseCurrent, onSelectPreset }: Props) {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const trimmed = query.trim();
  const q = trimmed.toLowerCase();
  const filtered = presets.filter((loc) => loc.name.toLowerCase().includes(q) || !!loc.detail?.toLowerCase().includes(q));

  return (
    <View style={[styles.locationSearchOverlay, { paddingTop: insets.top + 20 }]}>
      <View style={styles.locationSearchHeader}>
        <View style={styles.locationPin}>
          <SvgXml xml={LOCATION_PIN_ICON_XML} width={16} height={16} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.locationLabel}>Your Location</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={currentLocation}
            placeholderTextColor="rgba(0,0,0,0.5)"
            style={styles.locationSearchValue}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            autoFocus
          />
        </View>
        <TouchableOpacity onPress={onClose}>
          <X size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.locationSearchDivider} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.locationSearchContent}>
        <TouchableOpacity style={styles.locationListRow} onPress={onUseCurrent}>
          <NavigationArrow size={18} color="#007AFF" weight="fill" />
          <Text style={styles.currentLocationText}>Your Current Location</Text>
          <CaretRight size={16} color="#007AFF" />
        </TouchableOpacity>

        {filtered.map((loc) => {
          const Glyph = loc.icon ?? MapPin;
          return (
            <TouchableOpacity key={loc.key} style={styles.locationListRow} onPress={() => onSelectPreset(loc)}>
              <Glyph size={18} color="rgba(0,0,0,0.5)" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.locationListText, { flex: 0 }]} numberOfLines={1}>
                  {loc.name}
                </Text>
                {!!loc.detail && (
                  <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', marginTop: 1 }} numberOfLines={1}>
                    {loc.detail}
                  </Text>
                )}
              </View>
              <CaretRight size={16} color="rgba(0,0,0,0.3)" />
            </TouchableOpacity>
          );
        })}

        {trimmed.length > 0 && filtered.length === 0 && (
          <Text style={styles.noLocationMatches}>No saved locations match &quot;{trimmed}&quot;.</Text>
        )}
      </ScrollView>
    </View>
  );
}
