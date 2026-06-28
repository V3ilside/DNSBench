'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Wifi, Building2, MapPin } from 'lucide-react';
import type { NetworkInfo } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { IPCard } from './IPCard';
import { ISPCard } from './ISPCard';
import { ResolverCard } from './ResolverCard';
import { SecurityCard } from './SecurityCard';
import type { DnsCheckResult } from '@/types';

export function NetworkPanel() {
  const [netInfo, setNetInfo] = useState<NetworkInfo | null>(null);
  const [dnsCheck, setDnsCheck] = useState<DnsCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [netRes, dnsRes] = await Promise.all([
          fetch('/api/network-info'),
          fetch('/api/dns-check'),
        ]);

        if (!cancelled) {
          if (netRes.ok) {
            const data = await netRes.json();
            setNetInfo(data);
          }
          if (dnsRes.ok) {
            const data = await dnsRes.json();
            setDnsCheck(data);
          }
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load network info');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="network-info" className="w-full">
      <GlassCard>
        {/* ── Panel Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl badge-active">
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Network Identity</h2>
            <p className="text-xs text-muted mt-0.5">
              Your IP, ISP, resolver &amp; DNS security status
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 mb-4">{error}</p>
        )}

        {/* ── 2×2 Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <IPCard info={netInfo} loading={loading} />
          <ISPCard info={netInfo} loading={loading} />
          <ResolverCard info={netInfo} dnsCheck={dnsCheck} loading={loading} />
          <SecurityCard dnsCheck={dnsCheck} loading={loading} />
        </div>
      </GlassCard>
    </section>
  );
}
