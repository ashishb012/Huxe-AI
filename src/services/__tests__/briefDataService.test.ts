import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { generateDailyBrief } from '../briefDataService';
import * as connectedAccountsService from '../connectedAccountsService';
import * as calendarService from '../calendarService';
import * as gmailService from '../gmailService';
import * as newsService from '../newsService';

describe('briefDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    jest.spyOn(connectedAccountsService, 'getConnectedGoogleAccounts').mockResolvedValue([
      { name: 'Ashish', email: 'ashish@example.com', photoUrl: '', isPrimary: true, accessToken: 'mockToken' },
    ]);
  });

  it('should aggregate data from all services', async () => {
    jest.spyOn(calendarService, 'fetchTodayEvents').mockResolvedValue([{ id: '1', title: 'Meeting', start: '10:00' } as any]);
    jest.spyOn(gmailService, 'fetchRecentEmails').mockResolvedValue([{ id: '2', subject: 'Hello', from: 'Alice', isNewsletter: false } as any]);
    jest.spyOn(newsService, 'fetchNewsData').mockResolvedValue({ headlines: [], interests: [] });

    const brief = await generateDailyBrief('Ashish');

    expect(brief.calendar.length).toBe(1);
    expect(brief.emails.length).toBe(1);
  });

  it('includes emails and calendar events from every connected account', async () => {
    jest.spyOn(connectedAccountsService, 'getConnectedGoogleAccounts').mockResolvedValue([
      { name: 'Primary', email: 'primary@example.com', photoUrl: '', isPrimary: true, accessToken: 'primary-token' },
      { name: 'Work', email: 'work@example.com', photoUrl: '', isPrimary: false, accessToken: 'work-token' },
    ]);
    jest.spyOn(calendarService, 'fetchTodayEvents').mockImplementation(async token => [
      { id: 'event', title: token === 'primary-token' ? 'Personal' : 'Team', time: '09:00' } as any,
    ]);
    jest.spyOn(gmailService, 'fetchRecentEmails').mockImplementation(async token => [
      { id: 'message', subject: token === 'primary-token' ? 'Personal mail' : 'Work mail', from: 'Sender', isNewsletter: false } as any,
    ]);
    jest.spyOn(newsService, 'fetchNewsData').mockResolvedValue({ headlines: [], interests: [] });

    const brief = await generateDailyBrief('Ashish');

    expect(brief.calendar.map(event => event.accountEmail)).toEqual(['primary@example.com', 'work@example.com']);
    expect(brief.emails.map(email => email.accountEmail)).toEqual(['primary@example.com', 'work@example.com']);
  });

  it('should handle partial failures without crashing', async () => {
    jest.spyOn(calendarService, 'fetchTodayEvents').mockResolvedValue([]);
    jest.spyOn(newsService, 'fetchNewsData').mockRejectedValue(new Error('News API down'));
    jest.spyOn(gmailService, 'fetchRecentEmails').mockResolvedValue([]);

    const brief = await generateDailyBrief('Ashish');

    // News failed but brief still generated with empty headlines
    expect(brief.headlines).toEqual([]);
    expect(brief.greeting).toContain('Ashish');
  });

  it('should still generate brief when there are no connected accounts', async () => {
    jest.spyOn(connectedAccountsService, 'getConnectedGoogleAccounts').mockResolvedValue([]);
    jest.spyOn(newsService, 'fetchNewsData').mockResolvedValue({ headlines: [{ id: '1', title: 'Test', source: 'X', imageUrl: null, url: '' }], interests: [] });

    const brief = await generateDailyBrief('Ashish');

    // No accounts means email/calendar are empty, but news still works
    expect(brief.calendar).toEqual([]);
    expect(brief.emails).toEqual([]);
    expect(brief.headlines.length).toBe(1);
  });
});
