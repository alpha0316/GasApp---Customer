import { GOOGLE_IOS_CLIENT_ID, GOOGLE_SIGNIN_ENABLED, GOOGLE_WEB_CLIENT_ID } from '@/lib/config';

let configured = false;

// Returns the Google ID token, or null when the user dismissed the sheet.
// Throws when Google sign-in is not configured or enabled for this build.
//
// The `@react-native-google-signin/google-signin` native module is required lazily,
// only once GOOGLE_SIGNIN_ENABLED confirms it's linked — importing it eagerly crashes
// any build where it isn't (see GOOGLE_SIGNIN_ENABLED in lib/config.ts).
export async function getGoogleIdToken(): Promise<string | null> {
  if (!GOOGLE_SIGNIN_ENABLED) {
    throw new Error('Google sign-in is not available on this build yet.');
  }
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('Google sign-in is not set up for this build.');
  }
  const { GoogleSignin, isErrorWithCode, statusCodes } =
    require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
  if (!configured) {
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, iosClientId: GOOGLE_IOS_CLIENT_ID });
    configured = true;
  }
  try {
    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();
    return idToken;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) return null;
    throw error;
  }
}

export async function signOutOfGoogle(): Promise<void> {
  if (!configured) return;
  const { GoogleSignin } =
    require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
  await GoogleSignin.signOut();
}
