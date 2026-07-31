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
  language: 'en' | 'kn' = 'en',
  onProgress?: (status: string) => void
): Promise<PodcastScript> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set. Cannot generate script.');
  }

  if (onProgress) onProgress('Analyzing your daily data...');

  const isKannada = language === 'kn';
  const languageName = isKannada ? 'Kannada' : 'English';

  console.log('[Script] Starting script generation...');
  console.log('[Script] Language:', languageName);
  console.log('[Script] Brief data summary:', {
    calendar: briefData.calendar.length,
    emails: briefData.emails.length,
    newsletters: briefData.newsletters.length,
    headlines: briefData.headlines.length,
    interests: briefData.interests.length,
  });

  // Language-specific instructions injected into the prompt
  const languageInstruction = isKannada
    ? `
LANGUAGE REQUIREMENT (CRITICAL — STRICTLY ENFORCED):
- You MUST write the ENTIRE podcast dialogue in Natural Spoken Kannada (ಕನ್ನಡ) using the Kannada script.
- Every single word spoken by Host and Co-Host MUST be in Kannada or Eng-Kan Natural spoken language.
- The title field MUST also be in Kannada.
- Keep proper nouns, brand names, app names, and people's names in their original English form (e.g., "Google", "Gemini", "${userName}").
- Translate all other English content — email subjects, newsletter summaries, headlines, calendar event descriptions — into natural, conversational Kannada or Eng-Kan.
- Use a warm, everyday spoken Kannada tone (ಆಡುಮಾತಿನ ಶೈಲಿ), not formal literary Kannada.
- Technical terms may be kept in English if there is no commonly used Kannada equivalent, but the surrounding sentence must be in Kannada.
`
    : `
LANGUAGE REQUIREMENT:
- Write the entire podcast dialogue in English.
`;

  const prompt = `
You are creating a personalized, two-person morning-news podcast for ${userName} on ${briefData.date}.
${languageInstruction}
SOURCE DATA (use only these facts; do not invent details, prices, dates, quotes, or links):
Emails: ${JSON.stringify(briefData.emails)}
Newsletters: ${JSON.stringify(briefData.newsletters)}
Calendar: ${JSON.stringify(briefData.calendar)}
Headlines: ${JSON.stringify(briefData.headlines)}

YOUR JOB:
Write a warm, natural, NPR-style conversation between "Host" and "Co-Host" in ${languageName}. The finished script must be 1,500-2,000 spoken words (roughly 10-15 minutes at a natural podcast pace), excluding the title and speaker labels. Aim for 30-45 alternating turns, with each turn usually 25-70 words. Do not compress the entire brief into a few short paragraphs.

EDITORIAL APPROACH:
- Open with a brief welcome and a clear preview of what matters this morning. Close with a useful, human sign-off.
- Cover the day in a thoughtful flow: inbox and newsletters, calendar, then major news. Adapt the balance to the available data, but do not pad with generic filler.
- Treat emails and newsletters as material to explain, not merely items to list. For each substantive item, say who it is from, what it is about, the important details present in the source data, why it may matter, and any sensible next step when supported by the data.
- When an item includes an accountEmail, mention the account naturally when it helps distinguish information from multiple inboxes or calendars.
- Give newsletters especially careful treatment. Expand their bullets into a coherent spoken explanation: explain the main thesis, connect the important points, add context only when it is directly supported by the supplied text, and make clear why the reader should care. For technical newsletters, translate jargon into plain language without losing the actual substance. Spend extra time on Cloud, Cloud Security, Cyber Security, System Design, AI, AI Security related emails/newsletters. 
- Cover the most meaningful headlines with more than a one-sentence summary. Explain what happened, why it matters, and—only when grounded in the supplied headline—what to watch next. Attribute each headline to its source when available.
- If Calendar is empty, explicitly and naturally note that the schedule is clear. If both Emails and Newsletters are empty, say the inbox is quiet. If a section has no data, transition past it gracefully instead of fabricating coverage.

CONVERSATION AND TRANSITIONS:
- Make both speakers contribute insightfully. They should react to one another, ask occasional genuine follow-up questions, clarify points, and avoid repeating the same information.
- Every section change needs a thoughtful, conversational bridge that connects the preceding topic to the next one. Do not use abrupt labels such as "Next up" or "Moving on" as the only transition.
- Vary sentence length and phrasing so it sounds spoken, not like a report being read aloud. Use clear, accessible language and a calm, intelligent tone.

OUTPUT REQUIREMENTS:
- Return only valid JSON matching the provided schema—no Markdown, notes, or code fences.
- Use only "Host" and "Co-Host" as speaker values.
- Set durationEstimate to "8-12 minutes".
- REMINDER: All text content in the "text" and "title" fields MUST be in ${languageName}.
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
          // A 8-12 minute, structured dialogue needs substantially more room than
          // the provider default, especially once serialized as JSON.
          // 16384 tokens accommodates heavy data days (10+ newsletters, many headlines).
          maxOutputTokens: 16384,
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

    // Check if the response was truncated due to hitting the token limit
    const finishReason = candidate.finishReason;
    if (finishReason === 'MAX_TOKENS') {
      console.error('[Script] Response was truncated (MAX_TOKENS). Increase maxOutputTokens.');
      throw new Error('Gemini script was truncated — the podcast data was too long. Try reducing the number of newsletters/emails or increase the token limit.');
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
