import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface FloatingSheetProps {
  visible: boolean;
  // Backdrop tap and the Android back button.
  onClose: () => void;
  children: React.ReactNode;
  // Buttons in the grey bar along the bottom (use SheetButton).
  footer?: React.ReactNode;
  // Lets screen readers announce the sheet straight away (e.g. a rider arriving).
  alert?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

// The app's floating bottom sheet (Figma "Rider Almost At Your Location", node 32416:25421):
// a white card that floats above the bottom edge, inset from both sides, with a grey
// button bar. Shared by the arrival alert and the delivery rating.
export default function FloatingSheet({ visible, onClose, children, footer, alert, contentStyle }: FloatingSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss" />
          <Animated.View
            // A slow, soft spring so the sheet settles in rather than snapping.
            entering={SlideInDown.springify().damping(20).mass(1.2).stiffness(70)}
            style={[styles.sheet, { marginBottom: Math.max(insets.bottom - 8, 16) }]}
            accessibilityRole={alert ? 'alert' : undefined}
            accessibilityViewIsModal
          >
            <View style={[styles.content, contentStyle]}>{children}</View>
            {footer && <View style={styles.footer}>{footer}</View>}
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface SheetButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function SheetButton({ title, onPress, variant = 'primary', disabled, icon }: SheetButtonProps) {
  // Danger is a filled red button, for actions that cannot be undone.
  const primary = variant !== 'secondary';
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'danger' ? styles.buttonDanger : primary ? styles.buttonPrimary : styles.buttonSecondary,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {icon}
      <Text style={[styles.buttonText, primary ? styles.buttonTextPrimary : styles.buttonTextSecondary]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0C0C0D',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 12,
  },
  content: { paddingTop: 16, paddingBottom: 16, gap: 16, alignItems: 'center' },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 8,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonPrimary: { backgroundColor: '#007AFF' },
  buttonDanger: { backgroundColor: '#D92D20' },
  buttonSecondary: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  buttonTextPrimary: { color: '#fff' },
  buttonTextSecondary: { color: '#000' },
});
