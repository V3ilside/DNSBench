'use client';

import { ShieldCheck } from 'lucide-react';
import type { DnsCheckResult } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InfoCard } from './InfoCard';

interface SecurityCardProps {
  dnsCheck: DnsCheckResult | null;
  loading: boolean;
}

export function SecurityCard({ dnsCheck, loading }: SecurityCardProps) {
  return (
    <InfoCard
      icon={<ShieldCheck className="w-4 h-4 text-rose-400" />}
      title="DNS Security"
      iconBg="badge-danger"
    >
      {loading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
        </div>
      ) : dnsCheck ? (
        <div className="space-y-2">
          {/* DNSSEC */}
          <div className="space-y-1">
            <StatusBadge
              status={dnsCheck.dnssec.validated ? 'success' : 'warning'}
              label={dnsCheck.dnssec.validated ? 'DNSSEC Validated' : 'DNSSEC Not Validated'}
            />
            <p className="text-[10px] text-secondary leading-relaxed">
              {dnsCheck.dnssec.description}
            </p>
          </div>

          {/* NXDOMAIN Hijack */}
          <StatusBadge
            status={dnsCheck.hijackDetected ? 'danger' : 'success'}
            label={
              dnsCheck.hijackDetected
                ? 'NXDOMAIN Hijacking Detected'
                : 'No NXDOMAIN Hijacking'
            }
          />

          {/* IPv6 */}
          <StatusBadge
            status={dnsCheck.ipv6Support ? 'success' : 'neutral'}
            label={dnsCheck.ipv6Support ? 'IPv6 Connected' : 'IPv4 Only'}
          />
        </div>
      ) : (
        <p className="text-sm text-muted italic">Security checks pending…</p>
      )}
    </InfoCard>
  );
}
