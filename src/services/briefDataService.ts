// ─────────────────────────────────────────────────────────────
// Huxe AI — Brief Data Service
// Aggregates data from all APIs to create the DailyBriefData
// ─────────────────────────────────────────────────────────────

import { DailyBriefData } from '../types/brief';
import { fetchRecentEmails } from './gmailService';
import { fetchTodayEvents } from './calendarService';
import { fetchNewsData } from './newsService';
import { fetchMarketData } from './marketService';
import { getFreshAccessToken } from './authService';
import { generateGreeting, formatDate } from '../mocks/briefData';

/**
 * Orchestrates fetching from all real data sources.
 * Uses Promise.allSettled so that one failing API doesn't kill the entire brief.
 * The brief will still be generated with whatever data is available.
 */
export async function generateDailyBrief(userName: string): Promise<DailyBriefData> {
  const brief: DailyBriefData = {
    greeting: generateGreeting(userName),
    date: formatDate(),
    calendar: [],
    emails: [],
    newsletters: [],
    headlines: [],
    interests: [],
    markets: [],
  };

  console.log('[BriefData] Starting brief generation for:', userName);

  // Auth is critical — if this fails, we can't get emails or calendar
  let accessToken: string;
  try {
    accessToken = await getFreshAccessToken();
    console.log('[BriefData] Got fresh access token');
  } catch (error) {
    console.error('[BriefData] Auth failed — cannot fetch Gmail/Calendar:', error);
    // Continue without email/calendar; news and markets don't need auth
    accessToken = '';
  }

  // Fetch all data sources in parallel using allSettled
  // so one failure doesn't crash the others
  const [eventsResult, emailsResult, newsResult, marketsResult] = await Promise.allSettled([
    accessToken ? fetchTodayEvents(accessToken) : Promise.resolve([]),
    accessToken ? fetchRecentEmails(accessToken, 15) : Promise.resolve([]),
    fetchNewsData(),
    fetchMarketData(),
  ]);

  // ── Calendar ──
  if (eventsResult.status === 'fulfilled') {
    brief.calendar = eventsResult.value;
    console.log(`[BriefData] Calendar: ${brief.calendar.length} events`);
  } else {
    console.error('[BriefData] Calendar fetch failed:', eventsResult.reason);
  }

  // ── Emails ──
  if (emailsResult.status === 'fulfilled') {
    const allEmails = emailsResult.value;
    brief.emails = allEmails.filter(e => !e.isNewsletter);
    brief.newsletters = allEmails
      .filter(e => e.isNewsletter)
      .map(e => ({
        id: `nl-${e.id}`,
        author: e.from,
        title: e.subject,
        bullets: [e.snippet],
      }));
    console.log(`[BriefData] Emails: ${brief.emails.length} regular, ${brief.newsletters.length} newsletters`);
  } else {
    console.error('[BriefData] Email fetch failed:', emailsResult.reason);
  }

  // ── News ──
  if (newsResult.status === 'fulfilled') {
    brief.headlines = newsResult.value.headlines;
    brief.interests = newsResult.value.interests;
    console.log(`[BriefData] News: ${brief.headlines.length} headlines, ${brief.interests.length} interest topics`);
  } else {
    console.error('[BriefData] News fetch failed:', newsResult.reason);
  }

  // ── Markets ──
  if (marketsResult.status === 'fulfilled') {
    brief.markets = marketsResult.value;
    console.log(`[BriefData] Markets: ${brief.markets.length} indices`);
  } else {
    console.error('[BriefData] Market fetch failed:', marketsResult.reason);
  }

  // Summary log
  const totalDataPoints = brief.calendar.length + brief.emails.length + brief.newsletters.length +
    brief.headlines.length + brief.interests.length + brief.markets.length;
  console.log(`[BriefData] Brief assembled with ${totalDataPoints} total data points`);

  return brief;
}
