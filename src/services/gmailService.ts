// ─────────────────────────────────────────────────────────────
// Huxe AI — Gmail Service
// ─────────────────────────────────────────────────────────────

import { EmailItem } from '../types/brief';

/**
 * Fetch the user's recent emails using the Gmail REST API.
 * 
 * @param accessToken The Google OAuth access token
 * @param maxResults Number of messages to retrieve
 * @returns Array of EmailItem objects
 */
export async function fetchRecentEmails(
  accessToken: string,
  maxResults: number = 10
): Promise<EmailItem[]> {
  try {
    // 1. Fetch message IDs from the last 24 hours
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=newer_than:1d&maxResults=${maxResults}`;
    const listResponse = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!listResponse.ok) {
      const errTxt = await listResponse.text();
      throw new Error(`Gmail API error: ${listResponse.status} ${errTxt}`);
    }

    const listData = await listResponse.json();
    const messages = listData.messages || [];

    if (messages.length === 0) {
      return [];
    }

    // 2. Fetch full metadata for each message
    const emailPromises = messages.map(async (msg: { id: string }) => {
      const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date&metadataHeaders=List-Unsubscribe`;
      const msgResponse = await fetch(msgUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!msgResponse.ok) return null;

      const msgData = await msgResponse.json();
      const headers = msgData.payload.headers || [];

      let subject = '(No Subject)';
      let from = 'Unknown Sender';
      let isNewsletter = false;

      headers.forEach((h: any) => {
        if (h.name.toLowerCase() === 'subject') subject = h.value;
        if (h.name.toLowerCase() === 'from') {
          // Extract just the name if formatted as "Name <email>"
          const match = h.value.match(/^"?([^"<]+)"?s*</);
          from = match ? match[1].trim() : h.value;
        }
        if (h.name.toLowerCase() === 'list-unsubscribe') isNewsletter = true;
      });

      return {
        id: msg.id,
        subject,
        from,
        snippet: msgData.snippet || 'No preview available',
        isNewsletter,
      } as EmailItem;
    });

    const results = await Promise.all(emailPromises);
    return results.filter((item): item is EmailItem => item !== null);

  } catch (error) {
    console.error('Failed to fetch recent emails:', error);
    throw error;
  }
}
