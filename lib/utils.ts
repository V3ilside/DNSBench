import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a latency value for display */
export function formatLatency(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

/** Color stops for text and bars: green -> yellow -> orange -> red */
const COLOR_STOPS = [
  { val: 15, r: 22, g: 163, b: 74 },  // Green (green-600)
  { val: 40, r: 132, g: 204, b: 22 }, // Yellow-Green (lime-500)
  { val: 80, r: 202, g: 138, b: 4 },  // Orange/Brown (yellow-600)
  { val: 140, r: 180, g: 83, b: 9 },  // Darker Orange (amber-700)
  { val: 200, r: 185, g: 28, b: 28 }, // Red (red-700)
];

function interpolate(val: number, stops: typeof COLOR_STOPS): string {
  if (val <= stops[0].val) return `rgb(${stops[0].r}, ${stops[0].g}, ${stops[0].b})`;
  if (val >= stops[stops.length - 1].val) {
    const last = stops[stops.length - 1];
    return `rgb(${last.r}, ${last.g}, ${last.b})`;
  }

  for (let i = 0; i < stops.length - 1; i++) {
    const s1 = stops[i];
    const s2 = stops[i + 1];
    if (val >= s1.val && val <= s2.val) {
      const ratio = (val - s1.val) / (s2.val - s1.val);
      const r = Math.round(s1.r + ratio * (s2.r - s1.r));
      const g = Math.round(s1.g + ratio * (s2.g - s1.g));
      const b = Math.round(s1.b + ratio * (s2.b - s1.b));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return `rgb(255, 255, 255)`;
}

/** Get a dynamic inline style object for latency text */
export function getLatencyStyle(ms: number | null, isBest: boolean = false): React.CSSProperties {
  if (ms === null) return { color: 'var(--text-muted)' };
  
  if (isBest) {
    return {
      color: 'rgb(37, 99, 235)', // Dark blue (blue-600)
      textShadow: '0 0 15px rgba(37, 99, 235, 0.8)'
    };
  }

  const color = interpolate(ms, COLOR_STOPS);
  
  return { color };
}

/** Get a background color string for latency bars */
export function getLatencyBarColor(ms: number | null): string {
  if (ms === null) return '#1e1e2a'; // surface-600
  return interpolate(ms, COLOR_STOPS);
}

/** Get reliability color */
export function getReliabilityColor(reliability: number): string {
  if (reliability >= 90) return 'text-emerald-400';
  if (reliability >= 70) return 'text-yellow-400';
  return 'text-red-400';
}

/** Get ordinal suffix for rank (1st, 2nd, 3rd, etc.) */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Convert country code to emoji flag */
export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🌐';
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('');
}

/** Truncate a string to a max length */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}
