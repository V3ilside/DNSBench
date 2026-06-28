import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/network-info
 * Returns the client's IP address, ISP, ASN, and geographic data.
 * Uses ip-api.com (free, no key required, max 45 req/min from same IP).
 */
export async function GET(req: NextRequest) {
  try {
    // ── Extract client IP ──────────────────────────────────────────────────────
    // In production (Vercel / Cloudflare), the real IP is in headers.
    const forwardedFor = req.headers.get('x-forwarded-for');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    const realIp = req.headers.get('x-real-ip');

    let clientIp =
      cfConnectingIp ||
      (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
      realIp ||
      '1.1.1.1'; // fallback for local dev

    // Normalise IPv6-mapped IPv4 addresses (::ffff:1.2.3.4 → 1.2.3.4)
    if (clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.slice(7);
    }

    // ── Fetch IP geolocation from ip-api.com ──────────────────────────────────
    const fields =
      'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query';

    const ipApiRes = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(clientIp)}?fields=${fields}`,
      { next: { revalidate: 3600 } } // cache for 1 hour per deploy
    );

    if (!ipApiRes.ok) {
      throw new Error(`ip-api returned ${ipApiRes.status}`);
    }

    const ipData = await ipApiRes.json();

    if (ipData.status !== 'success') {
      throw new Error(ipData.message || 'ip-api lookup failed');
    }

    // ── Try to get IPv6 address if available ──────────────────────────────────
    // We attempt a lightweight call to api64.ipify.org which returns v6 if available
    let ipv6: string | null = null;
    try {
      const v6Res = await fetch('https://api64.ipify.org?format=json', {
        signal: AbortSignal.timeout(3000),
      });
      const v6Data = await v6Res.json();
      if (v6Data.ip && v6Data.ip.includes(':')) {
        ipv6 = v6Data.ip;
      }
    } catch {
      // IPv6 detection is best-effort
    }

    // ── Parse ASN from ip-api "as" field (format: "AS13335 Cloudflare, Inc.") ─
    const asnMatch = (ipData.as as string)?.match(/^(AS\d+)/);
    const asn = asnMatch ? asnMatch[1] : ipData.as || null;

    return NextResponse.json({
      ipv4: clientIp,
      ipv6: ipv6,
      isp: ipData.isp || null,
      org: ipData.org || null,
      asn: asn,
      city: ipData.city || null,
      region: ipData.regionName || null,
      country: ipData.country || null,
      countryCode: ipData.countryCode || null,
      lat: ipData.lat ?? null,
      lon: ipData.lon ?? null,
      timezone: ipData.timezone || null,
      // The resolver IP is the same IP making this server request (approximation).
      // True resolver detection requires authoritative DNS infrastructure.
      resolverIp: clientIp,
    });
  } catch (err) {
    console.error('[network-info] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch network info' },
      { status: 500 }
    );
  }
}
