// ── Date / time formatting helpers ─────────────────────────────────────────

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmtDate(d: string | number | Date): string {
  const date = new Date(d);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function fmtDateTime(d: string | number | Date): string {
  const date = new Date(d);
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${h}:${m} ${ap}`;
}

export function fmtTime12(hhmm: string | null | undefined): string {
  if (!hhmm) return '';
  const [hRaw, m] = hhmm.split(':').map(Number);
  let h = hRaw;
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

// Human duration: < 60 → "30 min"; otherwise "1 hr" / "1 hr 20 min"
export function fmtDuration(mins: number | null | undefined): string {
  const m = Math.max(0, Math.round(+(mins ?? 0)));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} hr ${rem} min` : `${h} hr`;
}

export function relTime(d: string | number | Date): string {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// today's weekday index (Mon=0 … Sun=6)
export function todayIdx(date: Date = new Date()): number {
  return (date.getDay() + 6) % 7;
}

export function minsNow(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function reminderMins(time: string): number {
  const [h, m] = (time || '00:00').split(':').map(Number);
  return h * 60 + m;
}

// ISO timestamp for today at a given minute-of-day
export function todayTsAt(min: number, date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(Math.floor(min / 60), min % 60, 0, 0);
  return d.toISOString();
}

// Timestamp for a weekday index (Mon=0) within the current week
export function weekdayTs(i: number, date: Date = new Date()): string {
  const d = new Date(date);
  const jsDay = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - (jsDay - i));
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

// Date-only (YYYY-MM-DD) for a weekday index (Mon=0) within the current week, in local time
export function weekdayDate(i: number, date: Date = new Date()): Date {
  const d = new Date(date);
  const jsDay = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - (jsDay - i));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function dateKey(d: Date | string): string {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
