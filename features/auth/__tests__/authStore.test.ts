import { clearToken } from '@/lib/api/tokenStorage';
import { setUnauthorizedHandler } from '@/lib/api/client';
import { useAuthStore } from '../authStore';

jest.mock('@/lib/queryClient', () => ({ queryClient: { clear: jest.fn() } }));
jest.mock('@/lib/api/client', () => ({
  errorMessage: jest.fn(),
  setUnauthorizedHandler: jest.fn(),
}));
jest.mock('@/lib/api/tokenStorage', () => ({
  clearToken: jest.fn(),
  loadToken: jest.fn(),
  saveToken: jest.fn(),
}));
jest.mock('@/lib/socket', () => ({ disconnectSocket: jest.fn() }));
jest.mock('@/features/notifications/push', () => ({ unregisterPushToken: jest.fn() }));
jest.mock('../api', () => ({
  getMe: jest.fn(),
  googleSignIn: jest.fn(),
  passwordLogin: jest.fn(),
  updateMe: jest.fn(),
  verifyOtp: jest.fn(),
}));
jest.mock('../useGoogleSignIn', () => ({
  getGoogleIdToken: jest.fn(),
  signOutOfGoogle: jest.fn(),
}));

const mockClearToken = clearToken as jest.Mock;
const mockSetHandler = setUnauthorizedHandler as jest.Mock;

describe('unauthorized handler', () => {
  // The store registers its handler once, when the module loads.
  const handler = mockSetHandler.mock.calls[0][0] as () => void;

  beforeEach(() => {
    mockClearToken.mockReset();
    useAuthStore.setState({ status: 'signedIn', user: null, splashDone: true });
  });

  it('clears the stored token and signs out on a 401', () => {
    mockClearToken.mockResolvedValue(undefined);
    handler();
    expect(mockClearToken).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().status).toBe('signedOut');
  });

  it('logs a clearToken failure and still signs out', async () => {
    const failure = new Error('storage down');
    mockClearToken.mockRejectedValue(failure);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    handler();
    await Promise.resolve();
    await Promise.resolve();
    expect(warn).toHaveBeenCalledWith('Token removal after 401 failed', failure);
    expect(useAuthStore.getState().status).toBe('signedOut');
    warn.mockRestore();
  });
});
