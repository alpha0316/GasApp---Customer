import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Briefcase, CaretRight, House, Plus, type Icon } from 'phosphor-react-native';
import { FormNote, FormScreen } from '@/components/form/Form';
import { useAuthStore } from '@/features/auth/authStore';
import { orderedPlaces, usePlacesStore } from '@/features/places/store';
import { placeIcon } from '@/features/places/icons';

function PlaceRow({ icon: Glyph, title, subtitle, onPress, last }: { icon: Icon; title: string; subtitle?: string; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.row, last && styles.rowLast]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      activeOpacity={0.6}
    >
      <View style={styles.rowIcon}>
        <Glyph size={24} color="#4A4A4A" />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      <CaretRight size={18} color="rgba(0,0,0,0.4)" />
    </TouchableOpacity>
  );
}

// Home and Work slots, then the customer's own places, then "Add a place".
export default function SavedPlaces() {
  const navigation = useNavigation();
  const userId = useAuthStore((s) => s.user?.id);
  const { places, loaded, load } = usePlacesStore();

  useEffect(() => {
    if (userId) void load(userId);
  }, [userId, load]);

  const { home, work, others } = orderedPlaces(places);

  return (
    <FormScreen title="Saved places">
      {!loaded ? (
        <ActivityIndicator style={styles.loading} accessibilityLabel="Loading saved places" />
      ) : (
        <View style={styles.list}>
          <PlaceRow
            icon={House}
            title={home ? 'Home' : 'Add home address'}
            subtitle={home?.address}
            onPress={() => navigation.navigate('PlacePicker', home ? { placeId: home.id } : { slot: 'home' })}
          />
          <PlaceRow
            icon={Briefcase}
            title={work ? 'Work' : 'Add work address'}
            subtitle={work?.address}
            onPress={() => navigation.navigate('PlacePicker', work ? { placeId: work.id } : { slot: 'work' })}
          />
          {others.map((p) => (
            <PlaceRow
              key={p.id}
              icon={placeIcon(p.icon)}
              title={p.label}
              subtitle={p.address}
              onPress={() => navigation.navigate('PlacePicker', { placeId: p.id })}
            />
          ))}
          <PlaceRow icon={Plus} title="Add a place" onPress={() => navigation.navigate('PlacePicker', {})} last />
        </View>
      )}
      <FormNote>Saved places show up when you choose a delivery location. They are kept on this phone.</FormNote>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 40 },
  list: { paddingHorizontal: 16, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 72,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 28, alignItems: 'center' },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 17, color: '#1A1A1A' },
  rowSubtitle: { fontSize: 14, color: 'rgba(0,0,0,0.55)' },
});
