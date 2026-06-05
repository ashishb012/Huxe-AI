// ─────────────────────────────────────────────────────────────
// Huxe AI — Brief Formatting Helpers
// ─────────────────────────────────────────────────────────────

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
