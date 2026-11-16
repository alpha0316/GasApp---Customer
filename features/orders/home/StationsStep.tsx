import React from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CheckCircle, GasPump } from 'phosphor-react-native';
import GlassCard from '@/components/GlassCard';
import { styles } from '@/features/orders/screens/homeStyles';
import { displayMoney } from '@/lib/money';
import { formatDriveDuration } from './constants';
import type { NearbyStation } from './useNearbyStations';

interface Props {
  stations: NearbyStation[];
  selectedStation: string | null;
  isLoading: boolean;
  isError: boolean;
  onSelect: (key: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onRetry?: () => void;
}

export default function StationsStep({ stations, selectedStation, isLoading, isError, onSelect, onBack, onContinue, onRetry }: Props) {
  return (
    <>
      <GlassCard style={[styles.card, styles.stationCard]}>
        <View style={styles.stationHeaderRow}>
          <TouchableOpacity style={styles.stationBackButton} onPress={onBack}>
            <ArrowLeft size={14} weight="bold" color="#000" />
          </TouchableOpacity>
          <Text style={styles.stationHeaderTitle}>Available Filling Stations</Text>
        </View>

        {isLoading && stations.length === 0 ? (
          <View style={styles.stationStatusBox}>
            <ActivityIndicator color="#007AFF" />
            <Text style={styles.stationStatusText}>Searching nearby filling stations…</Text>
          </View>
        ) : isError && stations.length === 0 ? (
          <View style={styles.stationStatusBox}>
            <Text style={styles.stationStatusText}>
              Couldn&apos;t reach the map service. Check your connection and try again.
            </Text>
            {onRetry && (
              <TouchableOpacity style={styles.stationRetryButton} onPress={onRetry}>
                <Text style={styles.stationRetryText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : stations.length === 0 ? (
          <View style={styles.stationStatusBox}>
            <Text style={styles.stationStatusText}>No filling stations found nearby.</Text>
          </View>
        ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {stations.map((s, index) => {
            const isSelected = selectedStation === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.stationRow, isSelected && styles.stationRowSelected]}
                onPress={() => onSelect(s.key)}
              >
                <View style={styles.stationLogoBadge}>
                  {s.logo ? (
                    <Image source={s.logo} style={styles.stationLogoImage} resizeMode="contain" />
                  ) : (
                    <GasPump size={20} color={s.color} weight="fill" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stationName}>{s.name}</Text>
                  <View style={styles.stationMetaRow}>
                    <Text style={styles.stationDistance}>{formatDriveDuration(s.durationMinutes)}</Text>
                    {index === 0 && (
                      <View style={styles.closestBadge}>
                        <CheckCircle size={12} color="#34C759" weight="fill" />
                        <Text style={styles.closestBadgeText}>Closest</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.stationFee}>{displayMoney(s.estimatedFee * 100, 'GHS')}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        )}
      </GlassCard>

      <TouchableOpacity
        style={[styles.placeOrderButton, !selectedStation && styles.placeOrderButtonDisabled]}
        disabled={!selectedStation}
        onPress={onContinue}
      >
        {isLoading && stations.length === 0 ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.placeOrderText}>Continue</Text>
        )}
      </TouchableOpacity>
    </>
  );
}
