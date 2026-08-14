const CALENDAR_BASE_URL = 'https://calendar.dayflow.studio';
const PRO_BASE_URL = 'https://pro.dayflow.studio';
const SCHEDULER_BASE_URL = 'https://scheduler.dayflow.studio';

function ecosystemUrl(baseUrl: string, content: string): string {
  const params = new URLSearchParams({
    utm_source: 'blossom.dayflow.studio',
    utm_medium: 'referral',
    utm_content: content,
  });

  return `${baseUrl}/?${params.toString()}`;
}

export function calendarUrl(content: string): string {
  return ecosystemUrl(CALENDAR_BASE_URL, content);
}

export function proUrl(content: string): string {
  return ecosystemUrl(PRO_BASE_URL, content);
}

export function schedulerUrl(content: string): string {
  return ecosystemUrl(SCHEDULER_BASE_URL, content);
}
