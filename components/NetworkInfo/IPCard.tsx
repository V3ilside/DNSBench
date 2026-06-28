'use client';

import { Globe2 } from 'lucide-react';
import type { NetworkInfo } from '@/types';
import { countryCodeToFlag } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { InfoCard } from './InfoCard';

interface IPCardProps {
  info: NetworkInfo | null;
  loading: boolean;
}

export function IPCard({ info, loading }: IPCardProps) {
  return (
    <InfoCard
      icon={<Globe2 className="w-4 h-4 text-cyan-400" />}
      title="Your IP Addresses"
      iconBg="badge-active"
    >
      {loading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-44" />
        </div>
      ) : info ? (
        <div className="space-y-2">
          {/* IPv4 */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold badge-active px-1.5 py-0.5 rounded">
              IPv4
            </span>
            <span className="font-mono text-sm font-semibold text-white">
              {info.ipv4 || '—'}
            </span>
          </div>

          {/* IPv6 */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold badge-active px-1.5 py-0.5 rounded">
              IPv6
            </span>
            <span className="font-mono text-xs text-secondary break-all">
              {info.ipv6 || (
                <span className="text-muted italic">Not detected</span>
              )}
            </span>
          </div>

          {/* Location */}
          {info.countryCode && (
            <p className="text-xs text-secondary mt-1 flex items-center gap-1">
              <span>{countryCodeToFlag(info.countryCode)}</span>
              {[info.city, info.region, info.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-secondary italic">Unable to detect</p>
      )}
    </InfoCard>
  );
}
