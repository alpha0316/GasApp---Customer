import React, { useState } from 'react';
import { Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { CaretRight, MapPin, NavigationArrow, X } from 'phosphor-react-native';
import { styles } from '@/features/orders/screens/homeStyles';
import { LOCATION_PIN_ICON_XML } from '@/features/orders/icons';

export interface PresetLocation {
  name: string;
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
  const trimmed = query.trim();
  const filtered = presets.filter((loc) => loc.name.toLowerCase().includes(trimmed.toLowerCase()));

  return (
    <View style={styles.locationSearchOverlay}>
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

        {filtered.map((loc) => (
          <TouchableOpacity key={loc.name} style={styles.locationListRow} onPress={() => onSelectPreset(loc)}>
            <MapPin size={18} color="rgba(0,0,0,0.4)" />
            <Text style={styles.locationListText}>{loc.name}</Text>
            <CaretRight size={16} color="rgba(0,0,0,0.3)" />
          </TouchableOpacity>
        ))}

        {trimmed.length > 0 && filtered.length === 0 && (
          <Text style={styles.noLocationMatches}>No saved locations match &quot;{trimmed}&quot;.</Text>
        )}
      </ScrollView>
    </View>
  );
}
