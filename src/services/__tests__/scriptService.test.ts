import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { generatePodcastScript } from '../scriptService';
import { DailyBriefData } from '../../types/brief';

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Mock env variable
process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test-key';

describe('scriptService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  const mockBriefData: DailyBriefData = {
    date: '2026-06-04',
    greeting: 'Good morning',
    emails: [],
    newsletters: [],
    calendar: [],
    headlines: [],
    interests: [],
  };

  it('should successfully parse a valid Gemini API response', async () => {
    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  title: 'Test Podcast',
                  durationEstimate: '3 mins',
                  paragraphs: [
                    { speaker: 'Host', text: 'Welcome to the podcast' }
                  ]
                })
              }
            ]
          }
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGeminiResponse
    } as Response);

    const script = await generatePodcastScript(mockBriefData, 'Ashish');

    expect(script.title).toBe('Test Podcast');
    expect(script.paragraphs.length).toBe(1);
  });

  it('should throw on API error instead of falling back', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded'
    } as Response);

    await expect(generatePodcastScript(mockBriefData, 'Ashish'))
      .rejects.toThrow('Gemini Script API error 429');
  });

  it('should throw if no candidates returned', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [] })
    } as Response);

    await expect(generatePodcastScript(mockBriefData, 'Ashish'))
      .rejects.toThrow('no candidates');
  });
});
