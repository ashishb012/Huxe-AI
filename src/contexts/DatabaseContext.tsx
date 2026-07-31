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
  BriefHistory,
} from '../database/schema';

import {
  initDatabase,
  getUserPreferences,
  updateUserPreferences as dbUpdateUserPreferences,
  getInterests,
  addInterest as dbAddInterest,
  removeInterest as dbRemoveInterest,
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

  /** Recent brief history entries */
  briefHistory: BriefHistory[];

  // ── Mutations ──

  updateUserPreferences: (
    prefs: Partial<Omit<UserPreferences, 'id'>>,
  ) => Promise<void>;

  addInterest: (topic: string) => Promise<void>;

  removeInterest: (id: number) => Promise<void>;

  addBriefHistory: (
    durationSeconds: number,
    audioFilePath: string | null,
    briefDataJson: string,
  ) => Promise<number>;

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

  const loadBriefHistory = useCallback(async () => {
    const briefs = await getRecentBriefs(20);
    setBriefHistory(briefs);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadUserPreferences(),
      loadInterests(),
      loadBriefHistory(),
    ]);
  }, [loadUserPreferences, loadInterests, loadBriefHistory]);

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

  const addBriefHistoryWrapped = useCallback(
    async (
      durationSeconds: number,
      audioFilePath: string | null,
      briefDataJson: string,
    ) => {
      const id = await dbAddBriefHistory(
        durationSeconds,
        audioFilePath,
        briefDataJson,
      );
      await loadBriefHistory();
      return id;
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
      briefHistory,
      updateUserPreferences: updateUserPreferencesWrapped,
      addInterest: addInterestWrapped,
      removeInterest: removeInterestWrapped,
      addBriefHistory: addBriefHistoryWrapped,
      refreshBriefHistory: loadBriefHistory,
      clearAllData: clearAllDataWrapped,
      refreshAll,
    }),
    [
      isLoading,
      userPreferences,
      interests,
      briefHistory,
      updateUserPreferencesWrapped,
      addInterestWrapped,
      removeInterestWrapped,
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
