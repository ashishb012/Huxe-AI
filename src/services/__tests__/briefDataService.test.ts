import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { generateDailyBrief } from '../briefDataService';
import * as authService from '../authService';
import * as calendarService from '../calendarService';
import * as gmailService from '../gmailService';
import * as newsService from '../newsService';
import * as marketService from '../marketService';

describe('briefDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    jest.spyOn(authService, 'getFreshAccessToken').mockResolvedValue('mockToken');
  });

  it('should aggregate data from all services', async () => {
    jest.spyOn(calendarService, 'fetchTodayEvents').mockResolvedValue([{ id: '1', title: 'Meeting', start: '10:00' } as any]);
    jest.spyOn(gmailService, 'fetchRecentEmails').mockResolvedValue([{ id: '2', subject: 'Hello', from: 'Alice', isNewsletter: false } as any]);
    jest.spyOn(newsService, 'fetchNewsData').mockResolvedValue({ headlines: [], interests: [] });
    jest.spyOn(marketService, 'fetchMarketData').mockResolvedValue([]);

    const brief = await generateDailyBrief('Ashish');

    expect(brief.calendar.length).toBe(1);
    expect(brief.emails.length).toBe(1);
  });

  it('should handle partial failures without crashing', async () => {
    jest.spyOn(calendarService, 'fetchTodayEvents').mockResolvedValue([]);
    jest.spyOn(newsService, 'fetchNewsData').mockRejectedValue(new Error('News API down'));
    jest.spyOn(gmailService, 'fetchRecentEmails').mockResolvedValue([]);
    jest.spyOn(marketService, 'fetchMarketData').mockResolvedValue([]);

    const brief = await generateDailyBrief('Ashish');

    // News failed but brief still generated with empty headlines
    expect(brief.headlines).toEqual([]);
    expect(brief.greeting).toContain('Ashish');
  });

  it('should still generate brief even if auth fails', async () => {
    jest.spyOn(authService, 'getFreshAccessToken').mockRejectedValue(new Error('Auth failed'));
    jest.spyOn(newsService, 'fetchNewsData').mockResolvedValue({ headlines: [{ id: '1', title: 'Test', source: 'X', imageUrl: null, url: '' }], interests: [] });
    jest.spyOn(marketService, 'fetchMarketData').mockResolvedValue([]);

    const brief = await generateDailyBrief('Ashish');

    // Auth failed so email/calendar are empty, but news/markets still work
    expect(brief.calendar).toEqual([]);
    expect(brief.emails).toEqual([]);
    expect(brief.headlines.length).toBe(1);
  });
});
