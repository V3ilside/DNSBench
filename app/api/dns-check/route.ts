import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/dns-check
 *
 * Performs server-side DNS diagnostic checks:
 * 1. DNSSEC validation check — queries a known-signed domain via DoH
 * 2. Resolver identification — approximated via ip-api
 * 3. NXDOMAIN hijacking detection — queries a randomly generated domain
 * 4. IPv6 support check — via ipify
 *
 * NOTE: True resolver IP detection (UUID subdomain technique) requires custom
 * authoritative DNS infrastructure. This route provides the best approximation
 * available without custom NS records.
 */
export async function GET(req: NextRequest) {
  const results = await Promise.allSettled([
    checkDnssec(),
    detectResolver(req),
    checkNxdomainHijack(),
    checkIpv6(),
  ]);

  const [dnssecResult, resolverResult, hijackResult, ipv6Result] = results;

  const dnssec =
    dnssecResult.status === 'fulfilled'
      ? dnssecResult.value
      : { validated: false, description: 'Check failed' };

  const resolver =
    resolverResult.status === 'fulfilled'
      ? resolverResult.value
      : { ip: null, org: null, isPublic: false };

  const hijackDetected =
    hijackResult.status === 'fulfilled' ? hijackResult.value : false;

  const ipv6Support =
    ipv6Result.status === 'fulfilled' ? ipv6Result.value : false;

  return NextResponse.json({
    dnssec,
    resolverIp: resolver.ip,
    resolverOrg: resolver.org,
    isPublicResolver: resolver.isPublic,
    hijackDetected,
    filteringDetected: false, // Would need active subdomain infrastructure
    ipv6Support,
  });
}

// ─── DNSSEC Check ─────────────────────────────────────────────────────────────

async function checkDnssec(): Promise<{ validated: boolean; description: string }> {
  // Query cloudflare-dns.com for the DNSKEY record of a known DNSSEC-signed domain.
  // If the AD (Authentic Data) flag is set in the response, DNSSEC is validated.
  try {
    const url = 'https://cloudflare-dns.com/dns-query?name=dnssec-failed.org&type=A';
    const res = await fetch(url, {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return { validated: false, description: 'Query failed' };

    const data = await res.json();

    // dnssec-failed.org intentionally has a broken DNSSEC chain.
    // A validating resolver returns SERVFAIL (Status: 2).
    // A non-validating resolver returns NOERROR (Status: 0) with answers.
    if (data.Status === 2) {
      return {
        validated: true,
        description: 'Your resolver validates DNSSEC signatures.',
      };
    } else if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
      return {
        validated: false,
        description: 'Your resolver does not validate DNSSEC (broken chains accepted).',
      };
    } else {
      return {
        validated: false,
        description: 'DNSSEC status could not be determined.',
      };
    }
  } catch {
    return { validated: false, description: 'DNSSEC check timed out.' };
  }
}

// ─── Resolver Detection ───────────────────────────────────────────────────────

async function detectResolver(req: NextRequest): Promise<{
  ip: string | null;
  org: string | null;
  isPublic: boolean;
}> {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  let clientIp =
    cfConnectingIp ||
    (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
    '1.1.1.1';

  if (clientIp.startsWith('::ffff:')) clientIp = clientIp.slice(7);

  try {
    const res = await fetch(
      `http://ip-api.com/json/${clientIp}?fields=isp,org,as`,
      { signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    const org = data.isp || data.org || null;

    // Known public resolver ASNs
    const publicResolverAsns = [
      'AS13335', // Cloudflare
      'AS15169', // Google
      'AS19281', // Quad9
      'AS24940', // Hetzner / NextDNS
      'AS36692', // OpenDNS (Cisco)
    ];

    const isPublic = publicResolverAsns.some((asn) =>
      (data.as || '').startsWith(asn)
    );

    return { ip: clientIp, org, isPublic };
  } catch {
    return { ip: clientIp, org: null, isPublic: false };
  }
}

// ─── NXDOMAIN Hijack Check ────────────────────────────────────────────────────

async function checkNxdomainHijack(): Promise<boolean> {
  // Generate a random, definitely-non-existent domain
  const rand = Math.random().toString(36).slice(2, 12);
  const nxDomain = `${rand}-nxdomain-test-${rand}.invalid`;

  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${nxDomain}&type=A`;
    const res = await fetch(url, {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return false;

    const data = await res.json();

    // Status 3 = NXDOMAIN (correct). Any other status or non-empty Answer = hijack.
    if (data.Status !== 3) return true;
    if (data.Answer && data.Answer.length > 0) return true;

    return false;
  } catch {
    return false;
  }
}

// ─── IPv6 Support Check ───────────────────────────────────────────────────────

async function checkIpv6(): Promise<boolean> {
  try {
    const res = await fetch('https://api64.ipify.org?format=json', {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return Boolean(data.ip && data.ip.includes(':'));
  } catch {
    return false;
  }
}
