import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  type TextInputProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretRight } from 'phosphor-react-native';
import BackButton from '@/components/BackButton';

const DIVIDER = 'rgba(0,0,0,0.08)';
export const DANGER = '#D92D20';

// A settings form page: back button and centred title, a scrolling list of sections, and the
// main action pinned to the bottom (it rides up with the keyboard).
export function FormScreen({
  title,
  children,
  footer,
  onBack,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <BackButton onPress={onBack} />
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.body, !footer && { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer && <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>{footer}</View>}
    </KeyboardAvoidingView>
  );
}

// An uppercase heading over a group of rows, e.g. "BASIC INFO".
export function FormSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      {!!title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View>{children}</View>
    </View>
  );
}

type FormRowProps = Omit<TextInputProps, 'style' | 'editable'> & {
  label: string;
  // Read-only rows show the value in grey and cannot be typed into.
  readOnly?: boolean;
  // Tapping opens something else (another screen, a sheet): the row shows a caret.
  onPress?: () => void;
};

// One line of a form: the field name on the left, its input on the right, a divider below.
export function FormRow({ label, readOnly, onPress, value, placeholder, ...input }: FormRowProps) {
  const content = (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {onPress ? (
        <Text style={[styles.rowInput, styles.rowValue, !value && styles.rowPlaceholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
      ) : (
        <TextInput
          {...input}
          value={value}
          placeholder={placeholder}
          editable={!readOnly}
          placeholderTextColor="rgba(0,0,0,0.35)"
          accessibilityLabel={input.accessibilityLabel ?? label}
          style={[styles.rowInput, readOnly && styles.rowReadOnly]}
        />
      )}
      {onPress && <CaretRight size={16} weight="bold" color="rgba(0,0,0,0.4)" />}
    </View>
  );
  if (!onPress) return content;
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}${value ? `, ${value}` : ''}`} activeOpacity={0.6}>
      {content}
    </TouchableOpacity>
  );
}

// A row that runs an action, like "Set password" or the red "Delete Account".
export function FormActionRow({
  label,
  onPress,
  icon,
  danger,
  detail,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  detail?: string;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button" activeOpacity={0.6}>
      {icon}
      <View style={styles.fill}>
        <Text style={[styles.actionLabel, danger && { color: DANGER }]}>{label}</Text>
        {!!detail && <Text style={styles.actionDetail}>{detail}</Text>}
      </View>
      <CaretRight size={16} weight="bold" color="rgba(0,0,0,0.4)" />
    </TouchableOpacity>
  );
}

// Helper or error text under a section.
export function FormNote({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return <Text style={[styles.note, error && { color: DANGER }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  headerSpacer: { width: 40 },
  body: { paddingBottom: 24 },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.55)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  rowLabel: { width: 110, fontSize: 15, color: 'rgba(0,0,0,0.5)' },
  rowInput: { flex: 1, fontSize: 15, fontWeight: '500', color: '#000', paddingVertical: 16 },
  rowValue: { paddingVertical: 0 },
  rowPlaceholder: { color: '#007AFF', fontWeight: '600' },
  rowReadOnly: { color: 'rgba(0,0,0,0.6)' },
  actionLabel: { fontSize: 15, fontWeight: '600', color: '#000' },
  actionDetail: { fontSize: 12, color: 'rgba(0,0,0,0.5)', marginTop: 2 },
  note: { fontSize: 12, color: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingTop: 8, lineHeight: 17 },
  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#fff' },
});
