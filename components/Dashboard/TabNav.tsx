'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Activity, Star, Clock, FileText } from 'lucide-react';

export type TabId = 'speed' | 'ratings' | 'uptime' | 'reviews';

interface TabNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'speed', label: 'Speed Test', icon: <Activity className="w-4 h-4" /> },
  { id: 'ratings', label: 'Community Ratings', icon: <Star className="w-4 h-4" /> },
  { id: 'uptime', label: 'Uptime', icon: <Clock className="w-4 h-4" /> },
  { id: 'reviews', label: 'Reviews', icon: <FileText className="w-4 h-4" /> },
];

export function TabNav({ activeTab, onChange }: TabNavProps) {
  return (
    <>
      <div className="flex items-center w-full p-1 bg-surface-800 rounded-xl border border-surface-600 mb-6 overflow-hidden">
        <div className="flex w-full space-x-1 overflow-x-auto no-scrollbar">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap outline-none',
              isActive ? 'text-white' : 'text-secondary hover:text-white hover:bg-surface-700'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-violet-500/20 border border-violet-500/30 rounded-lg"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        );
      })}
        </div>
      </div>
    </>
  );
}
