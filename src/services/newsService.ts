// ─────────────────────────────────────────────────────────────
// Huxe AI — News Service (Newsdata.io)
// ─────────────────────────────────────────────────────────────

import { HeadlineItem, InterestItem } from '../types/brief';

const API_KEY = process.env.EXPO_PUBLIC_NEWSDATA_API_KEY;
const BASE_URL = 'https://newsdata.io/api/1/latest';

export interface NewsDataResult {
  headlines: HeadlineItem[];
  interests: InterestItem[];
}

/**
 * Fetch top headlines and categorize them for the daily brief.
 * Uses Newsdata.io Latest News API.
 * @see https://newsdata.io/documentation/#latest-news
 */
export async function fetchNewsData(): Promise<NewsDataResult> {
  if (!API_KEY) {
    console.warn('[News] EXPO_PUBLIC_NEWSDATA_API_KEY is not set — skipping news');
    return { headlines: [], interests: [] };
  }

  const url = `${BASE_URL}?apikey=${API_KEY}&language=en&size=10`;
  console.log('[News] Fetching news from Newsdata.io...');

  const response = await fetch(url);

  if (!response.ok) {
    const errBody = await response.text();
    console.error(`[News] API error ${response.status}:`, errBody);
    throw new Error(`News API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();

  if (data.status !== 'success') {
    console.error('[News] Unexpected response status:', data.status, data.results?.message);
    throw new Error(`News API returned status: ${data.status}`);
  }

  const articles = data.results || [];
  console.log(`[News] Got ${articles.length} articles`);

  // Map the first 3 to "Headlines"
  const headlines: HeadlineItem[] = articles.slice(0, 3).map((article: any) => ({
    id: article.article_id || `news-${Math.random().toString(36).slice(2)}`,
    title: article.title || 'Untitled',
    source: article.source_id || article.source_name || 'Unknown',
    imageUrl: article.image_url || null,
    url: article.link || '',
  }));

  // Map the remaining as categorized interests
  const remaining = articles.slice(3, 8);
  const interests: InterestItem[] = [];

  if (remaining.length > 0) {
    interests.push({
      id: 'interest-news-1',
      topic: 'Top Stories',
      bullets: remaining.map((r: any) => r.title).filter(Boolean),
    });
  }

  console.log(`[News] Mapped ${headlines.length} headlines, ${interests.length} interest topics`);
  return { headlines, interests };
}
