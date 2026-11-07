import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CheckCircle, GasPump } from 'phosphor-react-native';
import GlassCard from '@/components/GlassCard';
import { styles } from '@/features/orders/screens/homeStyles';
import type { NearbyStation } from './useNearbyStations';

interface Props {
  stations: NearbyStation[];
  selectedStation: string | null;
  onSelect: (key: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function StationsStep({ stations, selectedStation, onSelect, onBack, onContinue }: Props) {
  return (
    <>
      <GlassCard style={[styles.card, styles.stationCard]}>
        <View style={styles.stationHeaderRow}>
          <TouchableOpacity style={[styles.backButton, styles.backButtonAbsolute]} onPress={onBack}>
            <ArrowLeft size={18} color="#000" />
          </TouchableOpacity>
          <Text style={styles.stationHeaderTitle}>Available Filling Stations</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {stations.map((s, index) => {
            const isSelected = selectedStation === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.stationRow, isSelected && styles.stationRowSelected]}
                onPress={() => onSelect(s.key)}
              >
                {s.logo ? (
                  <Image source={s.logo} style={styles.stationLogoImage} resizeMode="contain" />
                ) : (
                  <View style={[styles.stationLogo, { backgroundColor: s.color }]}>
                    <GasPump size={18} color="#fff" weight="fill" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.stationName}>{s.name}</Text>
                  <View style={styles.stationMetaRow}>
                    <Text style={styles.stationDistance}>{s.distanceKm.toFixed(1)} km away</Text>
                    {index === 0 && (
                      <View style={styles.closestBadge}>
                        <CheckCircle size={12} color="#52B922" weight="fill" />
                        <Text style={styles.closestBadgeText}>Closest</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </GlassCard>

      <TouchableOpacity
        style={[styles.placeOrderButton, !selectedStation && styles.placeOrderButtonDisabled]}
        disabled={!selectedStation}
        onPress={onContinue}
      >
        <Text style={styles.placeOrderText}>Continue</Text>
      </TouchableOpacity>
    </>
  );
}
