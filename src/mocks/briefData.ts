// ─────────────────────────────────────────────────────────────
// Huxe AI – Daily Brief Mock Data
// ─────────────────────────────────────────────────────────────

import {
  EmailItem,
  NewsletterItem,
  HeadlineItem,
  InterestItem,
  MarketDataItem,
  CalendarEvent,
  DailyBriefData,
} from '../types/brief';

// ── Mock Data Arrays ─────────────────────────────────────────

export const mockEmails: EmailItem[] = [
  {
    id: 'email-001',
    subject: "Why everything is 'fine' until it's  too late",
    from: 'Tech with Soleyman',
    snippet:
      'This newsletter nudges you away from AWS-weekend-tutorial comfort zones toward real, project-based cloud and DevOps work. It also unpacks the latest market data for Cloud and SRE roles, showing where demand is surging and which certifications actually move the needle for hiring managers.',
    isNewsletter: true,
  },
  {
    id: 'email-002',
    subject: 'not x but y',
    from: 'Vaibhav Sisinty',
    snippet:
      'Vaibhav breaks down counter-intuitive LinkedIn growth strategies that actually work in 2026. The core idea: stop optimizing for impressions and start engineering for meaningful replies—because the algorithm now rewards conversation depth over raw reach.',
    isNewsletter: true,
  },
  {
    id: 'email-003',
    subject: '🚀 Build, Learn, Ship: Your weekly dev digest',
    from: 'GitHub Education',
    snippet:
      "This week's digest spotlights trending open- source contributions and highlights new student developer programs.It also features a curated list of 'good first issues' across popular repos to help newcomers land their first merged PR.",
    isNewsletter: false,
  },
];

export const mockNewsletters: NewsletterItem[] = [
  {
    id: 'newsletter-001',
    author: 'Neo Kim',
    title: 'How to get ahead of 99% of software engineers with AI agents',
    bullets: [
      'AI agents are being embedded across the entire SDLC—from ticket triage to code review to deployment monitoring—reducing cycle times by up to 40 %.',
      'Rules files like CLAUDE.md and COPILOT.md are becoming the new "coding standards" docs, letting teams encode architectural intent directly into their AI pair programmers.',
      'Companies are restructuring hiring around AI-fluency: candidates who can orchestrate agents effectively are out-competing those with twice the raw coding experience.',
      'The author predicts that within 18 months, shipping without an AI agent pipeline will feel as outdated as deploying without CI/CD.',
    ],
  },
  {
    id: 'newsletter-002',
    author: 'Nithin Kamath',
    title: 'India needs a fertiliser security plan',
    bullets: [
      'India imports nearly 40 % of its fertiliser requirement, leaving food production dangerously exposed to global supply-chain shocks and geopolitical tensions.',
      'The current subsidy regime masks the true cost and discourages domestic manufacturing investment, creating a vicious cycle of dependency.',
      'Kamath proposes a three-pronged policy: strategic reserves modeled on petroleum stockpiling, incentives for nano-fertiliser R&D, and phased subsidy reform tied to soil-health outcomes.',
    ],
  },
];

export const mockHeadlines: HeadlineItem[] = [
  {
    id: 'headline-001',
    title:
      'AI coding startup Cognition raises $1B at $2.5B pre-money valuation',
    source: 'TechCrunch',
    imageUrl: null,
    url: 'https://techcrunch.com/2026/05/29/cognition-raises-1b',
  },
  {
    id: 'headline-002',
    title: 'Robinhood now lets your AI agents trade stocks',
    source: 'TechCrunch',
    imageUrl: null,
    url: 'https://techcrunch.com/2026/05/29/robinhood-ai-agents-trading',
  },
  {
    id: 'headline-003',
    title:
      'S&P 500 futures decline as Wall Street awaits key April inflation reading: Live updates',
    source: 'CNBC',
    imageUrl: null,
    url: 'https://cnbc.com/2026/05/30/sp500-futures-inflation',
  },
];

export const mockInterests: InterestItem[] = [
  {
    id: 'interest-001',
    topic: 'AI and deep tech',
    bullets: [
      "OpenAI shipped GPT-5 Turbo with a 1 M-token context window and native tool-use, while Anthropic's Claude 4 Opus topped every major reasoning benchmark this week.",
      'NVIDIA reported that global AI-compute demand grew 3.2× year-over-year, with inference workloads now outpacing training for the first time.',
      'Google DeepMind open-sourced a lightweight multimodal model optimised for on-device deployment, sparking a wave of edge-AI startups.',
      'The EU\'s AI Act enforcement began its first phase, requiring "high-risk" model providers to publish transparency reports by Q3 2026.',
    ],
  },
  {
    id: 'interest-002',
    topic: 'Tech business and geopolitics',
    bullets: [
      'The US Commerce Department tightened export controls on advanced chip-packaging equipment, closing a loophole that let Chinese fabs access cutting-edge 3-nm tooling.',
      'TSMC announced a third Arizona fab with $20 B in fresh investment, partly funded by new CHIPS Act incentives tied to domestic workforce quotas.',
      "China's Huawei launched a homegrown EDA platform, signaling a long - term push for semiconductor self- sufficiency despite slower performance benchmarks.",
    ],
  },
  {
    id: 'interest-003',
    topic: 'Global and US markets',
    bullets: [
      'The S&P 500 closed at 5,304.72, up 0.45 %, buoyed by strong enterprise earnings from cloud and cybersecurity firms.',
      'NASDAQ gained 0.62 % as mega-cap tech rallied on better-than-expected ad-revenue guidance from Meta and Alphabet.',
      'Treasury yields dipped after softer-than-anticipated jobless claims data revived hopes of a September rate cut.',
    ],
  },
  {
    id: 'interest-004',
    topic: 'Indian stock market',
    bullets: [
      'NIFTY 50 advanced 0.38 % to 24,834.85, led by gains in IT and banking heavyweights after RBI held rates steady as expected.',
      'SENSEX added 0.41 % to close at 81,721.03, its fifth consecutive session of gains and a fresh 3-month high.',
      'Foreign portfolio investors turned net buyers for the first time in six sessions, injecting ₹2,140 crore into Indian equities.',
    ],
  },
  {
    id: 'interest-005',
    topic: 'Bengaluru and Karnataka news',
    bullets: [
      "The Karnataka government approved a 60 % minimum-wage hike for unorganised-sector workers, the largest single revision in the state's history.",
      'Hospitality industry bodies in Bengaluru called for a review of the new service-charge guidelines, citing potential revenue losses during peak tourist season.',
      'Bengaluru police busted a ₹300-crore cyber-fraud ring operating out of Whitefield, arresting 12 suspects linked to pan-India phishing campaigns.',
      'Udupi district authorities filed charges in a land-encroachment case involving coastal wetlands, drawing attention from environmental groups.',
    ],
  },
];

export const mockMarkets: MarketDataItem[] = [
  {
    symbol: 'SPX',
    name: 'S&P 500',
    value: 5304.72,
    change: 23.76,
    changePercent: 0.45,
    isPositive: true,
  },
  {
    symbol: 'IXIC',
    name: 'NASDAQ',
    value: 16831.48,
    change: 103.71,
    changePercent: 0.62,
    isPositive: true,
  },
  {
    symbol: 'NIFTY',
    name: 'NIFTY 50',
    value: 24834.85,
    change: 93.87,
    changePercent: 0.38,
    isPositive: true,
  },
  {
    symbol: 'SENSEX',
    name: 'SENSEX',
    value: 81721.03,
    change: 333.45,
    changePercent: 0.41,
    isPositive: true,
  },
];

export const mockCalendar: CalendarEvent[] = [
  {
    id: 'cal-001',
    title: 'Team Standup',
    time: '9:30 AM',
    location: 'Google Meet',
    isAllDay: false,
  },
  {
    id: 'cal-002',
    title: 'Design Review - Huxe AI',
    time: '2:00 PM',
    location: 'Conference Room B',
    isAllDay: false,
  },
  {
    id: 'cal-003',
    title: 'Gym Session',
    time: '6:00 PM',
    location: null,
    isAllDay: false,
  },
];

// ── Helper Functions ─────────────────────────────────────────

/**
 * Returns a time-of-day greeting for the given name.
 * - 05:00 – 11:59 → Good Morning
 * - 12:00 – 16:59 → Good Afternoon
 * - 17:00 – 04:59 → Good Evening
 */
export function generateGreeting(name: string): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return `Good Morning, ${name}`;
  }
  if (hour >= 12 && hour < 17) {
    return `Good Afternoon, ${name}`;
  }
  return `Good Evening, ${name}`;
}

/**
 * Returns today's date formatted like "Thursday, May 30".
 */
export function formatDate(): string {
  const now = new Date();

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ] as const;

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ] as const;

  const dayName = dayNames[now.getDay()];
  const monthName = monthNames[now.getMonth()];
  const dayOfMonth = now.getDate();

  return `${dayName}, ${monthName} ${dayOfMonth}`;
}

// ── Composite Mock Brief ─────────────────────────────────────

/**
 * Returns a fully-assembled `DailyBriefData` object ready for
 * consumption by the player screen.
 */
export function getMockDailyBrief(userName: string = 'Ashish'): DailyBriefData {
  return {
    greeting: generateGreeting(userName),
    date: formatDate(),
    calendar: mockCalendar,
    emails: mockEmails,
    newsletters: mockNewsletters,
    headlines: mockHeadlines,
    interests: mockInterests,
    markets: mockMarkets,
  };
}
