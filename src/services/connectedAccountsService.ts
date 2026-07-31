import * as SecureStore from 'expo-secure-store';

export interface ConnectedGoogleAccount {
  name: string;
  email: string;
  photoUrl: string;
  isPrimary: boolean;
  /** Stored only in the platform's encrypted credential store. */
  accessToken: string;
}

const CONNECTED_ACCOUNTS_KEY = 'huxeai.connected-google-accounts.v1';

async function readAccounts(): Promise<ConnectedGoogleAccount[]> {
  const value = await SecureStore.getItemAsync(CONNECTED_ACCOUNTS_KEY);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as ConnectedGoogleAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAccounts(accounts: ConnectedGoogleAccount[]): Promise<void> {
  await SecureStore.setItemAsync(CONNECTED_ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function getConnectedGoogleAccounts(): Promise<ConnectedGoogleAccount[]> {
  return readAccounts();
}

export async function savePrimaryGoogleAccount(
  user: Omit<ConnectedGoogleAccount, 'isPrimary' | 'accessToken'>,
  accessToken: string | null,
): Promise<ConnectedGoogleAccount[]> {
  if (!accessToken) throw new Error('Google did not return an access token');
  const existing = await readAccounts();
  const additional = existing.filter(account => account.email !== user.email && !account.isPrimary);
  const accounts = [{ ...user, isPrimary: true, accessToken }, ...additional];
  await writeAccounts(accounts);
  return accounts;
}

export async function addConnectedGoogleAccount(
  user: Omit<ConnectedGoogleAccount, 'isPrimary' | 'accessToken'>,
  accessToken: string | null,
): Promise<ConnectedGoogleAccount[]> {
  if (!accessToken) throw new Error('Google did not return an access token');
  const existing = await readAccounts();
  if (existing.some(account => account.email === user.email)) {
    throw new Error(`${user.email} is already connected`);
  }
  const accounts = [...existing, { ...user, isPrimary: false, accessToken }];
  await writeAccounts(accounts);
  return accounts;
}

export async function updateConnectedGoogleAccountToken(
  email: string,
  accessToken: string | null,
): Promise<ConnectedGoogleAccount[]> {
  if (!accessToken) return readAccounts();
  const accounts = (await readAccounts()).map(account =>
    account.email === email ? { ...account, accessToken } : account,
  );
  await writeAccounts(accounts);
  return accounts;
}

export async function removeConnectedGoogleAccount(email: string): Promise<ConnectedGoogleAccount[]> {
  const existing = await readAccounts();
  const account = existing.find(item => item.email === email);
  if (!account || account.isPrimary) return existing;
  const accounts = existing.filter(item => item.email !== email);
  await writeAccounts(accounts);
  return accounts;
}

export async function clearConnectedGoogleAccounts(): Promise<void> {
  await SecureStore.deleteItemAsync(CONNECTED_ACCOUNTS_KEY);
}
