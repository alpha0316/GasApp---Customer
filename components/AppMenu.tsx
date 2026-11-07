import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ClockCounterClockwise, Gear, House, List, LockKey, Phone, SignOut } from 'phosphor-react-native';
import { useAuthStore } from '@/features/auth/authStore';

export type AppMenuActive = 'home' | 'orders' | 'notifications' | 'contact' | null;

// Shared hamburger menu button + dropdown, used on every top-level screen
// (Home and anything reachable from its menu) so navigating between them
// is always one tap away instead of requiring a back-and-reopen round
// trip. Self-contained: owns its own open state and renders through a
// Modal so the dropdown/backdrop always cover the full screen regardless
// of where the button itself is mounted in a given screen's layout.
export default function AppMenuButton({ active = null, style }: { active?: AppMenuActive; style?: ViewStyle }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'GU';
  const [open, setOpen] = useState(false);
  // Every screen that mounts this button positions it at insets.top + 12;
  // the dropdown drops below it (button height + a small gap) regardless
  // of device notch/Dynamic Island size, instead of a flat pixel offset.
  const dropdownTop = insets.top + 12 + 40 + 8;

  const close = () => setOpen(false);

  const goTo = (screen: 'Home' | 'Orders' | 'Notification' | 'ContactUs' | 'SetPassword' | 'Account') => {
    setOpen(false);
    navigation.navigate(screen as never);
  };

  const handleSignOut = async () => {
    setOpen(false);
    // The navigator returns to the splash once the session is gone.
    await signOut();
  };

  const items: { key: Exclude<AppMenuActive, null>; label: string; icon: React.ReactNode; onPress: () => void }[] = [
    {
      key: 'home',
      label: 'Home',
      icon: <House size={18} color={active === 'home' ? '#007AFF' : 'rgba(0,0,0,0.6)'} weight={active === 'home' ? 'fill' : 'regular'} />,
      onPress: () => goTo('Home'),
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: (
        <ClockCounterClockwise
          size={18}
          color={active === 'orders' ? '#007AFF' : 'rgba(0,0,0,0.6)'}
          weight={active === 'orders' ? 'fill' : 'regular'}
        />
      ),
      onPress: () => goTo('Orders'),
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: (
        <Bell
          size={18}
          color={active === 'notifications' ? '#007AFF' : 'rgba(0,0,0,0.6)'}
          weight={active === 'notifications' ? 'fill' : 'regular'}
        />
      ),
      onPress: () => goTo('Notification'),
    },
    {
      key: 'contact',
      label: 'Contact Us',
      icon: (
        <Phone
          size={18}
          color={active === 'contact' ? '#007AFF' : 'rgba(0,0,0,0.6)'}
          weight={active === 'contact' ? 'fill' : 'regular'}
        />
      ),
      onPress: () => goTo('ContactUs'),
    },
  ];

  return (
    <>
      <TouchableOpacity style={[styles.menuButton, style]} onPress={() => setOpen(true)}>
        <List size={20} color="#000" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <TouchableOpacity style={[styles.backdrop, { paddingTop: dropdownTop }]} activeOpacity={1} onPress={close}>
          <TouchableOpacity activeOpacity={1} style={styles.dropdown} onPress={(e) => e.stopPropagation()}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuItem, active === item.key && styles.menuItemActive]}
                onPress={item.onPress}
              >
                {item.icon}
                <Text style={[styles.menuItemText, active === item.key && styles.menuItemTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.menuItem} onPress={close}>
              <Gear size={18} color="rgba(0,0,0,0.6)" />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => goTo('SetPassword')}>
              <LockKey size={18} color="rgba(0,0,0,0.6)" />
              <Text style={styles.menuItemText}>Password</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => goTo('Account')}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>{initials}</Text>
              </View>
              <Text style={styles.menuItemText}>My Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <SignOut size={18} color="rgba(0,0,0,0.6)" />
              <Text style={styles.menuItemText}>Sign Out</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingLeft: 16,
  },
  dropdown: {
    width: 230,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  menuItemActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  menuItemText: {
    fontSize: 15,
    color: 'rgba(0,0,0,0.75)',
  },
  menuItemTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 6,
    marginHorizontal: 14,
  },
  menuAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
