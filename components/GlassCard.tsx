import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

type Props = {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  intensity?: number;
};

// Drop-in replacement for the plain white floating-card `View` used
// throughout the app (Home's order cards, Tracker's tracking card): keeps
// whatever radius/padding/shadow the caller passes in, but swaps the solid
// white fill for a blurred, 90%-opaque "glass" surface so the map shows
// faintly through it.
export default function GlassCard({ style, children, intensity = 36 }: Props) {
  const flat = (StyleSheet.flatten(style) || {}) as ViewStyle;
  const { backgroundColor, ...outerStyle } = flat;

  const radius = {
    borderTopLeftRadius: flat.borderTopLeftRadius ?? flat.borderRadius ?? 0,
    borderTopRightRadius: flat.borderTopRightRadius ?? flat.borderRadius ?? 0,
    borderBottomLeftRadius: flat.borderBottomLeftRadius ?? flat.borderRadius ?? 0,
    borderBottomRightRadius: flat.borderBottomRightRadius ?? flat.borderRadius ?? 0,
  };

  return (
    <View style={outerStyle}>
      <BlurView intensity={intensity} tint="light" style={[StyleSheet.absoluteFillObject, radius, styles.blur]}>
        <View style={styles.tint} pointerEvents="none" />
      </BlurView>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});
