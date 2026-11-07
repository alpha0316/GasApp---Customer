import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  LayoutChangeEvent,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LockKey, Phone } from 'phosphor-react-native';
import { GOOGLE_G_XML, EMAIL_DARK_XML } from '@/components/icons/BrandIcons';
import { useAuthStore } from '@/features/auth/authStore';
import { errorMessage } from '@/lib/api/client';
import { primeLocation } from '@/lib/locationStore';
import type { RootStackParamList } from '@/types/navigation';

type AuthNavigation = NativeStackNavigationProp<RootStackParamList>;

const SPLASH_HOLD_MS = 1800;
const RISE_MS = 700;

export default function SplashScreen() {
  const navigation = useNavigation<AuthNavigation>();
  const { height: screenHeight } = useWindowDimensions();
  const [phase, setPhase] = useState<'splash' | 'auth'>('splash');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [holdElapsed, setHoldElapsed] = useState(false);
  const status = useAuthStore((s) => s.status);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const finishSplash = useAuthStore((s) => s.finishSplash);

  // Ported from the web app's `.logo-swing` keyframes: a pendulum swing
  // pivoting near the base of the cylinder, easing in/out, looping forever.
  const swingDeg = useSharedValue(0);

  // The logo's final resting spot is wherever flex layout puts it (same
  // position the whole time — nothing else reflows). On first measure we
  // jump it down so it visually sits at screen-center for the splash
  // beat, then animate that offset back to 0 so it visibly glides up.
  const logoTranslateY = useSharedValue(0);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    // Start fetching the user's location as early as the app opens, well
    // before Home mounts, so the map there is already focused on the real
    // position instead of starting from the default fallback coordinates.
    primeLocation();
  }, []);

  useEffect(() => {
    swingDeg.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 520, easing: Easing.inOut(Easing.ease) }),
        withTiming(-10, { duration: 520, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 520, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 520, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 520, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [swingDeg]);

  const swingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swingDeg.value}deg` }],
  }));

  const logoPositionStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const onLogoLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    const finalCenterY = y + height / 2;
    const screenCenterY = screenHeight / 2.5;
    logoTranslateY.value = screenCenterY - finalCenterY;
    logoOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) });
  };

  useEffect(() => {
    const timer = setTimeout(() => setHoldElapsed(true), SPLASH_HOLD_MS);
    return () => clearTimeout(timer);
  }, []);

  // After the hold, wait for the session check, then either hand over to Home
  // (the navigator switches once the splash is marked done) or show the sign-in options.
  useEffect(() => {
    if (!holdElapsed || status === 'loading') return;
    if (status === 'signedIn') {
      finishSplash();
      return;
    }
    logoTranslateY.value = withTiming(0, { duration: RISE_MS, easing: Easing.out(Easing.cubic) });
    setPhase('auth');
  }, [holdElapsed, status, finishSplash, logoTranslateY]);

  const handleGoogleContinue = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Google sign-in failed', errorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#CFE2FF', '#FFFFFF']} locations={[0, 0.6]} style={styles.container}>
      <View style={styles.content}>
        <Animated.View onLayout={onLogoLayout} style={[styles.logoWrapper, logoPositionStyle]}>
          <Animated.View style={[swingStyle, styles.swingPivot]}>
            <Image
              source={require('@/assets/images/gas-cylinder-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>

        <AuthContent
          visible={phase === 'auth'}
          googleLoading={googleLoading}
          onGoogle={handleGoogleContinue}
          navigation={navigation}
        />
      </View>
    </LinearGradient>
  );
}

function AuthContent({
  visible,
  googleLoading,
  onGoogle,
  navigation,
}: {
  visible: boolean;
  googleLoading: boolean;
  onGoogle: () => void;
  navigation: AuthNavigation;
}) {
  const titleY = useSharedValue(24);
  const titleOpacity = useSharedValue(0);
  const optionsY = useSharedValue(28);
  const optionsOpacity = useSharedValue(0);
  const termsOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    titleY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    titleOpacity.value = withTiming(1, { duration: 450 });

    optionsY.value = withDelay(140, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    optionsOpacity.value = withDelay(140, withTiming(1, { duration: 450 }));

    termsOpacity.value = withDelay(360, withTiming(1, { duration: 400 }));
  }, [visible, titleY, titleOpacity, optionsY, optionsOpacity, termsOpacity]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const optionsStyle = useAnimatedStyle(() => ({
    opacity: optionsOpacity.value,
    transform: [{ translateY: optionsY.value }],
  }));
  const termsStyle = useAnimatedStyle(() => ({
    opacity: termsOpacity.value,
  }));

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={styles.authContent}>
      <Animated.Text style={[styles.title, titleStyle]}>
        <Text style={styles.titleDark}>Your Hassle-Free Solution for </Text>
        <Text style={styles.titleLight}>convenient LPG refill</Text>
      </Animated.Text>

      <Animated.View style={[styles.options, optionsStyle]}>
        <TouchableOpacity
          style={[styles.authButton, styles.authButtonPrimary]}
          onPress={() => navigation.navigate('PhoneNumber')}
        >
          <Phone size={22} color="#fff" weight="fill" />
          <Text style={[styles.authButtonText, styles.authButtonTextPrimary]}>Continue With Phone Number</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.authButton, styles.authButtonSecondary]} onPress={onGoogle} disabled={googleLoading}>
          {googleLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <SvgXml xml={GOOGLE_G_XML} width={22} height={22} />
          )}
          <Text style={[styles.authButtonText, styles.authButtonTextSecondary]}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.authButton, styles.authButtonSecondary]}
          onPress={() => navigation.navigate('EmailSignIn')}
        >
          <SvgXml xml={EMAIL_DARK_XML} width={22} height={22} />
          <Text style={[styles.authButtonText, styles.authButtonTextSecondary]}>Get Started With Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.authButton, styles.authButtonSecondary]}
          onPress={() => navigation.navigate('PasswordSignIn')}
        >
          <LockKey size={22} color="#111827" />
          <Text style={[styles.authButtonText, styles.authButtonTextSecondary]}>Sign In With Password</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.Text style={[styles.terms, termsStyle]}>
        By using gas app, you agree to our Terms of Service and Privacy Policy.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  logoWrapper: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E6FE0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  swingPivot: {
    // Mirrors the web's `transform-origin: 50% 85%` so the cylinder swings
    // from near its base rather than its center.
    transformOrigin: '50% 85%',
  },
  logoImage: {
    width: 64,
    height: 64,
  },
  authContent: {
    gap: 24,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  titleDark: {
    color: '#000',
  },
  titleLight: {
    color: 'rgba(0,0,0,0.4)',
  },
  options: {
    gap: 12,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 22,
  },
  authButtonPrimary: {
    backgroundColor: '#000',
  },
  authButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  authButtonText: {
    flex: 1,
    textAlign: 'center',
    marginRight: 36,
    fontSize: 14,
    fontWeight: '700',
  },
  authButtonTextPrimary: {
    color: '#fff',
  },
  authButtonTextSecondary: {
    color: '#111827',
  },
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
  },
});
