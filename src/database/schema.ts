// ─────────────────────────────────────────────────────────────
// Huxe AI — Database Schema & Type Definitions
// ─────────────────────────────────────────────────────────────

// ── Table Creation SQL ──────────────────────────────────────

export const CREATE_USER_PREFERENCES_TABLE = `
  CREATE TABLE IF NOT EXISTS UserPreferences (
    id INTEGER PRIMARY KEY DEFAULT 1,
    preferredName TEXT DEFAULT 'User',
    language TEXT DEFAULT 'en' CHECK(language IN ('en', 'kn')),
    voice1 TEXT DEFAULT 'Puck',
    voice2 TEXT DEFAULT 'Kore',
    updatedAt TEXT DEFAULT (datetime('now'))
  );
`;

export const CREATE_INTERESTS_TABLE = `
  CREATE TABLE IF NOT EXISTS Interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topicString TEXT NOT NULL UNIQUE,
    createdAt TEXT DEFAULT (datetime('now'))
  );
`;

export const CREATE_MARKET_PREFERENCES_TABLE = `
  CREATE TABLE IF NOT EXISTS MarketPreferences (
    id INTEGER PRIMARY KEY DEFAULT 1,
    usMarketEnabled INTEGER DEFAULT 1,
    indianMarketEnabled INTEGER DEFAULT 1
  );
`;

export const CREATE_BRIEF_HISTORY_TABLE = `
  CREATE TABLE IF NOT EXISTS BriefHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    generatedAt TEXT DEFAULT (datetime('now')),
    durationSeconds INTEGER,
    audioFilePath TEXT,
    briefDataJson TEXT,
    status TEXT DEFAULT 'completed'
  );
`;

export const CREATE_BRIEF_SCRIPTS_TABLE = `
  CREATE TABLE IF NOT EXISTS BriefScripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    historyId INTEGER,
    scriptJson TEXT NOT NULL,
    FOREIGN KEY(historyId) REFERENCES BriefHistory(id) ON DELETE CASCADE
  );
`;

// ── Default Seed Data ───────────────────────────────────────

export const INSERT_DEFAULT_PREFERENCES = `
  INSERT OR IGNORE INTO UserPreferences (id, preferredName) VALUES (1, 'User');
`;

export const INSERT_DEFAULT_MARKET_PREFS = `
  INSERT OR IGNORE INTO MarketPreferences (id) VALUES (1);
`;

export const DEFAULT_INTERESTS: readonly string[] = [
  'AI and deep tech',
  'Tech business and geopolitics',
  'Global and US markets',
  'Indian stock market',
  'Bengaluru and Karnataka news',
] as const;

// ── TypeScript Interfaces ───────────────────────────────────

export interface UserPreferences {
  id: number;
  preferredName: string;
  language: 'en' | 'kn';
  voice1: string;
  voice2: string;
  updatedAt: string;
}

export interface Interest {
  id: number;
  topicString: string;
  createdAt: string;
}

export interface MarketPreferences {
  id: number;
  usMarketEnabled: boolean;
  indianMarketEnabled: boolean;
}

export interface BriefHistory {
  id: number;
  generatedAt: string;
  durationSeconds: number | null;
  audioFilePath: string | null;
  briefDataJson: string | null;
  status: string;
}

export interface BriefScript {
  id: number;
  historyId: number;
  scriptJson: string;
}

// ── Raw DB row types (SQLite stores booleans as integers) ───

export interface MarketPreferencesRow {
  id: number;
  usMarketEnabled: number;
  indianMarketEnabled: number;
}

// ── Gemini TTS Voice Options ────────────────────────────────

export const GEMINI_VOICES = [
  'Achernar', 'Achird', 'Algenib', 'Algieba', 'Alnilam',
  'Aoede', 'Autonoe', 'Callirrhoe', 'Charon', 'Despina',
  'Enceladus', 'Erinome', 'Fenrir', 'Gacrux', 'Iapetus',
  'Kore', 'Laomedeia', 'Leda', 'Orus', 'Puck',
  'Pulcherrima', 'Rasalgethi', 'Sadachbia', 'Sadaltager', 'Schedar',
  'Sulafat', 'Umbriel', 'Vindemiatrix', 'Zephyr', 'Zubenelgenubi',
] as const;

export type GeminiVoice = (typeof GEMINI_VOICES)[number];
