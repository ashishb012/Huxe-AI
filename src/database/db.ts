// ─────────────────────────────────────────────────────────────
// Huxe AI — Database Access Layer (expo-sqlite async API)
// ─────────────────────────────────────────────────────────────

import * as SQLite from 'expo-sqlite';

import {
  CREATE_USER_PREFERENCES_TABLE,
  CREATE_INTERESTS_TABLE,
  CREATE_MARKET_PREFERENCES_TABLE,
  CREATE_BRIEF_HISTORY_TABLE,
  CREATE_BRIEF_SCRIPTS_TABLE,
  INSERT_DEFAULT_PREFERENCES,
  INSERT_DEFAULT_MARKET_PREFS,
  DEFAULT_INTERESTS,
  type UserPreferences,
  type Interest,
  type MarketPreferences,
  type MarketPreferencesRow,
  type BriefHistory,
  type BriefScript,
} from './schema';

// ── Database Singleton ──────────────────────────────────────

const DB_NAME = 'huxeai_v2.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

// ── Initialization ──────────────────────────────────────────

export async function initDatabase(): Promise<void> {
  const db = await getDb();

  // Enable WAL mode for better concurrent read/write performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Create tables
  await db.execAsync(CREATE_USER_PREFERENCES_TABLE);
  await db.execAsync(CREATE_INTERESTS_TABLE);
  await db.execAsync(CREATE_MARKET_PREFERENCES_TABLE);
  await db.execAsync(CREATE_BRIEF_HISTORY_TABLE);
  await db.execAsync(CREATE_BRIEF_SCRIPTS_TABLE);

  // Insert default rows
  await db.execAsync(INSERT_DEFAULT_PREFERENCES);
  await db.execAsync(INSERT_DEFAULT_MARKET_PREFS);

  // Seed default interests (skip duplicates via INSERT OR IGNORE)
  for (const topic of DEFAULT_INTERESTS) {
    await db.runAsync(
      'INSERT OR IGNORE INTO Interests (topicString) VALUES ($topic)',
      { $topic: topic }
    );
  }
}

// ── User Preferences ────────────────────────────────────────

export async function getUserPreferences(): Promise<UserPreferences> {
  const db = await getDb();
  const row = await db.getFirstAsync<UserPreferences>(
    'SELECT * FROM UserPreferences WHERE id = 1',
  );

  // Fallback if somehow missing
  if (!row) {
    return {
      id: 1,
      preferredName: 'User',
      language: 'en',
      voice1: 'Puck',
      voice2: 'Kore',
      updatedAt: new Date().toISOString(),
    };
  }

  return row;
}

export async function updateUserPreferences(
  prefs: Partial<Omit<UserPreferences, 'id'>>,
): Promise<void> {
  const db = await getDb();

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (prefs.preferredName !== undefined) {
    fields.push('preferredName = ?');
    values.push(prefs.preferredName);
  }
  if (prefs.language !== undefined) {
    fields.push('language = ?');
    values.push(prefs.language);
  }
  if (prefs.voice1 !== undefined) {
    fields.push('voice1 = ?');
    values.push(prefs.voice1);
  }
  if (prefs.voice2 !== undefined) {
    fields.push('voice2 = ?');
    values.push(prefs.voice2);
  }

  if (fields.length === 0) return;

  // Always touch the updatedAt timestamp
  fields.push("updatedAt = datetime('now')");

  await db.runAsync(
    `UPDATE UserPreferences SET ${fields.join(', ')} WHERE id = 1`,
    ...values,
  );
}

// ── Interests ───────────────────────────────────────────────

export async function getInterests(): Promise<Interest[]> {
  const db = await getDb();
  return db.getAllAsync<Interest>(
    'SELECT * FROM Interests ORDER BY createdAt ASC',
  );
}

export async function addInterest(topic: string): Promise<void> {
  const db = await getDb();
  const trimmed = topic.trim();
  if (!trimmed) return;

  await db.runAsync(
    'INSERT OR IGNORE INTO Interests (topicString) VALUES ($topic)',
    { $topic: trimmed }
  );
}

export async function removeInterest(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM Interests WHERE id = $id', { $id: id });
}

// ── Market Preferences ──────────────────────────────────────

export async function getMarketPreferences(): Promise<MarketPreferences> {
  const db = await getDb();
  const row = await db.getFirstAsync<MarketPreferencesRow>(
    'SELECT * FROM MarketPreferences WHERE id = 1',
  );

  if (!row) {
    return { id: 1, usMarketEnabled: true, indianMarketEnabled: true };
  }

  // Convert SQLite integer booleans → JS booleans
  return {
    id: row.id,
    usMarketEnabled: row.usMarketEnabled === 1,
    indianMarketEnabled: row.indianMarketEnabled === 1,
  };
}

export async function updateMarketPreferences(
  prefs: Partial<Omit<MarketPreferences, 'id'>>,
): Promise<void> {
  const db = await getDb();

  const fields: string[] = [];
  const values: number[] = [];

  if (prefs.usMarketEnabled !== undefined) {
    fields.push('usMarketEnabled = ?');
    values.push(prefs.usMarketEnabled ? 1 : 0);
  }
  if (prefs.indianMarketEnabled !== undefined) {
    fields.push('indianMarketEnabled = ?');
    values.push(prefs.indianMarketEnabled ? 1 : 0);
  }

  if (fields.length === 0) return;

  await db.runAsync(
    `UPDATE MarketPreferences SET ${fields.join(', ')} WHERE id = 1`,
    ...values,
  );
}

// ── Brief History ───────────────────────────────────────────

export async function addBriefHistory(
  durationSeconds: number,
  audioFilePath: string | null,
  briefDataJson: string,
): Promise<number> {
  const db = await getDb();
  // Using named parameters avoids the NullPointerException on Android 
  // when passing null through the varargs bridge.
  const result = await db.runAsync(
    'INSERT INTO BriefHistory (durationSeconds, audioFilePath, briefDataJson, status) VALUES ($duration, $audio, $json, $status)',
    {
      $duration: durationSeconds,
      $audio: audioFilePath,
      $json: briefDataJson,
      $status: 'completed'
    }
  );
  return result.lastInsertRowId;
}

export async function getBriefHistoryById(id: number): Promise<BriefHistory | null> {
  const db = await getDb();
  return db.getFirstAsync<BriefHistory>(
    'SELECT * FROM BriefHistory WHERE id = $id',
    { $id: id }
  );
}

export async function getRecentBriefs(
  limit: number = 20,
): Promise<BriefHistory[]> {
  const db = await getDb();
  return db.getAllAsync<BriefHistory>(
    'SELECT * FROM BriefHistory ORDER BY generatedAt DESC LIMIT $limit',
    { $limit: limit }
  );
}

// ── Brief Scripts ───────────────────────────────────────────

export async function addBriefScript(
  historyId: number,
  scriptJson: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO BriefScripts (historyId, scriptJson) VALUES ($historyId, $scriptJson)',
    {
      $historyId: historyId,
      $scriptJson: scriptJson
    }
  );
}

export async function getScriptForHistory(
  historyId: number,
): Promise<BriefScript | null> {
  const db = await getDb();
  return db.getFirstAsync<BriefScript>(
    'SELECT * FROM BriefScripts WHERE historyId = $historyId',
    { $historyId: historyId }
  );
}

// ── Danger Zone ─────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  const db = await getDb();

  await db.execAsync('DELETE FROM BriefScripts;');
  await db.execAsync('DELETE FROM BriefHistory;');
  await db.execAsync('DELETE FROM Interests;');
  await db.execAsync('DELETE FROM MarketPreferences;');
  await db.execAsync('DELETE FROM UserPreferences;');

  // Re-seed defaults so the app stays functional
  await db.execAsync(INSERT_DEFAULT_PREFERENCES);
  await db.execAsync(INSERT_DEFAULT_MARKET_PREFS);

  for (const topic of DEFAULT_INTERESTS) {
    await db.runAsync(
      'INSERT OR IGNORE INTO Interests (topicString) VALUES (?)',
      topic,
    );
  }
}
