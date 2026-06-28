'use client';

import { Server } from 'lucide-react';
import type { NetworkInfo, DnsCheckResult } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InfoCard } from './InfoCard';

interface ResolverCardProps {
  info: NetworkInfo | null;
  dnsCheck: DnsCheckResult | null;
  loading: boolean;
}

export function ResolverCard({ info, dnsCheck, loading }: ResolverCardProps) {
  return (
    <InfoCard
      icon={<Server className="w-4 h-4 text-emerald-400" />}
      title="DNS Resolver"
      iconBg="badge-success"
    >
      {loading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <p className="text-[10px] text-muted uppercase font-semibold tracking-wider">
              Resolver IP
            </p>
            <p className="font-mono text-sm font-semibold text-white">
              {dnsCheck?.resolverIp || info?.resolverIp || '—'}
            </p>
          </div>

          {dnsCheck?.resolverOrg && (
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold tracking-wider">
                Operator
              </p>
              <p className="text-sm text-secondary">{dnsCheck.resolverOrg}</p>
            </div>
          )}

          {dnsCheck && (
            <StatusBadge
              status={dnsCheck.isPublicResolver ? 'info' : 'neutral'}
              label={
                dnsCheck.isPublicResolver
                  ? 'Public resolver detected'
                  : 'ISP resolver detected'
              }
            />
          )}

          <p className="text-[10px] text-secondary leading-relaxed mt-1">
            Approximated via IP geolocation. True resolver detection requires
            authoritative DNS infrastructure.
          </p>
        </div>
      )}
    </InfoCard>
  );
}
