import { DailyBriefData } from '../types/brief';
import { fetchRecentEmails } from './gmailService';
import { fetchTodayEvents } from './calendarService';
import { fetchNewsData } from './newsService';
import { getConnectedGoogleAccounts } from './connectedAccountsService';
import { generateGreeting, formatDate } from '../mocks/briefData';

/** Builds a brief from every connected Google account plus the news sources. */
export async function generateDailyBrief(userName: string): Promise<DailyBriefData> {
  const brief: DailyBriefData = {
    greeting: generateGreeting(userName), date: formatDate(), calendar: [], emails: [],
    newsletters: [], headlines: [], interests: [],
  };

  let accounts = [] as Awaited<ReturnType<typeof getConnectedGoogleAccounts>>;
  try {
    accounts = await getConnectedGoogleAccounts();
  } catch (error) {
    console.error('[BriefData] Could not load connected Google accounts:', error);
  }

  const [accountResults, newsResult] = await Promise.all([
    Promise.allSettled(accounts.map(async account => {
      const [calendar, emails] = await Promise.all([
        fetchTodayEvents(account.accessToken),
        fetchRecentEmails(account.accessToken, 15),
      ]);
      return { account, calendar, emails };
    })),
    Promise.allSettled([fetchNewsData()]),
  ]);

  const allEmails = accountResults.flatMap(result => {
    if (result.status === 'rejected') {
      console.error('[BriefData] Google account fetch failed:', result.reason);
      return [];
    }
    const { account, calendar, emails } = result.value;
    brief.calendar.push(...calendar.map(event => ({
      ...event, id: `${account.email}:${event.id}`, accountEmail: account.email,
    })));
    return emails.map(email => ({
      ...email, id: `${account.email}:${email.id}`, accountEmail: account.email,
    }));
  });

  brief.emails = allEmails.filter(email => !email.isNewsletter);
  brief.newsletters = allEmails.filter(email => email.isNewsletter).map(email => ({
    id: `nl-${email.id}`, author: email.from, title: email.subject, bullets: [email.snippet], accountEmail: email.accountEmail,
  }));

  if (newsResult[0].status === 'fulfilled') {
    brief.headlines = newsResult[0].value.headlines;
    brief.interests = newsResult[0].value.interests;
  } else {
    console.error('[BriefData] News fetch failed:', newsResult[0].reason);
  }
  console.log(`[BriefData] ${accounts.length} account(s): ${brief.calendar.length} events, ${brief.emails.length} emails, ${brief.newsletters.length} newsletters`);
  return brief;
}
