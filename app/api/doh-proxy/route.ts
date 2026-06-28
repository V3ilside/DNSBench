import { NextRequest, NextResponse } from 'next/server';
import type { ProxyResult } from '@/types';
import { DOH_PROVIDERS } from '@/lib/doh-providers';

// Build allowlist from known providers at startup
const ALLOWED_HOSTS = new Set(
  DOH_PROVIDERS.map((p) => {
    try {
      return new URL(p.dohUrl).hostname;
    } catch {
      return '';
    }
  }).filter(Boolean)
);

/**
 * GET /api/doh-proxy?endpoint=<doh-url>&name=<domain>&type=A
 *
 * Server-side DoH proxy. Used as an automatic fallback when a provider's CORS
 * policy blocks direct browser requests (common on localhost and for some providers
 * that don't set Access-Control-Allow-Origin headers).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  WHY THIS EXISTS                                                    │
 * │  The Accept: application/dns-json header triggers a CORS preflight  │
 * │  (OPTIONS request). Providers like Comodo, SWITCH, AliDNS, Yandex  │
 * │  do not respond to preflights from arbitrary origins, causing       │
 * │  browser fetch to abort with a CORS error.                          │
 * │                                                                     │
 * │  This proxy runs server-side (no CORS restrictions). The measured   │
 * │  latency is from the Next.js server → DoH provider, NOT from the   │
 * │  user's browser. Results are marked "via proxy" in the UI.         │
 * └─────────────────────────────────────────────────────────────────────┘
 */
export async function GET(req: NextRequest): Promise<NextResponse<ProxyResult>> {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');
  const name = searchParams.get('name');
  const type = searchParams.get('type') ?? 'A';

  if (!endpoint || !name) {
    return NextResponse.json(
      { serverLatencyMs: null, dnsStatus: null, ok: false },
      { status: 400 }
    );
  }

  // Validate the endpoint is a real HTTPS URL and an allowed DoH hostname (prevent SSRF)
  let endpointUrl: URL;
  try {
    endpointUrl = new URL(endpoint);
    if (endpointUrl.protocol !== 'https:') throw new Error('Must be HTTPS');
    if (!ALLOWED_HOSTS.has(endpointUrl.hostname)) throw new Error('Host not allowed');
  } catch {
    return NextResponse.json(
      { serverLatencyMs: null, dnsStatus: null, ok: false },
      { status: 400 }
    );
  }

  // Construct query URL safely using URL API to prevent injection
  const queryUrlObj = new URL(endpoint);
  queryUrlObj.searchParams.set('name', name);
  queryUrlObj.searchParams.set('type', type);
  const queryUrl = queryUrlObj.toString();

  const start = performance.now();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(queryUrl, {
      headers: { Accept: 'application/dns-json' },
      signal: controller.signal,
      cache: 'no-store',
    });

    const serverLatencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      return NextResponse.json(
        { serverLatencyMs: null, dnsStatus: res.status, ok: false },
        { status: 200 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      serverLatencyMs,
      dnsStatus: data?.Status ?? null,
      ok: true,
    });
  } catch (err) {
    return NextResponse.json(
      { serverLatencyMs: null, dnsStatus: null, ok: false },
      { status: 200 }
    );
  } finally {
    clearTimeout(timer);
  }
}
