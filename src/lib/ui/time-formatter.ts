/**
 * Formats a duration in decimal hours (e.g. 1.71, 3.09, 8.5) into a clean,
 * standard human-readable time string: `Xh Ym` (e.g. `1h 43m`, `3h 05m`, `8h 30m`).
 */
export function formatWorkedHours(hours: number): string {
  if (hours === undefined || hours === null || isNaN(hours) || hours <= 0) {
    return "0h 00m";
  }
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m < 10 ? "0" : ""}${m}m`;
}

/**
 * Calculates exact worked hours as decimal hours from formatted time strings
 * e.g., ("09:48 AM", "06:55 PM") => 9.12 hours (9h 07m)
 */
export function calculateWorkedHoursFromTimeStrings(firstIn: string, lastOut: string): number {
  if (!firstIn || !lastOut || firstIn === "--" || lastOut === "--" || lastOut === "In Progress") {
    return 0;
  }
  try {
    const parseTime = (timeStr: string): number | null => {
      const cleaned = timeStr.trim();
      const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (!match || !match[1] || !match[2]) return null;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3]?.toUpperCase();

      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const inMins = parseTime(firstIn);
    const outMins = parseTime(lastOut);

    if (inMins === null || outMins === null) return 8.0;

    let diff = outMins - inMins;
    if (diff < 0) diff += 24 * 60;

    return Math.round((diff / 60) * 100) / 100;
  } catch {
    return 8.0;
  }
}

