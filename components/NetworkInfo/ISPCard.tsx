'use client';

import { Building2 } from 'lucide-react';
import type { NetworkInfo } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { InfoCard } from './InfoCard';

interface ISPCardProps {
  info: NetworkInfo | null;
  loading: boolean;
}

export function ISPCard({ info, loading }: ISPCardProps) {
  return (
    <InfoCard
      icon={<Building2 className="w-4 h-4 text-violet-400" />}
      title="ISP & Network"
      iconBg="badge-active"
    >
      {loading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : info ? (
        <div className="space-y-1.5">
          {info.isp && (
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold tracking-wider">ISP</p>
              <p className="text-sm font-semibold text-white">{info.isp}</p>
            </div>
          )}
          {info.asn && (
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold tracking-wider">ASN</p>
              <p className="text-xs font-mono text-secondary">{info.asn}</p>
            </div>
          )}
          {info.org && info.org !== info.isp && (
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold tracking-wider">Org</p>
              <p className="text-xs text-secondary">{info.org}</p>
            </div>
          )}
          {info.timezone && (
            <p className="text-xs text-secondary mt-1">🕐 {info.timezone}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-secondary italic">Unable to detect</p>
      )}
    </InfoCard>
  );
}
