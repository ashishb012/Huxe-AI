export interface EmailItem {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  isNewsletter: boolean;
  accountEmail?: string;
}

export interface NewsletterItem {
  id: string;
  author: string;
  title: string;
  bullets: string[];
  accountEmail?: string;
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

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  location: string | null;
  isAllDay: boolean;
  accountEmail?: string;
}

export interface DailyBriefData {
  greeting: string;
  date: string;
  calendar: CalendarEvent[];
  emails: EmailItem[];
  newsletters: NewsletterItem[];
  headlines: HeadlineItem[];
  interests: InterestItem[];
}
