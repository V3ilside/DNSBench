import type { CommunityRating, UptimeSeed, RatingCategory, CategoryRatings } from '@/types';

// ─── Rating Category Metadata ─────────────────────────────────────────────────

export const RATING_CATEGORIES: Array<{
  key: RatingCategory;
  label: string;
  icon: string;
  description: string;
  lowLabel: string;
  highLabel: string;
}> = [
  {
    key: 'privacy',
    label: 'Privacy',
    icon: '🔒',
    description: 'Data retention, logging practices, and jurisdiction',
    lowLabel: 'Logs everything',
    highLabel: 'Zero logs',
  },
  {
    key: 'speed',
    label: 'Speed',
    icon: '⚡',
    description: 'Global resolution latency and PoP coverage',
    lowLabel: 'Slow',
    highLabel: 'Blazing fast',
  },
  {
    key: 'security',
    label: 'Security',
    icon: '🛡️',
    description: 'DNSSEC validation, malware/phishing blocking',
    lowLabel: 'No protection',
    highLabel: 'Enterprise-grade',
  },
  {
    key: 'reliability',
    label: 'Reliability',
    icon: '📶',
    description: 'Uptime, redundancy, and anycast coverage',
    lowLabel: 'Frequent outages',
    highLabel: 'Five nines',
  },
  {
    key: 'transparency',
    label: 'Transparency',
    icon: '🔍',
    description: 'Audits, open source code, published reports',
    lowLabel: 'Black box',
    highLabel: 'Fully audited',
  },
  {
    key: 'features',
    label: 'Features',
    icon: '⚙️',
    description: 'Configurability, analytics, protocol support (DoT/DoQ)',
    lowLabel: 'Basic only',
    highLabel: 'Feature-rich',
  },
];

function avg(cats: CategoryRatings): number {
  const vals = [
    cats.privacy,
    cats.speed,
    cats.security,
    cats.reliability,
    cats.transparency,
    cats.features,
  ];
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

// ─── Community Seed Ratings ───────────────────────────────────────────────────
// Research-based ratings reflecting public knowledge, audits, and user consensus.
// voteCount reflects relative popularity and community engagement.

const raw: Omit<CommunityRating, 'overallScore'>[] = [
  {
    providerId: 'cloudflare',
    categories: { privacy: 7, speed: 10, security: 8, reliability: 10, transparency: 8, features: 8 },
    voteCount: 21_843,
  },
  {
    providerId: 'cloudflare-security',
    categories: { privacy: 7, speed: 10, security: 10, reliability: 10, transparency: 8, features: 7 },
    voteCount: 9_210,
  },
  {
    providerId: 'cloudflare-family',
    categories: { privacy: 7, speed: 9, security: 9, reliability: 10, transparency: 8, features: 6 },
    voteCount: 6_034,
  },
  {
    providerId: 'google',
    categories: { privacy: 3, speed: 10, security: 8, reliability: 10, transparency: 6, features: 6 },
    voteCount: 18_922,
  },
  {
    providerId: 'quad9',
    categories: { privacy: 9, speed: 7, security: 10, reliability: 9, transparency: 9, features: 6 },
    voteCount: 11_450,
  },
  {
    providerId: 'quad9-unsecured',
    categories: { privacy: 9, speed: 8, security: 5, reliability: 9, transparency: 9, features: 5 },
    voteCount: 3_120,
  },
  {
    providerId: 'canadian-shield-private',
    categories: { privacy: 9, speed: 7, security: 7, reliability: 8, transparency: 8, features: 5 },
    voteCount: 4_380,
  },
  {
    providerId: 'canadian-shield-protected',
    categories: { privacy: 9, speed: 7, security: 9, reliability: 8, transparency: 8, features: 6 },
    voteCount: 5_210,
  },
  {
    providerId: 'canadian-shield-family',
    categories: { privacy: 9, speed: 7, security: 8, reliability: 8, transparency: 8, features: 6 },
    voteCount: 3_890,
  },
  {
    providerId: 'mullvad',
    categories: { privacy: 10, speed: 7, security: 8, reliability: 8, transparency: 9, features: 6 },
    voteCount: 8_671,
  },
  {
    providerId: 'nextdns',
    categories: { privacy: 8, speed: 8, security: 9, reliability: 8, transparency: 8, features: 10 },
    voteCount: 13_540,
  },
  {
    providerId: 'adguard',
    categories: { privacy: 8, speed: 8, security: 9, reliability: 8, transparency: 7, features: 9 },
    voteCount: 10_321,
  },
  {
    providerId: 'adguard-unfiltered',
    categories: { privacy: 8, speed: 8, security: 6, reliability: 8, transparency: 7, features: 7 },
    voteCount: 2_890,
  },
  {
    providerId: 'controld',
    categories: { privacy: 8, speed: 8, security: 8, reliability: 8, transparency: 7, features: 10 },
    voteCount: 5_760,
  },
  {
    providerId: 'rethinkdns',
    categories: { privacy: 9, speed: 7, security: 8, reliability: 7, transparency: 10, features: 8 },
    voteCount: 2_340,
  },
  {
    providerId: 'libredns',
    categories: { privacy: 9, speed: 5, security: 6, reliability: 6, transparency: 10, features: 4 },
    voteCount: 1_280,
  },
  {
    providerId: 'dnssb',
    categories: { privacy: 8, speed: 7, security: 7, reliability: 7, transparency: 7, features: 5 },
    voteCount: 2_104,
  },
  {
    providerId: 'opendns-home',
    categories: { privacy: 4, speed: 9, security: 9, reliability: 9, transparency: 5, features: 7 },
    voteCount: 7_834,
  },
  {
    providerId: 'opendns-family',
    categories: { privacy: 4, speed: 9, security: 8, reliability: 9, transparency: 5, features: 5 },
    voteCount: 4_203,
  },
  {
    providerId: 'cisco-umbrella',
    categories: { privacy: 3, speed: 9, security: 10, reliability: 10, transparency: 5, features: 8 },
    voteCount: 3_980,
  },
  {
    providerId: 'cleanbrowsing-security',
    categories: { privacy: 7, speed: 7, security: 9, reliability: 8, transparency: 6, features: 5 },
    voteCount: 2_650,
  },
  {
    providerId: 'cleanbrowsing-family',
    categories: { privacy: 7, speed: 7, security: 8, reliability: 8, transparency: 6, features: 5 },
    voteCount: 3_410,
  },
  {
    providerId: 'dnspod',
    categories: { privacy: 3, speed: 8, security: 6, reliability: 8, transparency: 3, features: 5 },
    voteCount: 1_890,
  },
  {
    providerId: 'alidns',
    categories: { privacy: 3, speed: 8, security: 6, reliability: 8, transparency: 3, features: 4 },
    voteCount: 1_540,
  },
  {
    providerId: 'hurricane-electric',
    categories: { privacy: 6, speed: 7, security: 7, reliability: 8, transparency: 6, features: 4 },
    voteCount: 1_760,
  },
  {
    providerId: 'dnsforge',
    categories: { privacy: 8, speed: 6, security: 8, reliability: 7, transparency: 7, features: 7 },
    voteCount: 980,
  },
  {
    providerId: 'switch',
    categories: { privacy: 9, speed: 6, security: 8, reliability: 8, transparency: 8, features: 5 },
    voteCount: 1_340,
  },
  {
    providerId: 'comodo',
    categories: { privacy: 4, speed: 6, security: 8, reliability: 7, transparency: 4, features: 4 },
    voteCount: 1_120,
  },
  {
    providerId: 'yandex',
    categories: { privacy: 2, speed: 7, security: 6, reliability: 7, transparency: 3, features: 4 },
    voteCount: 890,
  },
];

export const COMMUNITY_RATINGS: CommunityRating[] = raw.map((r) => ({
  ...r,
  overallScore: avg(r.categories),
}));

export const COMMUNITY_RATINGS_MAP = Object.fromEntries(
  COMMUNITY_RATINGS.map((r) => [r.providerId, r])
);

// ─── Uptime Seeds ─────────────────────────────────────────────────────────────

export const UPTIME_SEEDS: UptimeSeed[] = [
  { providerId: 'cloudflare',               uptimePercent: 99.99, avgResponseMs: 11  },
  { providerId: 'cloudflare-security',      uptimePercent: 99.99, avgResponseMs: 12  },
  { providerId: 'cloudflare-family',        uptimePercent: 99.99, avgResponseMs: 12  },
  { providerId: 'google',                   uptimePercent: 99.98, avgResponseMs: 14  },
  { providerId: 'quad9',                    uptimePercent: 99.96, avgResponseMs: 18  },
  { providerId: 'quad9-unsecured',          uptimePercent: 99.96, avgResponseMs: 17  },
  { providerId: 'canadian-shield-private',  uptimePercent: 99.82, avgResponseMs: 22  },
  { providerId: 'canadian-shield-protected',uptimePercent: 99.82, avgResponseMs: 23  },
  { providerId: 'canadian-shield-family',   uptimePercent: 99.82, avgResponseMs: 23  },
  { providerId: 'mullvad',                  uptimePercent: 99.88, avgResponseMs: 20  },
  { providerId: 'nextdns',                  uptimePercent: 99.85, avgResponseMs: 19  },
  { providerId: 'adguard',                  uptimePercent: 99.90, avgResponseMs: 17  },
  { providerId: 'adguard-unfiltered',       uptimePercent: 99.90, avgResponseMs: 17  },
  { providerId: 'controld',                 uptimePercent: 99.78, avgResponseMs: 21  },
  { providerId: 'rethinkdns',               uptimePercent: 99.70, avgResponseMs: 25  },
  { providerId: 'libredns',                 uptimePercent: 99.40, avgResponseMs: 38  },
  { providerId: 'dnssb',                    uptimePercent: 99.65, avgResponseMs: 26  },
  { providerId: 'opendns-home',             uptimePercent: 99.92, avgResponseMs: 15  },
  { providerId: 'opendns-family',           uptimePercent: 99.92, avgResponseMs: 15  },
  { providerId: 'cisco-umbrella',           uptimePercent: 99.99, avgResponseMs: 13  },
  { providerId: 'cleanbrowsing-security',   uptimePercent: 99.75, avgResponseMs: 29  },
  { providerId: 'cleanbrowsing-family',     uptimePercent: 99.75, avgResponseMs: 29  },
  { providerId: 'dnspod',                   uptimePercent: 99.88, avgResponseMs: 16  },
  { providerId: 'alidns',                   uptimePercent: 99.85, avgResponseMs: 16  },
  { providerId: 'hurricane-electric',       uptimePercent: 99.60, avgResponseMs: 31  },
  { providerId: 'dnsforge',                 uptimePercent: 99.55, avgResponseMs: 34  },
  { providerId: 'switch',                   uptimePercent: 99.72, avgResponseMs: 27  },
  { providerId: 'comodo',                   uptimePercent: 99.45, avgResponseMs: 40  },
  { providerId: 'yandex',                   uptimePercent: 99.35, avgResponseMs: 44  },
];

export const UPTIME_MAP = Object.fromEntries(UPTIME_SEEDS.map((u) => [u.providerId, u]));
