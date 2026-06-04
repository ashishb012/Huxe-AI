export interface EmailItem {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  isNewsletter: boolean;
}

export interface NewsletterItem {
  id: string;
  author: string;
  title: string;
  bullets: string[];
}

export interface HeadlineItem {
  id: string;
  title: string;
  source: string;
  imageUrl: string | null;
  url: string;
}

export interface InterestItem {
  id: string;
  topic: string;
  bullets: string[];
}

export interface MarketDataItem {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  location: string | null;
  isAllDay: boolean;
}

export interface DailyBriefData {
  greeting: string;
  date: string;
  calendar: CalendarEvent[];
  emails: EmailItem[];
  newsletters: NewsletterItem[];
  headlines: HeadlineItem[];
  interests: InterestItem[];
  markets: MarketDataItem[];
}
