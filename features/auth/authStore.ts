import { create } from 'zustand';
import { queryClient } from '@/lib/queryClient';
import { errorMessage, setUnauthorizedHandler } from '@/lib/api/client';
import { clearToken, loadToken, saveToken } from '@/lib/api/tokenStorage';
import type { OtpChannel, User } from '@/lib/api/types';
import { disconnectSocket } from '@/lib/socket';
import { unregisterPushToken } from '@/features/notifications/push';
import { getMe, googleSignIn, passwordLogin, updateMe, verifyOtp, type AuthResult } from './api';
import { needsEmail, needsName } from './profileGate';
import { getGoogleIdToken, signOutOfGoogle } from './useGoogleSignIn';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  // The splash animation plays once per app start before a signed-in user sees Home.
  splashDone: boolean;
  bootstrapError: string | null;
  bootstrap: () => Promise<void>;
  finishSplash: () => void;
  signInWithOtp: (channel: OtpChannel, target: string, code: string) => Promise<void>;
  signInWithPassword: (identifier: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  saveProfile: (firstName: string, lastName: string) => Promise<void>;
  setUser: (user: User) => void;
  signOut: () => Promise<void>;
}

export const selectNeedsName = (s: AuthState) => s.status === 'signedIn' && needsName(s.user);
export const selectNeedsEmail = (s: AuthState) => s.status === 'signedIn' && needsEmail(s.user);

export const useAuthStore = create<AuthState>((set, get) => {
  const applyAuth = async ({ token, user }: AuthResult) => {
    await saveToken(token);
    queryClient.clear();
    // A fresh sign-in skips the start-up splash.
    set({ status: 'signedIn', user, splashDone: true });
  };

  const dropSession = async () => {
    await clearToken();
    disconnectSocket();
    queryClient.clear();
    set({ status: 'signedOut', user: null, splashDone: false });
  };

  // Any 401 on an authenticated call means the 7-day token is gone.
  // The state resets at once. The stored token is cleared so the next start skips /me.
  setUnauthorizedHandler(() => {
    clearToken().catch((error: unknown) => console.warn('Token removal after 401 failed', error));
    disconnectSocket();
    queryClient.clear();
    set({ status: 'signedOut', user: null, splashDone: false });
  });

  return {
    status: 'loading',
    user: null,
    splashDone: false,
    bootstrapError: null,

    bootstrap: async () => {
      const token = await loadToken();
      if (!token) {
        set({ status: 'signedOut' });
        return;
      }
      try {
        const user = await getMe();
        set({ status: 'signedIn', user });
      } catch (error) {
        // A 401 already cleared the session through the unauthorized handler.
        // Any other failure (for example offline) keeps the stored token for the next start.
        if (get().status === 'loading') set({ status: 'signedOut', bootstrapError: errorMessage(error) });
      }
    },

    finishSplash: () => set({ splashDone: true }),

    signInWithOtp: async (channel, target, code) => {
      await applyAuth(await verifyOtp(channel, target, code));
    },

    signInWithPassword: async (identifier, password) => {
      await applyAuth(await passwordLogin(identifier, password));
    },

    // Resolves false when the user dismissed the Google sheet.
    signInWithGoogle: async () => {
      const idToken = await getGoogleIdToken();
      if (!idToken) return false;
      await applyAuth(await googleSignIn(idToken));
      return true;
    },

    saveProfile: async (firstName, lastName) => {
      const user = await updateMe({ firstName, lastName });
      set({ user });
    },

    setUser: (user) => set({ user }),

    signOut: async () => {
      // Order matters: remove the push token while the JWT still works.
      await unregisterPushToken().catch((error: unknown) => console.warn('Push token removal failed', error));
      await signOutOfGoogle().catch((error: unknown) => console.warn('Google sign-out failed', error));
      await dropSession();
    },
  };
});
