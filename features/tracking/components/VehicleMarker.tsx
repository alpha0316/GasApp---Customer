import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { VEHICLES, type VehicleKind } from '@/features/tracking/vehicles';

// The rider on the map: their vehicle seen from above, turned to its heading (compass bearing,
// 0 = north, the artwork's orientation), over a pulsing ring. A vehicle without top-down art
// shows its side view in a round badge that stays upright.
export default function VehicleMarker({ kind, bearing = 0 }: { kind: VehicleKind; bearing?: number }) {
  const art = VEHICLES[kind];
  const length = art.top ? art.topLength : BADGE;
  const size = length + 28;

  const pulseScale = useSharedValue(0.3);
  const pulseOpacity = useSharedValue(0.45);
  const rotate = useSharedValue(bearing);

  useEffect(() => {
    pulseScale.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1);
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 1260, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 540, easing: Easing.out(Easing.ease) }),
      ),
      -1,
    );
  }, [pulseScale, pulseOpacity]);

  useEffect(() => {
    // Shortest-path rotation so the vehicle never spins the long way round past 360/0.
    const current = rotate.value % 360;
    let delta = bearing - current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    rotate.value = withTiming(current + delta, { duration: 600, easing: Easing.out(Easing.quad) });
  }, [bearing, rotate]);

  const ringStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value, transform: [{ scale: pulseScale.value }] }));
  const turnStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, ringStyle]} />
      {art.top ? (
        <Animated.View style={[styles.shadow, { width: length, height: length }, turnStyle]}>
          <Image source={art.top} style={{ width: length, height: length }} resizeMode="contain" />
        </Animated.View>
      ) : (
        <View style={styles.badge}>
          <Image source={art.side} style={styles.badgeImage} resizeMode="contain" />
        </View>
      )}
    </View>
  );
}

const BADGE = 40;

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    backgroundColor: 'rgba(0,136,255,0.35)',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeImage: {
    width: 32,
    height: 28,
  },
});
