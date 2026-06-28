import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Glassmorphism card — the primary surface for all panels.
 */
export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative p-5 md:p-6 glass',
        className
      )}
    >
      {/* Subtle inner glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)]"
        style={{
          background:
            'radial-gradient(ellipse at 30% 0%, rgba(61,70,188,0.06) 0%, transparent 60%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
