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
import { generateGreeting, formatDate } from '../mocks/briefData'; // Keep formatting helpers for now

/**
 * Orchestrates fetching from all real data sources.
 */
export async function generateDailyBrief(userName: string): Promise<DailyBriefData> {
  const brief: DailyBriefData = {
    greeting: generateGreeting(userName),
    date: formatDate(),
    calendar: [],
    emails: [],
    newsletters: [], // Usually a subset of emails, can filter later
    headlines: [],
    interests: [],
    markets: [],
  };

  try {
    const accessToken = await getFreshAccessToken();
    
    // We can run these in parallel to speed up the brief generation
    const [events, emails, news, markets] = await Promise.allSettled([
      fetchTodayEvents(accessToken),
      fetchRecentEmails(accessToken, 15),
      fetchNewsData(),
      fetchMarketData(),
    ]);

    if (events.status === 'fulfilled') {
      brief.calendar = events.value;
    }

    if (emails.status === 'fulfilled') {
      const allEmails = emails.value;
      brief.emails = allEmails.filter(e => !e.isNewsletter);
      brief.newsletters = allEmails
        .filter(e => e.isNewsletter)
        .map(e => ({
          id: `nl-${e.id}`,
          author: e.from,
          title: e.subject,
          bullets: [e.snippet], // AI will expand this later in Phase 4
        }));
    }

    if (news.status === 'fulfilled') {
      brief.headlines = news.value.headlines;
      brief.interests = news.value.interests;
    }

    if (markets.status === 'fulfilled') {
      brief.markets = markets.value;
    }

  } catch (error) {
    console.error('Error generating daily brief:', error);
    // Return partial brief if auth fails completely
  }

  return brief;
}
