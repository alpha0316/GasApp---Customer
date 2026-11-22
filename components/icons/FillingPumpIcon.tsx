import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { STATION_PUMP_ICON_XML } from '@/components/icons/BrandIcons';

interface FillingPumpIconProps {
  // Loops a bottom-to-top fill to show the cylinder actively being filled.
  animated?: boolean;
  // One fill cycle, in ms.
  duration?: number;
  size?: number;
}

// The station pump glyph. Animated, a faint copy sits underneath while a full-colour copy
// rises through it from the bottom, over and over, like gas filling a tank.
// Ported from the rider app (GasApp-Delivery components/icons/FillingPumpIcon).
export default function FillingPumpIcon({ animated = false, duration = 1600, size = 16 }: FillingPumpIconProps) {
  const fill = useSharedValue(0);

  useEffect(() => {
    if (!animated) {
      cancelAnimation(fill);
      fill.value = 0;
      return;
    }
    fill.value = 0;
    fill.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, false);
    return () => cancelAnimation(fill);
  }, [animated, duration, fill]);

  const maskStyle = useAnimatedStyle(() => ({ height: fill.value * size }));

  if (!animated) return <SvgXml xml={STATION_PUMP_ICON_XML} width={size} height={size} />;

  return (
    <View style={{ width: size, height: size }} accessibilityLabel="Filling in progress">
      <View style={[StyleSheet.absoluteFill, styles.dim]}>
        <SvgXml xml={STATION_PUMP_ICON_XML} width={size} height={size} />
      </View>
      <Animated.View style={[styles.mask, { width: size }, maskStyle]}>
        <View style={[styles.maskInner, { width: size, height: size }]}>
          <SvgXml xml={STATION_PUMP_ICON_XML} width={size} height={size} />
        </View>
      </Animated.View>
    </View>
  );
}

interface FillingStatusBadgeProps {
  // The rider is at the station: the pump fills and a ring pulses around the circle.
  active?: boolean;
  size?: number;
}

// The pump in a white circle with a thin ring, as in the tracker timeline.
export function FillingStatusBadge({ active = false, size = 36 }: FillingStatusBadgeProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      cancelAnimation(pulse);
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }), -1, false);
    return () => cancelAnimation(pulse);
  }, [active, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.6 }],
  }));

  const radius = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      {active && (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: '#0085FF' }, ringStyle]}
        />
      )}
      <View
        style={[
          styles.badge,
          { width: size, height: size, borderRadius: radius },
          active ? styles.badgeActive : styles.badgeIdle,
        ]}
      >
        <FillingPumpIcon animated={active} size={Math.round(size * 0.56)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: { opacity: 0.25 },
  mask: { position: 'absolute', bottom: 0, left: 0, overflow: 'hidden' },
  maskInner: { position: 'absolute', bottom: 0, left: 0 },
  badge: { backgroundColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeActive: { borderColor: 'rgba(0,133,255,0.45)' },
  badgeIdle: { borderColor: 'rgba(0,0,0,0.1)' },
});
