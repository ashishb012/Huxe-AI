// ─────────────────────────────────────────────────────────────
// Huxe AI — Database Access Layer (expo-sqlite async API)
// ─────────────────────────────────────────────────────────────

import * as SQLite from 'expo-sqlite';

import {
  CREATE_USER_PREFERENCES_TABLE,
  CREATE_INTERESTS_TABLE,
  CREATE_BRIEF_HISTORY_TABLE,
  CREATE_BRIEF_SCRIPTS_TABLE,
  INSERT_DEFAULT_PREFERENCES,
  DEFAULT_INTERESTS,
  type UserPreferences,
  type Interest,
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
  await db.execAsync(CREATE_BRIEF_HISTORY_TABLE);
  await db.execAsync(CREATE_BRIEF_SCRIPTS_TABLE);

  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(UserPreferences)');
  const existingColumns = new Set(columns.map((column) => column.name));
  const migrations = [
    ['dailyBriefEnabled', 'ALTER TABLE UserPreferences ADD COLUMN dailyBriefEnabled INTEGER DEFAULT 0'],
    ['dailyBriefHour', 'ALTER TABLE UserPreferences ADD COLUMN dailyBriefHour INTEGER DEFAULT 8'],
    ['dailyBriefMinute', 'ALTER TABLE UserPreferences ADD COLUMN dailyBriefMinute INTEGER DEFAULT 0'],
    ['lastScheduledBriefDate', 'ALTER TABLE UserPreferences ADD COLUMN lastScheduledBriefDate TEXT'],
  ] as const;
  for (const [column, statement] of migrations) {
    if (!existingColumns.has(column)) await db.execAsync(statement);
  }

  // Insert default rows
  await db.execAsync(INSERT_DEFAULT_PREFERENCES);

  // Seed default interests (skip duplicates via INSERT OR IGNORE)
  for (const topic of DEFAULT_INTERESTS) {
    await db.runAsync(
      'INSERT OR IGNORE INTO Interests (topicString) VALUES (?)',
      topic,
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
      dailyBriefEnabled: 0,
      dailyBriefHour: 8,
      dailyBriefMinute: 0,
      lastScheduledBriefDate: null,
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
  if (prefs.dailyBriefEnabled !== undefined) {
    fields.push('dailyBriefEnabled = ?');
    values.push(prefs.dailyBriefEnabled);
  }
  if (prefs.dailyBriefHour !== undefined) {
    fields.push('dailyBriefHour = ?');
    values.push(prefs.dailyBriefHour);
  }
  if (prefs.dailyBriefMinute !== undefined) {
    fields.push('dailyBriefMinute = ?');
    values.push(prefs.dailyBriefMinute);
  }
  if (prefs.lastScheduledBriefDate !== undefined) {
    fields.push('lastScheduledBriefDate = ?');
    values.push(prefs.lastScheduledBriefDate ?? '');
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
    'INSERT OR IGNORE INTO Interests (topicString) VALUES (?)',
    trimmed,
  );
}

export async function removeInterest(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM Interests WHERE id = ?', id);
}

// ── Market Preferences ──────────────────────────────────────

// ── Brief History ───────────────────────────────────────────

export async function addBriefHistory(
  durationSeconds: number,
  audioFilePath: string | null,
  briefDataJson: string,
): Promise<number> {
  const db = await getDb();
  // Pass an empty string instead of null to prevent NativeDatabase.prepareAsync NullPointerException
  const result = await db.runAsync(
    'INSERT INTO BriefHistory (durationSeconds, audioFilePath, briefDataJson, status) VALUES (?, ?, ?, ?)',
    durationSeconds,
    audioFilePath || '', 
    briefDataJson,
    'completed',
  );
  return result.lastInsertRowId;
}

export async function updateBriefHistoryAudioPath(
  historyId: number,
  audioFilePath: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE BriefHistory SET audioFilePath = ? WHERE id = ?',
    audioFilePath,
    historyId,
  );
}

/** Keep the ten newest podcasts and return their audio files for cleanup. */
export async function pruneBriefHistory(maxBriefs: number = 10): Promise<string[]> {
  const db = await getDb();
  const expired = await db.getAllAsync<Pick<BriefHistory, 'id' | 'audioFilePath'>>(
    'SELECT id, audioFilePath FROM BriefHistory ORDER BY generatedAt DESC, id DESC LIMIT -1 OFFSET ?',
    maxBriefs,
  );
  if (expired.length === 0) return [];

  const ids = expired.map((brief) => brief.id);
  const placeholders = ids.map(() => '?').join(', ');
  await db.runAsync(`DELETE FROM BriefScripts WHERE historyId IN (${placeholders})`, ...ids);
  await db.runAsync(`DELETE FROM BriefHistory WHERE id IN (${placeholders})`, ...ids);
  return expired.map((brief) => brief.audioFilePath).filter((path): path is string => Boolean(path));
}

export async function getBriefHistoryById(id: number): Promise<BriefHistory | null> {
  const db = await getDb();
  return db.getFirstAsync<BriefHistory>(
    'SELECT * FROM BriefHistory WHERE id = ?',
    id,
  );
}

export async function getRecentBriefs(
  limit: number = 20,
): Promise<BriefHistory[]> {
  const db = await getDb();
  return db.getAllAsync<BriefHistory>(
    'SELECT * FROM BriefHistory ORDER BY generatedAt DESC LIMIT ?',
    limit,
  );
}

// ── Brief Scripts ───────────────────────────────────────────

export async function addBriefScript(
  historyId: number,
  scriptJson: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO BriefScripts (historyId, scriptJson) VALUES (?, ?)',
    historyId,
    scriptJson,
  );
}

export async function getScriptForHistory(
  historyId: number,
): Promise<BriefScript | null> {
  const db = await getDb();
  return db.getFirstAsync<BriefScript>(
    'SELECT * FROM BriefScripts WHERE historyId = ?',
    historyId,
  );
}

// ── Danger Zone ─────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  const db = await getDb();

  await db.execAsync('DELETE FROM BriefScripts;');
  await db.execAsync('DELETE FROM BriefHistory;');
  await db.execAsync('DELETE FROM Interests;');
  await db.execAsync('DELETE FROM UserPreferences;');

  // Re-seed defaults so the app stays functional
  await db.execAsync(INSERT_DEFAULT_PREFERENCES);

  for (const topic of DEFAULT_INTERESTS) {
    await db.runAsync(
      'INSERT OR IGNORE INTO Interests (topicString) VALUES (?)',
      topic,
    );
  }
}
