import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { CaretRight, Minus, Plus } from 'phosphor-react-native';
import GlassCard from '@/components/GlassCard';
import { errorMessage } from '@/lib/api/client';
import { displayMoney } from '@/lib/money';
import { styles } from '@/features/orders/screens/homeStyles';
import { LOCATION_PIN_ICON_XML, SCHEDULE_CLOCK_ICON_XML } from '@/features/orders/icons';
import { CYLINDER_IMAGES } from './constants';
import SchedulePanel from './SchedulePanel';
import type { OrderDraft } from './useOrderDraft';
import type { usePickupSchedule } from './usePickupSchedule';

interface Props {
  draft: OrderDraft;
  schedule: ReturnType<typeof usePickupSchedule>;
  currentLocation: string;
  onOpenLocationSearch: () => void;
  onPlaceOrder: () => void;
}

export default function SelectStep({ draft, schedule, currentLocation, onOpenLocationSearch, onPlaceOrder }: Props) {
  const { cylindersQuery, cylinders, currency, quantities } = draft;

  return (
    <>
      <GlassCard style={styles.card}>
        {!schedule.scheduleView ? (
          <>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Your Hassle-Free Solution For</Text>
                <Text style={styles.cardSubtitle}>Convenient LPG Refill</Text>
              </View>
              <TouchableOpacity onPress={schedule.openSchedule} style={styles.clockButton}>
                <SvgXml xml={SCHEDULE_CLOCK_ICON_XML} width={18} height={18} />
                {schedule.pickupLabel !== 'Now' && <Text style={styles.clockButtonText}>{schedule.pickupLabel}</Text>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.locationRow} onPress={onOpenLocationSearch}>
              <View style={styles.locationPin}>
                <SvgXml xml={LOCATION_PIN_ICON_XML} width={16} height={16} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>Your Location</Text>
                <Text style={styles.locationValue} numberOfLines={1}>{currentLocation}</Text>
              </View>
              <CaretRight size={16} color="rgba(0,0,0,0.4)" />
            </TouchableOpacity>
          </>
        ) : (
          <SchedulePanel schedule={schedule} />
        )}
      </GlassCard>

      <GlassCard style={[styles.card, styles.cylinderCard]}>
        <Text style={styles.sectionTitle}>Cylinder Size</Text>

        {cylindersQuery.isPending && <ActivityIndicator accessibilityLabel="Loading cylinder sizes" />}
        {cylindersQuery.isError && (
          <TouchableOpacity onPress={() => cylindersQuery.refetch()} accessibilityRole="button">
            <Text style={styles.noLocationMatches}>{errorMessage(cylindersQuery.error)} Tap to try again.</Text>
          </TouchableOpacity>
        )}
        {cylinders.map((c) => (
          <View key={c.size} style={styles.cylinderRow}>
            <Image source={CYLINDER_IMAGES[c.size]} style={styles.cylinderImage} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cylinderTitle}>{c.name} Size</Text>
              <Text style={styles.cylinderPrice}>{displayMoney(c.fullPrice, currency)}</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => draft.changeQuantity(c.size, -1)}
                accessibilityLabel={`Remove one ${c.name} cylinder`}
              >
                <Minus size={14} color="rgba(0,0,0,0.5)" weight="bold" />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{quantities[c.size] ?? 0}</Text>
              <TouchableOpacity
                style={[styles.stepperButton, styles.stepperButtonActive]}
                onPress={() => draft.changeQuantity(c.size, 1)}
                accessibilityLabel={`Add one ${c.name} cylinder`}
              >
                <Plus size={14} color="#007AFF" weight="bold" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </GlassCard>

      <TouchableOpacity
        style={[styles.placeOrderButton, draft.isOrderDisabled && styles.placeOrderButtonDisabled]}
        disabled={draft.isOrderDisabled}
        onPress={onPlaceOrder}
      >
        <Text style={styles.placeOrderText}>Place Order</Text>
      </TouchableOpacity>
    </>
  );
}
