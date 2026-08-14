export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  return next;
}

/** Monday-first week start. */
export function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const weekday = (next.getDay() + 6) % 7;
  return addDays(next, -weekday);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function dayKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Every local day touched by [start, end], inclusive. */
export function daysBetween(start: Date, end: Date): string[] {
  const keys: string[] = [];
  let cursor = startOfDay(start);
  const last = startOfDay(end);

  while (cursor.getTime() <= last.getTime()) {
    keys.push(dayKey(cursor));
    cursor = addDays(cursor, 1);
  }

  return keys;
}

/** Value for an <input type="datetime-local">, in the browser's local time. */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => `${value}`.padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

export function formatRange(start: Date, end: Date): string {
  if (isSameDay(start, end)) {
    return `${formatDate(start)} · ${formatTime(start)} – ${formatTime(end)}`;
  }
  return `${formatDateTime(start)} → ${formatDateTime(end)}`;
}

export function relativeDayLabel(date: Date, now: Date = new Date()): string {
  const diffDays = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / MS_PER_DAY,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
  return "";
}
