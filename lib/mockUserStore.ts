import AsyncStorage from '@react-native-async-storage/async-storage';

// Placeholder "backend": persists sign-up data on-device until the real auth
// backend (OTP sending, Google OAuth, account dedup) is wired up.

export type AuthMethodType = 'phone' | 'google' | 'email';

export type MockUser = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  authMethods: AuthMethodType[];
  createdAt: number;
};

const USERS_KEY = 'gasapp_mock_users';
const SESSION_KEY = 'gasapp_mock_session_user_id';

const normalizePhone = (phone: string) => phone.replace(/[^\d]/g, '').replace(/^0/, '233');
const normalizeEmail = (email: string) => email.trim().toLowerCase();

const readUsers = async (): Promise<MockUser[]> => {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeUsers = async (users: MockUser[]) => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const findUserByPhone = async (phone: string): Promise<MockUser | null> => {
  if (!phone) return null;
  const users = await readUsers();
  const target = normalizePhone(phone);
  return users.find((u) => u.phone && normalizePhone(u.phone) === target) ?? null;
};

export const findUserByEmail = async (email: string): Promise<MockUser | null> => {
  if (!email) return null;
  const users = await readUsers();
  const target = normalizeEmail(email);
  return users.find((u) => u.email && normalizeEmail(u.email) === target) ?? null;
};

export const createUser = async (data: {
  fullName: string;
  email?: string;
  phone?: string;
  method: AuthMethodType;
}): Promise<MockUser> => {
  const users = await readUsers();
  const user: MockUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    authMethods: [data.method],
    createdAt: Date.now(),
  };
  users.push(user);
  await writeUsers(users);
  await setSession(user);
  return user;
};

export const linkAuthMethod = async (userId: string, method: AuthMethodType) => {
  const users = await readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return;
  if (!users[idx].authMethods.includes(method)) {
    users[idx].authMethods.push(method);
    await writeUsers(users);
  }
};

export const setSession = async (user: MockUser) => {
  await AsyncStorage.setItem(SESSION_KEY, user.id);
};

export const getSession = async (): Promise<MockUser | null> => {
  const id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const users = await readUsers();
  return users.find((u) => u.id === id) ?? null;
};

export const clearSession = async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
};
