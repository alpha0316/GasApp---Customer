import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Ported from the web app's rider marker: a pulsing ring behind a circular
// backdrop holding the bike icon, which itself rotates to face its
// direction of travel (compass bearing, 0deg = north/up — matches the
// artwork's default orientation).
const SIZE = 64;
const BACKDROP_SIZE = 36;

export default function BikeRiderMarker({ bearing = 0 }: { bearing?: number }) {
  const pulseScale = useSharedValue(0.3);
  const pulseOpacity = useSharedValue(0.45);
  const rotate = useSharedValue(bearing);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
      ),
      -1,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 1260, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 540, easing: Easing.out(Easing.ease) }),
      ),
      -1,
    );
  }, [pulseScale, pulseOpacity]);

  useEffect(() => {
    // Shortest-path rotation so the bike doesn't spin the long way around
    // when bearing wraps past 360/0.
    const current = rotate.value % 360;
    let delta = bearing - current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    rotate.value = withTiming(current + delta, { duration: 600, easing: Easing.out(Easing.quad) });
  }, [bearing, rotate]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const bikeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, ringStyle]} />
      <View style={styles.backdrop}>
        <Animated.View style={bikeStyle}>
          <Image source={require('@/assets/bike-rider.png')} style={styles.bike} resizeMode="contain" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(0,136,255,0.35)',
  },
  backdrop: {
    width: BACKDROP_SIZE,
    height: BACKDROP_SIZE,
    borderRadius: BACKDROP_SIZE / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bike: {
    width: 28,
    height: 28,
  },
});
