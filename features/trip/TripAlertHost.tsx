import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Pressable, useColorScheme, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  cancelAnimation,
  Easing,
  FadeOutUp,
  runOnJS,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Clock, X } from 'phosphor-react-native';
import { useNotificationSettings } from '@/features/notifications/settings';
import FillingPumpIcon from '@/components/icons/FillingPumpIcon';
import FloatingSheet, { SheetButton } from '@/components/FloatingSheet';
import { SvgXml } from 'react-native-svg';
import { LOCATION_MARKER_GREEN_XML } from '@/components/icons/BrandIcons';
import { eventStyle } from './eventStyle';
import { useTripStore, type TripAlert } from './store';
import { useTripWatcher } from './useTripWatcher';
import { onTripNotificationTap } from './systemNotifications';

// Toasts count down this long, with a bar along the bottom, then leave on their own.
// Prominent cards wait for the customer.
const TOAST_MS = 10_000;

// Toast colours for light and dark mode, after the design spec.
const TOAST_THEME = {
  light: {
    bg: '#FFFFFF',
    border: 'rgba(0,0,0,0.10)',
    title: '#111111',
    body: '#6B6B6B',
    close: '#6B6B6B',
    track: 'rgba(0,0,0,0.06)',
    dot: '#D9D9D9',
    shadow: 0.08,
  },
  dark: {
    bg: '#1B1B1B',
    border: 'rgba(255,255,255,0.08)',
    title: '#FFFFFF',
    body: 'rgba(255,255,255,0.45)',
    close: 'rgba(255,255,255,0.55)',
    track: 'rgba(255,255,255,0.08)',
    dot: 'rgba(255,255,255,0.25)',
    shadow: 0.3,
  },
};



function Toast({ alert, onOpen }: { alert: TripAlert; onOpen: () => void }) {
  const insets = useSafeAreaInsets();
  const theme = TOAST_THEME[useColorScheme() === 'dark' ? 'dark' : 'light'];
  // The icon and colour say what happened: motorbike on the way, pump while filling, house when close.
  const { Icon: Glyph, color, pump, xml, image } = eventStyle(alert.event);

  // 1 -> 0 over TOAST_MS drives the countdown bar; reaching 0 dismisses the toast.
  // Keyed on the alert only: the host re-renders on every rider ping, which must not restart it.
  const remaining = useSharedValue(1);
  const dismiss = () => useTripStore.getState().dismiss(alert.id);
  const run = (from: number) => {
    remaining.value = withTiming(0, { duration: from * TOAST_MS, easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(dismiss)();
    });
  };
  useEffect(() => {
    run(1);
    return () => cancelAnimation(remaining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert.id]);
  const barStyle = useAnimatedStyle(() => ({ width: `${remaining.value * 100}%` }));

  return (
    <Animated.View
      // A slow, soft spring: the toast settles in instead of snapping.
      entering={SlideInUp.springify().damping(20).mass(1.2).stiffness(70)}
      exiting={FadeOutUp.duration(300)}
      style={[
        styles.toast,
        { top: insets.top + 8, backgroundColor: theme.bg, borderColor: theme.border, shadowOpacity: theme.shadow },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Pressable
        style={styles.toastPress}
        onPress={onOpen}
        // Holding the toast pauses the countdown so it can be read.
        onPressIn={() => cancelAnimation(remaining)}
        onPressOut={() => run(remaining.value)}
        accessibilityHint="Opens live tracking"
      >
        <View style={styles.toastIcon}>
          {pump ? (
            <FillingPumpIcon animated size={22} />
          ) : image ? (
            <Image source={image} style={styles.toastImage} resizeMode="contain" />
          ) : xml ? (
            <SvgXml xml={xml} width={24} height={24} />
          ) : (
            <Glyph size={22} weight="fill" color={color} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.toastTitle, { color: theme.title }]} numberOfLines={2}>
            {alert.title}
          </Text>
          <Text style={[styles.toastBody, { color: theme.body }]} numberOfLines={3}>
            {alert.body}
          </Text>
          {(alert.etaStrong || alert.condition) && (
            <View style={styles.toastMeta}>
              {alert.etaStrong && (
                <>
                  <Clock size={14} weight="fill" color={theme.title} />
                  <Text style={[styles.toastMetaText, { color: theme.body }]} numberOfLines={1}>
                    {alert.etaSoft}{' '}
                    <Text style={{ color: theme.title }}>{alert.etaStrong}</Text>
                  </Text>
                </>
              )}
              {alert.etaStrong && alert.condition && <View style={[styles.toastMetaDot, { backgroundColor: theme.dot }]} />}
              {alert.condition && (
                <Text style={[styles.toastMetaText, { color: theme.body }]} numberOfLines={1}>
                  {alert.condition}
                </Text>
              )}
            </View>
          )}
        </View>
      </Pressable>
      <TouchableOpacity onPress={dismiss} hitSlop={12} style={styles.toastClose} accessibilityLabel="Dismiss" accessibilityRole="button">
        <X size={20} color={theme.close} />
      </TouchableOpacity>

      <View style={[styles.toastTrack, { backgroundColor: theme.track }]}>
        <Animated.View style={[styles.toastBar, { backgroundColor: color }, barStyle]} />
      </View>
    </Animated.View>
  );
}

const RIDER_ART = require('@/assets/images/rider-arrival.png');

const TRAFFIC_TEXT = { light: 'Light Traffic', moderate: 'Moderate Traffic', heavy: 'Heavy Traffic' } as const;

// Figma "Rider Almost At Your Location" (node 32416:25421): a floating bottom sheet with the
// rider illustration, the ETA and traffic, and Call / Got it.
function ArrivalSheet({ alert, onClose }: { alert: TripAlert; onClose: () => void }) {
  // A delay seen on the trip ("Slight Traffic") wins over the usual roads for this hour.
  const trafficText = alert.condition ?? (alert.traffic ? TRAFFIC_TEXT[alert.traffic] : null);
  return (
    <FloatingSheet
      visible
      alert
      onClose={onClose}
      contentStyle={styles.sheetContent}
      footer={
        <>
          {alert.riderPhone && (
            <SheetButton title="Call Rider" variant="secondary" onPress={() => Linking.openURL(`tel:${alert.riderPhone}`)} />
          )}
          <SheetButton title="Got it" onPress={onClose} />
        </>
      }
    >
      <View style={styles.artFrame}>
        <View style={styles.artCircle}>
          {alert.event === 'arriving_dropoff' ? (
            // Heading back with the full cylinder: the green delivery pin (78x126 artwork).
            <SvgXml xml={LOCATION_MARKER_GREEN_XML} width={50} height={80.8} />
          ) : (
            <Image source={RIDER_ART} style={styles.art} accessibilityIgnoresInvertColors />
          )}
        </View>
      </View>

      <View style={styles.sheetText}>
        <Text style={styles.sheetTitle}>{alert.title}</Text>
        {(alert.etaMaxMinutes !== null || trafficText) && (
          <View style={styles.etaLine}>
            {alert.etaMaxMinutes !== null && <Clock size={14} weight="fill" color="#000" />}
            {alert.etaMaxMinutes !== null && (
              <Text style={styles.etaStrong}>
                {`Less than ${alert.etaMaxMinutes} `}
                <Text style={styles.etaSoft}>min away</Text>
              </Text>
            )}
            {alert.etaMaxMinutes !== null && trafficText && <View style={styles.etaDot} />}
            {trafficText && <Text style={styles.etaTraffic}>{trafficText}</Text>}
          </View>
        )}
        <Text style={styles.sheetBody}>{alert.body}</Text>
      </View>
    </FloatingSheet>
  );
}

// Watches trips and shows their alerts above every screen of the signed-in app.
export default function TripAlertHost({ onOpenOrder }: { onOpenOrder: (orderId: string) => void }) {
  useTripWatcher();
  const loadSettings = useNotificationSettings((s) => s.load);
  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);
  // Tapping a trip notification in Notification Center opens that order's tracker.
  const openRef = React.useRef(onOpenOrder);
  openRef.current = onOpenOrder;
  useEffect(() => onTripNotificationTap((id) => openRef.current(id)), []);
  const alert = useTripStore((s) => s.alerts[0]);
  const dismiss = useTripStore((s) => s.dismiss);

  if (!alert) return null;
  const close = () => dismiss(alert.id);
  const open = () => {
    dismiss(alert.id);
    onOpenOrder(alert.orderId);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {alert.prominent ? (
        <ArrivalSheet key={alert.id} alert={alert} onClose={close} />
      ) : (
        <Toast key={alert.id} alert={alert} onOpen={open} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  toastPress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 16,
    paddingBottom: 18,
    paddingLeft: 20,
    paddingRight: 48,
  },
  toastImage: { width: 24, height: 24 },
  toastIcon: { height: 22, justifyContent: 'center' },
  toastTitle: { fontSize: 16, fontWeight: '500', lineHeight: 22 },
  toastBody: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  toastMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  toastMetaText: { fontSize: 14 },
  toastMetaDot: { width: 3, height: 3, borderRadius: 1.5, marginHorizontal: 2 },
  toastClose: { position: 'absolute', top: 16, right: 16 },
  toastTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3 },
  toastBar: { height: 3 },
  sheetContent: { paddingBottom: 16 },
  // The design rotates the circle 15.02deg and the art -49.33deg inside it: net -34.31deg.
  artFrame: { width: 178.67, height: 178.67, alignItems: 'center', justifyContent: 'center' },
  artCircle: {
    width: 145.85,
    height: 145.85,
    borderRadius: 72.93,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { width: 103.43, height: 103.43, transform: [{ rotate: '-34.31deg' }] },
  sheetText: { alignSelf: 'stretch', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '600', color: '#000', textAlign: 'center' },
  etaLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  etaStrong: { fontSize: 14, fontWeight: '600', color: '#007AFF' },
  etaSoft: { fontWeight: '400', color: 'rgba(0,0,0,0.4)' },
  etaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D9D9D9' },
  etaTraffic: { fontSize: 14, color: 'rgba(0,0,0,0.6)' },
  sheetBody: { fontSize: 14, color: 'rgba(0,0,0,0.5)', textAlign: 'center', width: 260 },
});
