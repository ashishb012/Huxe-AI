// ─────────────────────────────────────────────────────────────
// Huxe AI — AI Script Service
// ─────────────────────────────────────────────────────────────

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { DailyBriefData } from '../types/brief';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Fallback to fetch if the SDK has issues in React Native
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
 */
export async function generatePodcastScript(
  briefData: DailyBriefData,
  userName: string,
  onProgress?: (status: string) => void
): Promise<PodcastScript> {
  if (onProgress) onProgress('Analyzing your daily data...');

  const prompt = `
    You are an AI podcast host generating a personalized morning brief.
    User's name: ${userName}
    Date: ${briefData.date}
    
    Here is their data for today:
    Emails & Newsletters: ${JSON.stringify(briefData.emails)} ${JSON.stringify(briefData.newsletters)}
    Calendar: ${JSON.stringify(briefData.calendar)}
    Headlines: ${JSON.stringify(briefData.headlines)}
    Markets: ${JSON.stringify(briefData.markets)}

    Create an engaging, NPR-style short podcast script. 
    Use two speakers: "Host" and "Co-Host".
    Keep it conversational, insightful, and concise (about 2-3 minutes spoken).
    Respond strictly in JSON matching the following schema.
  `;

  try {
    if (onProgress) onProgress('Writing the podcast script...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
      const err = await response.text();
      throw new Error(`Gemini API Error: ${err}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const script: PodcastScript = JSON.parse(resultText);
    
    return script;

  } catch (error) {
    console.error('Failed to generate script:', error);
    // Fallback Mock Script
    return {
      title: "Your Morning Brief",
      durationEstimate: "2 mins",
      paragraphs: [
        { speaker: "Host", text: `Good morning ${userName}! Today is ${briefData.date}.` },
        { speaker: "Co-Host", text: "Let's dive right into your schedule." }
      ]
    };
  }
}
