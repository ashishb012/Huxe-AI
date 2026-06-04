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
 * Uses Newsdata.io API.
 */
export async function fetchNewsData(): Promise<NewsDataResult> {
  if (!API_KEY) {
    console.warn('Newsdata.io API key is missing. Returning mock data.');
    return getMockNews();
  }

  try {
    // Fetch top news (e.g. US/Global, English, top priority)
    const url = `${BASE_URL}?apikey=${API_KEY}&language=en&size=10`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    const articles = data.results || [];

    // Map the first 3 to "Headlines"
    const headlines: HeadlineItem[] = articles.slice(0, 3).map((article: any) => ({
      id: article.article_id,
      title: article.title,
      source: article.source_id,
      imageUrl: article.image_url || null,
      url: article.link,
    }));

    // Map the remaining as categorized interests
    // For a real app, we'd make multiple queries based on userPreferences
    const remaining = articles.slice(3, 8);
    const interests: InterestItem[] = [];

    if (remaining.length > 0) {
      interests.push({
        id: 'interest-news-1',
        topic: 'Top Stories',
        bullets: remaining.map((r: any) => r.title),
      });
    }

    return { headlines, interests };
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return getMockNews(); // Fallback on error
  }
}

function getMockNews(): NewsDataResult {
  return {
    headlines: [
      {
        id: 'headline-001',
        title: 'Markets rally on unexpected tech earnings surge',
        source: 'Global Finance',
        imageUrl: null,
        url: 'https://example.com/news/1',
      },
      {
        id: 'headline-002',
        title: 'New AI model breaks reasoning benchmarks',
        source: 'Tech Weekly',
        imageUrl: null,
        url: 'https://example.com/news/2',
      }
    ],
    interests: [
      {
        id: 'interest-001',
        topic: 'Technology',
        bullets: [
          'Major breakthrough in quantum error correction reported',
          'Regulators propose new framework for autonomous vehicles'
        ]
      }
    ]
  };
}
