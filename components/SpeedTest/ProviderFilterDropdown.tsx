'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Plus, Search } from 'lucide-react';
import { DOH_PROVIDERS } from '@/lib/doh-providers';
import type { DoHProvider } from '@/types';
import { cn } from '@/lib/utils';

interface ProviderFilterDropdownProps {
  activeProviders: DoHProvider[];
  onChange: (providers: DoHProvider[]) => void;
  disabled?: boolean;
}

export function ProviderFilterDropdown({ activeProviders, onChange, disabled }: ProviderFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProvider = (provider: DoHProvider) => {
    const isActive = activeProviders.some(p => p.id === provider.id);
    if (isActive) {
      // Prevent deselecting the last provider
      if (activeProviders.length <= 1) return;
      onChange(activeProviders.filter(p => p.id !== provider.id));
    } else {
      onChange([...activeProviders, provider]);
    }
  };

  const addCustomProvider = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = new URL(customUrl);
      // Prevent duplicates
      if (activeProviders.some(p => p.dohUrl === customUrl)) {
        setCustomUrl('');
        return;
      }
      const customId = `custom-${Date.now()}`;
      const newProvider: DoHProvider = {
        id: customId,
        name: new URL(customUrl).hostname,
        shortName: 'Custom',
        dohUrl: customUrl,
        color: '#8b5cf6',
        description: 'Custom added provider.',
        privacyUrl: '',
        dnssec: false,
        filtering: 'none',
        country: 'XX'
      };
      onChange([...activeProviders, newProvider]);
      setCustomUrl('');
    } catch {
      // Invalid URL handled silently for now
    }
  };

  const filteredProviders = DOH_PROVIDERS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Identify custom providers to show at the top
  const customProviders = activeProviders.filter(p => p.id.startsWith('custom-'));

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Liquid Glass Dropdown Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
          "bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/20 cursor-pointer"
        )}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <span className="text-sm font-medium text-white">{activeProviders.length} providers</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-white transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Liquid Glass Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-72 z-[60]"
          >
            <div className="p-2 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              {/* Search */}
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  placeholder="Filter providers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>

              {/* Provider List */}
              <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
                {/* Custom Providers */}
                {customProviders.map(p => (
                  <button
                    key={p.id}
                    onClick={() => toggleProvider(p)}
                    className="flex items-center justify-between w-full px-2 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-left"
                  >
                    <span className="text-sm text-white truncate max-w-[200px]">{p.dohUrl}</span>
                    {activeProviders.some(a => a.id === p.id) && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}

                {customProviders.length > 0 && <div className="h-px bg-white/10 my-1 mx-2" />}

                {/* Default Providers */}
                {filteredProviders.map(p => (
                  <button
                    key={p.id}
                    onClick={() => toggleProvider(p)}
                    className="flex items-center justify-between w-full px-2 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-left"
                  >
                    <span className="text-sm text-white truncate">{p.name}</span>
                    {activeProviders.some(a => a.id === p.id) && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
                
                {filteredProviders.length === 0 && (
                  <p className="text-xs text-secondary text-center py-4">No providers found.</p>
                )}
              </div>

              {/* Add Custom Form */}
              <form onSubmit={addCustomProvider} className="mt-2 pt-2 border-t border-white/10 flex gap-1">
                <input
                  type="url"
                  placeholder="https://dns.url/query"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={!customUrl}
                  className="p-1 text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
