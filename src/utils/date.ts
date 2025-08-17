export function parseDateMaybe(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function daysUntil(dateStr?: string): number | null {
  const d = parseDateMaybe(dateStr ?? null);
  if (!d) return null;
  const now = new Date();
  const ms = d.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function monthKey(dateStr?: string): string | null {
  const d = parseDateMaybe(dateStr ?? null);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
