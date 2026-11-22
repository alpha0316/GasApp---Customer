import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { fromGeoPoint } from '@/lib/geo';
import { displayMoney } from '@/lib/money';
import { useAreas, useSettings } from '@/features/catalog/hooks';
import { styles } from '@/features/orders/screens/homeStyles';
import type { PaymentMethod } from '@/lib/api/types';
import AmountStep from '@/features/orders/home/AmountStep';
import CheckoutStep from '@/features/orders/home/CheckoutStep';
import HomeMap from '@/features/orders/home/HomeMap';
import LocationSearch from '@/features/orders/home/LocationSearch';
import SelectStep from '@/features/orders/home/SelectStep';
import StationsStep from '@/features/orders/home/StationsStep';
import { buildRiderInstructions, RUBBER_CHANGE_FEE, type HomeStep } from '@/features/orders/home/constants';
import { glide } from '@/features/orders/home/glide';
import { useHomeLocation } from '@/features/orders/home/useHomeLocation';
import { useNearbyStations } from '@/features/orders/home/useNearbyStations';
import { useOrderDraft } from '@/features/orders/home/useOrderDraft';
import { useOrderSubmission } from '@/features/orders/home/useOrderSubmission';
import { usePickupSchedule } from '@/features/orders/home/usePickupSchedule';

export default function Home() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<HomeStep>('select');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [rubberChangeRequested, setRubberChangeRequested] = useState(false);

  const location = useHomeLocation();
  const nearby = useNearbyStations(location.userLocation);
  const draft = useOrderDraft(location.userLocation, step === 'amount' || step === 'checkout');
  const submission = useOrderSubmission();
  const areasQuery = useAreas();
  const settings = useSettings();
  // The picked station's distance surcharge on top of the Delivery Fee (0 for the closest).
  const chosenStation = nearby.stations.find((s) => s.key === nearby.selectedStation) ?? null;
  const stationExtra = chosenStation?.extraFee ?? 0;

  const goToStep = (next: HomeStep) => {
    glide();
    setStep(next);
  };

  const goToStations = () => {
    nearby.setSelectedStation(nearby.stations[0]?.key ?? null);
    goToStep('stations');
  };

  const schedule = usePickupSchedule(goToStations);

  const { amountUnits } = draft;
  useEffect(() => {
    // If the user removes every remaining cylinder while on the amount or
    // checkout step, there's nothing left to confirm — bounce back to the
    // home/select screen.
    if ((step === 'amount' || step === 'checkout') && amountUnits.length === 0) {
      glide();
      setStep('select');
    }
  }, [step, amountUnits.length]);

  const handlePlaceOrder = () => {
    if (draft.isOrderDisabled) return;
    if (schedule.scheduleView) {
      // The general schedule picker is already open (e.g. the user just
      // tapped "Tomorrow" or picked a date/time) — treat tapping the main
      // button as "Save and continue" instead of requiring a separate tap.
      schedule.continueFromSchedule();
      return;
    }
    goToStations();
  };

  const handleConfirmStation = () => {
    draft.prepareAmounts();
    goToStep('amount');
  };

  const handleConfirmCheckout = () => {
    if (!draft.totals) return;
    return submission.submit({
      groups: draft.groups,
      paymentMethod,
      address: location.currentLocation,
      point: location.userLocation,
      pickupTime: schedule.pickupTime(),
      riderInstructions: buildRiderInstructions({
        stationName: chosenStation?.name ?? null,
        stationExtra,
        rubberChange: rubberChangeRequested,
        rubberFee: RUBBER_CHANGE_FEE,
        formatMoney: (minor) => displayMoney(minor, draft.currency),
      }),
      onDone: () => {
        draft.reset();
        setRubberChangeRequested(false);
        setStep('select');
      },
    });
  };

  // Service areas from the API stand in for saved places.
  const presets = (areasQuery.data ?? []).map((area) => ({ name: area.name, ...fromGeoPoint(area.center) }));

  return (
    <View style={styles.main}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <HomeMap
        mapRef={location.mapRef}
        region={location.region}
        onRegionChange={location.setRegion}
        userLocation={location.userLocation}
        stations={nearby.stations}
        routeTarget={nearby.routeTarget}
        routePath={nearby.routePath}
        frameRoute={step === 'stations'}
        topInset={insets.top}
        onRefocus={location.refocus}
      />

      <View style={[styles.floatingArea, { bottom: Math.max(insets.bottom, 8) }]} pointerEvents="box-none">
        {step === 'select' && (
          <SelectStep
            draft={draft}
            schedule={schedule}
            currentLocation={location.currentLocation}
            onOpenLocationSearch={() => goToStep('location')}
            onPlaceOrder={handlePlaceOrder}
          />
        )}
        {step === 'stations' && (
          <StationsStep
            stations={nearby.stations}
            selectedStation={nearby.selectedStation}
            isLoading={nearby.isLoading}
            isError={nearby.isError}
            onSelect={nearby.setSelectedStation}
            onBack={() => goToStep('select')}
            onContinue={handleConfirmStation}
            onRetry={() => nearby.refetch()}
            baseDeliveryFee={settings.data?.serviceFee ?? null}
          />
        )}
        {step === 'amount' && (
          <AmountStep
            draft={draft}
            rubberChangeRequested={rubberChangeRequested}
            onToggleRubberChange={() => setRubberChangeRequested((prev) => !prev)}
            onBack={() => goToStep('stations')}
            onContinue={() => goToStep('checkout')}
          />
        )}
        {step === 'checkout' && (
          <CheckoutStep
            draft={draft}
            rubberChangeRequested={rubberChangeRequested}
            stationExtraFee={stationExtra}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            submitting={submission.isSubmitting}
            onBack={() => goToStep('amount')}
            onConfirm={handleConfirmCheckout}
          />
        )}
      </View>

      {step === 'location' && (
        <LocationSearch
          currentLocation={location.currentLocation}
          presets={presets}
          onClose={() => goToStep('select')}
          onUseCurrent={() => {
            goToStep('select');
            // Fire-and-forget so the overlay closes immediately instead of
            // waiting on the GPS fix; the map animates to the new position (or
            // an alert fires) once the location comes back.
            void location.refocus();
          }}
          onSelectPreset={(loc) => {
            location.selectPreset(loc);
            goToStep('select');
          }}
        />
      )}
    </View>
  );
}
