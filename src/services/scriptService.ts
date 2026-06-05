// ─────────────────────────────────────────────────────────────
// Huxe AI — AI Script Service
// ─────────────────────────────────────────────────────────────

import { DailyBriefData } from '../types/brief';

export interface ScriptParagraph {
  speaker: string;
  text: string;
}

export interface PodcastScript {
  title: string;
  durationEstimate: string;
  paragraphs: ScriptParagraph[];
}

/**
 * Generates a conversational podcast script from the user's daily data.
 * Uses Gemini 2.5 Flash for structured JSON output.
 */
export async function generatePodcastScript(
  briefData: DailyBriefData,
  userName: string,
  onProgress?: (status: string) => void
): Promise<PodcastScript> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set. Cannot generate script.');
  }

  if (onProgress) onProgress('Analyzing your daily data...');

  console.log('[Script] Starting script generation...');
  console.log('[Script] Brief data summary:', {
    calendar: briefData.calendar.length,
    emails: briefData.emails.length,
    newsletters: briefData.newsletters.length,
    headlines: briefData.headlines.length,
    interests: briefData.interests.length,
    markets: briefData.markets.length,
  });

  const prompt = `
    You are an AI podcast host generating a personalized morning brief.
    User's name: ${userName}
    Date: ${briefData.date}
    
    Here is their data for today:
    Emails & Newsletters: ${JSON.stringify(briefData.emails)} ${JSON.stringify(briefData.newsletters)}
    Calendar: ${JSON.stringify(briefData.calendar)}
    Headlines: ${JSON.stringify(briefData.headlines)}
    Markets: ${JSON.stringify(briefData.markets)}

    CRITICAL INSTRUCTIONS:
    - If the Calendar array is empty, explicitly mention that they have a free day or a clear schedule today.
    - If the Emails/Newsletters array is empty, mention that their inbox is clear and quiet this morning.
    - Focus heavily on the Headlines and Markets if personal data is light.
    - Create an engaging, NPR-style short podcast script. 
    - Use two speakers: "Host" and "Co-Host".
    - Keep it conversational, insightful, and concise (about 2-3 minutes spoken).
    - Respond strictly in JSON matching the following schema.
  `;

  try {
    if (onProgress) onProgress('Writing the podcast script...');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    console.log('[Script] Calling Gemini API...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              durationEstimate: { type: "STRING" },
              paragraphs: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    speaker: { type: "STRING" },
                    text: { type: "STRING" }
                  },
                  required: ["speaker", "text"]
                }
              }
            },
            required: ["title", "durationEstimate", "paragraphs"]
          }
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[Script] Gemini API error ${response.status}:`, errBody);
      throw new Error(`Gemini Script API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    console.log('[Script] Gemini response received, candidates:', data.candidates?.length);

    const candidate = data.candidates?.[0];
    if (!candidate) {
      console.error('[Script] No candidates in response:', JSON.stringify(data));
      throw new Error('Gemini returned no candidates for script generation');
    }

    const resultText = candidate.content?.parts?.[0]?.text;
    if (!resultText) {
      console.error('[Script] No text in candidate:', JSON.stringify(candidate));
      throw new Error('Gemini returned empty text for script generation');
    }

    const script: PodcastScript = JSON.parse(resultText);
    console.log(`[Script] Script generated: "${script.title}", ${script.paragraphs.length} paragraphs`);

    if (!script.paragraphs || script.paragraphs.length === 0) {
      throw new Error('Gemini returned a script with zero paragraphs');
    }

    return script;

  } catch (error) {
    console.error('[Script] Script generation failed:', error);
    throw error;
  }
}
