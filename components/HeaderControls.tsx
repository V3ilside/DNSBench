'use client';

import { useState } from 'react';
import { Settings, GitBranch } from 'lucide-react';
import { SettingsModal } from '@/components/Settings/SettingsModal';
import { useTheme } from '@/components/ThemeProvider';
import { DOH_PROVIDERS } from '@/lib/doh-providers';
import { AnimatePresence } from 'framer-motion';

export function HeaderControls() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex items-center gap-1 text-xs text-muted">
      <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-600">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        {DOH_PROVIDERS.length} providers
      </span>
      
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg text-secondary hover:text-white hover:bg-surface-800 transition-colors ml-2"
        aria-label="GitHub"
      >
        <GitBranch className="w-4 h-4" />
      </a>

      <button
        onClick={() => setIsSettingsOpen(true)}
        className="p-2 rounded-lg text-secondary hover:text-white hover:bg-surface-800 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal onClose={() => setIsSettingsOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
