// ─────────────────────────────────────────────────────────────
// Huxe AI — Database Context Provider
// Reactive wrapper around the db.ts access layer
// ─────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  UserPreferences,
  Interest,
  MarketPreferences,
  BriefHistory,
} from '../database/schema';

import {
  initDatabase,
  getUserPreferences,
  updateUserPreferences as dbUpdateUserPreferences,
  getInterests,
  addInterest as dbAddInterest,
  removeInterest as dbRemoveInterest,
  getMarketPreferences,
  updateMarketPreferences as dbUpdateMarketPreferences,
  addBriefHistory as dbAddBriefHistory,
  getRecentBriefs,
  clearAllData as dbClearAllData,
} from '../database/db';

// ── Context Shape ───────────────────────────────────────────

interface DatabaseContextValue {
  /** True while the database is being opened & seeded */
  isLoading: boolean;

  /** Current user preferences (reactive) */
  userPreferences: UserPreferences | null;

  /** Current interest list (reactive) */
  interests: Interest[];

  /** Current market preferences (reactive) */
  marketPreferences: MarketPreferences | null;

  /** Recent brief history entries */
  briefHistory: BriefHistory[];

  // ── Mutations ──

  updateUserPreferences: (
    prefs: Partial<Omit<UserPreferences, 'id'>>,
  ) => Promise<void>;

  addInterest: (topic: string) => Promise<void>;

  removeInterest: (id: number) => Promise<void>;

  updateMarketPreferences: (
    prefs: Partial<Omit<MarketPreferences, 'id'>>,
  ) => Promise<void>;

  addBriefHistory: (
    durationSeconds: number,
    audioFilePath: string,
  ) => Promise<void>;

  refreshBriefHistory: () => Promise<void>;

  clearAllData: () => Promise<void>;

  /** Force a full refresh of all reactive state */
  refreshAll: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [marketPreferences, setMarketPreferences] =
    useState<MarketPreferences | null>(null);
  const [briefHistory, setBriefHistory] = useState<BriefHistory[]>([]);

  // ── Data Loaders ────────────────────────────────────────

  const loadUserPreferences = useCallback(async () => {
    const prefs = await getUserPreferences();
    setUserPreferences(prefs);
  }, []);

  const loadInterests = useCallback(async () => {
    const items = await getInterests();
    setInterests(items);
  }, []);

  const loadMarketPreferences = useCallback(async () => {
    const prefs = await getMarketPreferences();
    setMarketPreferences(prefs);
  }, []);

  const loadBriefHistory = useCallback(async () => {
    const briefs = await getRecentBriefs(20);
    setBriefHistory(briefs);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadUserPreferences(),
      loadInterests(),
      loadMarketPreferences(),
      loadBriefHistory(),
    ]);
  }, [loadUserPreferences, loadInterests, loadMarketPreferences, loadBriefHistory]);

  // ── Init ────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initDatabase();
        if (mounted) {
          await refreshAll();
        }
      } catch (error) {
        console.error('[DatabaseProvider] Initialization failed:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshAll]);

  // ── Mutation Wrappers (auto-refresh after each) ─────────

  const updateUserPreferencesWrapped = useCallback(
    async (prefs: Partial<Omit<UserPreferences, 'id'>>) => {
      await dbUpdateUserPreferences(prefs);
      await loadUserPreferences();
    },
    [loadUserPreferences],
  );

  const addInterestWrapped = useCallback(
    async (topic: string) => {
      await dbAddInterest(topic);
      await loadInterests();
    },
    [loadInterests],
  );

  const removeInterestWrapped = useCallback(
    async (id: number) => {
      await dbRemoveInterest(id);
      await loadInterests();
    },
    [loadInterests],
  );

  const updateMarketPreferencesWrapped = useCallback(
    async (prefs: Partial<Omit<MarketPreferences, 'id'>>) => {
      await dbUpdateMarketPreferences(prefs);
      await loadMarketPreferences();
    },
    [loadMarketPreferences],
  );

  const addBriefHistoryWrapped = useCallback(
    async (durationSeconds: number, audioFilePath: string) => {
      await dbAddBriefHistory(durationSeconds, audioFilePath);
      await loadBriefHistory();
    },
    [loadBriefHistory],
  );

  const clearAllDataWrapped = useCallback(async () => {
    await dbClearAllData();
    await refreshAll();
  }, [refreshAll]);

  // ── Memoized Value ──────────────────────────────────────

  const value = useMemo<DatabaseContextValue>(
    () => ({
      isLoading,
      userPreferences,
      interests,
      marketPreferences,
      briefHistory,
      updateUserPreferences: updateUserPreferencesWrapped,
      addInterest: addInterestWrapped,
      removeInterest: removeInterestWrapped,
      updateMarketPreferences: updateMarketPreferencesWrapped,
      addBriefHistory: addBriefHistoryWrapped,
      refreshBriefHistory: loadBriefHistory,
      clearAllData: clearAllDataWrapped,
      refreshAll,
    }),
    [
      isLoading,
      userPreferences,
      interests,
      marketPreferences,
      briefHistory,
      updateUserPreferencesWrapped,
      addInterestWrapped,
      removeInterestWrapped,
      updateMarketPreferencesWrapped,
      addBriefHistoryWrapped,
      loadBriefHistory,
      clearAllDataWrapped,
      refreshAll,
    ],
  );

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────

export function useDatabaseContext(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error(
      'useDatabaseContext must be used within a <DatabaseProvider>',
    );
  }
  return ctx;
}
