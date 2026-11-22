import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Linking, AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { BellRinging, CaretRight, ClockCounterClockwise, DeviceMobile, House, SpeakerHigh, type Icon } from 'phosphor-react-native';
import BackButton from '@/components/BackButton';
import { useNotificationSettings, type NotificationSettings as Prefs } from '@/features/notifications/settings';

const PRIMARY = '#0A6CFF';

function IconDot({ icon: Glyph, color }: { icon: Icon; color: string }) {
  return (
    <View style={[styles.iconDot, { backgroundColor: color }]}>
      <Glyph size={14} weight="fill" color="#fff" />
    </View>
  );
}

function ToggleRow({
  icon,
  color,
  title,
  detail,
  setting,
  disabled,
}: {
  icon: Icon;
  color: string;
  title: string;
  detail: string;
  setting: keyof Prefs;
  disabled?: boolean;
}) {
  const value = useNotificationSettings((s) => s[setting]);
  const set = useNotificationSettings((s) => s.set);
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <IconDot icon={icon} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Switch
        value={value && !disabled}
        disabled={disabled}
        onValueChange={(v) => set({ [setting]: v })}
        trackColor={{ true: PRIMARY, false: '#E5E5EA' }}
        accessibilityLabel={title}
      />
    </View>
  );
}

// What interrupts the customer during a delivery. Opened from Profile -> Notification.
export default function NotificationSettings() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const load = useNotificationSettings((s) => s.load);
  const phoneAlerts = useNotificationSettings((s) => s.phoneAlerts);
  const [permission, setPermission] = useState<'granted' | 'ask' | 'blocked' | null>(null);

  const checkPermission = useCallback(async () => {
    const p = await Notifications.getPermissionsAsync();
    setPermission(p.granted ? 'granted' : p.canAskAgain ? 'ask' : 'blocked');
  }, []);

  useEffect(() => {
    void load();
    void checkPermission();
    // The customer may switch notifications on in Settings and come back.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void checkPermission();
    });
    return () => sub.remove();
  }, [load, checkPermission]);

  const allowNotifications = async () => {
    if (permission === 'ask') {
      await Notifications.requestPermissionsAsync();
      await checkPermission();
    } else {
      await Linking.openSettings();
    }
  };

  const phoneOff = permission !== null && permission !== 'granted';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.section}>Trip updates</Text>
        <ToggleRow
          icon={BellRinging}
          color="#F08A00"
          title="In-app pop-ups"
          detail="Rider on the way, at the station, filling and heading back, with the ETA."
          setting="tripToasts"
        />
        <ToggleRow
          icon={House}
          color="#E5262A"
          title="Almost-there alerts"
          detail="A full-screen card when your rider is a couple of minutes away."
          setting="arrivalCards"
        />

        <Text style={styles.section}>Phone notifications</Text>
        {phoneOff && (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Notifications are off for GasApp</Text>
            <Text style={styles.permissionText}>Turn them on to get trip alerts when the app is closed.</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={allowNotifications} accessibilityRole="button">
              <Text style={styles.permissionButtonText}>{permission === 'ask' ? 'Allow notifications' : 'Open Settings'}</Text>
            </TouchableOpacity>
          </View>
        )}
        <ToggleRow
          icon={DeviceMobile}
          color="#2F3DE0"
          title="Trip alerts on your phone"
          detail="Show trip alerts in Notification Center and on the lock screen."
          setting="phoneAlerts"
          disabled={phoneOff}
        />
        <ToggleRow
          icon={SpeakerHigh}
          color="#12A150"
          title="Sound"
          detail="Play a sound with each phone alert."
          setting="sound"
          disabled={phoneOff || !phoneAlerts}
        />

        <Text style={styles.section}>History</Text>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Notification')} accessibilityRole="button">
          <IconDot icon={ClockCounterClockwise} color="#8E2DA8" />
          <Text style={[styles.rowTitle, { flex: 1 }]}>All notifications</Text>
          <CaretRight size={16} weight="bold" color="#000" />
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Order confirmations, payment receipts and sign-in codes are always sent, whatever you choose here.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  body: { paddingHorizontal: 16, paddingTop: 8 },
  section: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 24,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowDisabled: { opacity: 0.45 },
  iconDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, color: '#000' },
  rowDetail: { fontSize: 12, color: 'rgba(0,0,0,0.5)', marginTop: 2, lineHeight: 16 },
  permissionCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(245,165,36,0.12)',
    marginVertical: 6,
    gap: 4,
  },
  permissionTitle: { fontSize: 14, fontWeight: '700', color: '#000' },
  permissionText: { fontSize: 13, color: 'rgba(0,0,0,0.6)' },
  permissionButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  permissionButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  footnote: { fontSize: 12, color: 'rgba(0,0,0,0.45)', lineHeight: 17, marginTop: 24 },
});
