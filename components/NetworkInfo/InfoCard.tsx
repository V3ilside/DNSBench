'use client';

import { ReactNode } from 'react';

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  iconBg: string;
  children: ReactNode;
}

/**
 * Shared inner card used by all network info sub-cards.
 */
export function InfoCard({ icon, title, iconBg, children }: InfoCardProps) {
  return (
    <div className="p-4 rounded-xl bg-surface-800 border border-surface-600 hover:bg-surface-700 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`p-1.5 rounded-lg border ${iconBg}`}>{icon}</span>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
          {title}
        </h3>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
