// ─────────────────────────────────────────────────────────────
// Huxe AI — Calendar Service
// ─────────────────────────────────────────────────────────────

import { CalendarEvent } from '../types/brief';

/**
 * Fetch the user's upcoming events for today using the Google Calendar REST API.
 * 
 * @param accessToken The Google OAuth access token
 * @returns Array of CalendarEvent objects
 */
export async function fetchTodayEvents(
  accessToken: string
): Promise<CalendarEvent[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.toISOString();
    
    const endOfDayDate = new Date(today);
    endOfDayDate.setHours(23, 59, 59, 999);
    const endOfDay = endOfDayDate.toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Calendar API error: ${response.status} ${errTxt}`);
    }

    const data = await response.json();
    const items = data.items || [];

    return items.map((item: any) => {
      // Determine if it's an all day event
      const isAllDay = !!item.start.date;
      
      let timeString = 'All Day';
      if (!isAllDay) {
        const startDate = new Date(item.start.dateTime);
        timeString = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      return {
        id: item.id,
        title: item.summary || 'Untitled Event',
        time: timeString,
        location: item.location || null,
        isAllDay,
      } as CalendarEvent;
    });

  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    throw error;
  }
}
