import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'gasapp.token';

// The API client reads the token on every request, so keep a copy in memory.
let memoryToken: string | null = null;

export function readTokenSync(): string | null {
  return memoryToken;
}

export async function loadToken(): Promise<string | null> {
  memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return memoryToken;
}

export async function saveToken(token: string): Promise<void> {
  memoryToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  memoryToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
