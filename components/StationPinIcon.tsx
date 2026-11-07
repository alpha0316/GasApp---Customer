import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Path, Circle, SvgXml } from 'react-native-svg';
import { STATION_PUMP_ICON_XML } from '@/components/icons/BrandIcons';

// Ported from the web app's badge-style map pin: a soft radial-gradient
// circle with a pointed tail and an anchor dot, matching the 36x46
// aspect ratio used there. The pump glyph is laid over the badge rather
// than hand-copied as raw path data, since we don't have the original
// `station-pin.svg` source to copy verbatim.
export default function StationPinIcon({ size = 36, selected = false }: { size?: number; selected?: boolean }) {
  const width = selected ? size * (44 / 36) : size;
  const height = selected ? size * (56 / 36) : size * (46 / 36);
  const badgeHeight = height * (36 / 46);
  const iconSize = selected ? width * 0.52 : width * 0.5;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 36 46">
        <Defs>
          <RadialGradient id="badgeGrad" cx="18" cy="18" r="17" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#EAF4FF" />
            <Stop offset="1" stopColor="#FFFFFF" />
          </RadialGradient>
        </Defs>

        <Path d="M14.5 35L21.5 35L18 41Z" fill="#fff" />
        <Circle cx="18" cy="18" r="17" fill="url(#badgeGrad)" stroke="#fff" strokeWidth="1" />
        <Circle cx="18" cy="41" r="2.5" fill="#007AFF" />
        <Circle cx="18" cy="41" r="2.5" fill="none" stroke="#fff" strokeWidth="0.5" />
      </Svg>

      <View style={[styles.iconOverlay, { width, height: badgeHeight }]} pointerEvents="none">
        <SvgXml xml={STATION_PUMP_ICON_XML} width={iconSize} height={iconSize} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
