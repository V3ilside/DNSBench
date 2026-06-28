// ─── Core Types ───────────────────────────────────────────────────────────────

export interface DoHProvider {
  id: string;
  name: string;
  shortName: string;
  dohUrl: string;
  color: string;
  description: string;
  privacyUrl?: string;
  dnssec?: boolean;
  filtering?: 'none' | 'malware' | 'ads+malware' | 'family';
  country?: string;
}

export type BenchmarkStatus = 'idle' | 'warmup' | 'testing' | 'done' | 'error';

export interface ProviderSample {
  iteration: number;
  latencyMs: number | null;
}

export interface ProviderResult {
  provider: DoHProvider;
  samples: ProviderSample[];
  minMs: number | null;
  avgMs: number | null;
  maxMs: number | null;
  medianMs: number | null;
  reliability: number;
  status: 'pending' | 'warmup' | 'testing' | 'done' | 'timeout' | 'error';
  rank?: number;
  viaProxy?: boolean;
}

export interface NetworkInfo {
  ipv4: string | null;
  ipv6: string | null;
  isp: string | null;
  org: string | null;
  asn: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  resolverIp: string | null;
}

export interface DnsSecResult {
  validated: boolean;
  description: string;
}

export interface DnsCheckResult {
  dnssec: DnsSecResult;
  resolverIp: string | null;
  resolverOrg: string | null;
  isPublicResolver: boolean;
  hijackDetected: boolean;
  filteringDetected: boolean;
  ipv6Support: boolean;
}

export interface ProxyResult {
  serverLatencyMs: number | null;
  dnsStatus: number | null;
  ok: boolean;
}

// ─── Rating System Types ─────────────────────────────────────────────────────

export type RatingCategory = 'privacy' | 'speed' | 'security' | 'reliability' | 'transparency' | 'features';

export interface CategoryRatings {
  privacy: number;      // 1–10: data practices, jurisdiction, logging
  speed: number;        // 1–10: resolution latency, global PoPs
  security: number;     // 1–10: DNSSEC, threat blocking, hardening
  reliability: number;  // 1–10: uptime, redundancy, anycast coverage
  transparency: number; // 1–10: audits, open source, published reports
  features: number;     // 1–10: configurability, DoH/DoT/DoQ, analytics
}

export interface CommunityRating {
  providerId: string;
  categories: CategoryRatings;
  voteCount: number;
  /** Weighted average across all categories */
  overallScore: number;
}

export interface UserRating {
  providerId: string;
  categories: CategoryRatings;
  timestamp: number;
}

// ─── Uptime Types ─────────────────────────────────────────────────────────────

export type DayStatus = 'up' | 'degraded' | 'down';

export interface UptimeSeed {
  providerId: string;
  /** Documented/expected uptime percentage */
  uptimePercent: number;
  /** Baseline response time in ms */
  avgResponseMs: number;
}

// ─── Review Types ─────────────────────────────────────────────────────────────

export interface ProviderReview {
  providerId: string;
  /** Custom title to override the default provider name (e.g. for merged brands) */
  reviewTitle?: string;
  /** Editorial score (0–10) */
  editorialScore: number;
  /** 1-sentence headline */
  tagline: string;
  /** 2–3 sentence overview */
  summary: string;
  privacyDetail: string;
  performanceDetail: string;
  securityDetail: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  worstFor: string[];
  /** Final editorial verdict */
  verdict: string;
  lastUpdated: string;
  /** Optional array of tiers to describe different endpoints of the same brand */
  tiers?: { name: string; description: string }[];
}
