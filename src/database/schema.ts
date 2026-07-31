// ─────────────────────────────────────────────────────────────
// Huxe AI — Database Schema & Type Definitions
// ─────────────────────────────────────────────────────────────

// ── Table Creation SQL ──────────────────────────────────────

export const CREATE_USER_PREFERENCES_TABLE = `
  CREATE TABLE IF NOT EXISTS UserPreferences (
    id INTEGER PRIMARY KEY DEFAULT 1,
    preferredName TEXT DEFAULT 'User',
    language TEXT DEFAULT 'en' CHECK(language IN ('en', 'kn')),
    voice1 TEXT DEFAULT 'Autonoe',
    voice2 TEXT DEFAULT 'Orus',
    dailyBriefEnabled INTEGER DEFAULT 0,
    dailyBriefHour INTEGER DEFAULT 8,
    dailyBriefMinute INTEGER DEFAULT 0,
    lastScheduledBriefDate TEXT,
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

export const DEFAULT_INTERESTS: readonly string[] = [
  'AI and deep tech',
  'Tech business and geopolitics',
  'Bengaluru and Karnataka news',
] as const;

// ── TypeScript Interfaces ───────────────────────────────────

export interface UserPreferences {
  id: number;
  preferredName: string;
  language: 'en' | 'kn';
  voice1: string;
  voice2: string;
  dailyBriefEnabled: number;
  dailyBriefHour: number;
  dailyBriefMinute: number;
  lastScheduledBriefDate: string | null;
  updatedAt: string;
}

export interface Interest {
  id: number;
  topicString: string;
  createdAt: string;
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

// ── Gemini TTS Voice Options ────────────────────────────────

// All Gemini 2.0 TTS Voices available

// export const GEMINI_VOICES = [
//   'Achernar', 'Achird', 'Algenib', 'Algieba', 'Alnilam',
//   'Aoede', 'Autonoe', 'Callirrhoe', 'Charon', 'Despina',
//   'Enceladus', 'Erinome', 'Fenrir', 'Gacrux', 'Iapetus',
//   'Kore', 'Laomedeia', 'Leda', 'Orus', 'Puck',
//   'Pulcherrima', 'Rasalgethi', 'Sadachbia', 'Sadaltager', 'Schedar',
//   'Sulafat', 'Umbriel', 'Vindemiatrix', 'Zephyr', 'Zubenelgenubi',
// ] as const;

// Selected Gemini 2.0 TTS Voices 
export const GEMINI_VOICES = [
  'Achernar', 'Algieba', 'Alnilam', 'Aoede',
  'Autonoe', 'Callirrhoe', 'Despina',
  'Enceladus', 'Erinome', 'Fenrir', 'Gacrux', 'Iapetus',
  'Kore', 'Laomedeia', 'Leda', 'Orus',
  'Sadaltager', 'Schedar',
  'Sulafat', 'Umbriel', 'Vindemiatrix', 'Zephyr',
] as const;

//  Autonoe  Aoede
//  Orus Erinome Zephyr

export type GeminiVoice = (typeof GEMINI_VOICES)[number];
