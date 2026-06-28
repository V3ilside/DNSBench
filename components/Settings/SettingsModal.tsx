'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Settings, RotateCcw, Palette } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface SettingsModalProps {
  onClose: () => void;
}

const DEFAULT_DOMAINS = [
  'example.com',
  'cloudflare.com',
  'github.com',
  'wikipedia.org',
  'google.com',
];

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [domainText, setDomainText] = useState('');
  const [iterations, setIterations] = useState(5);
  const { accentColor, setAccentColor, resetAccentColor } = useTheme();

  // Parse current RGB
  const parseRGB = (colorStr: string) => {
    const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    }
    // Hex fallback if they used the color picker native
    if (colorStr.startsWith('#')) {
      const hex = colorStr.replace('#', '');
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
      };
    }
    return { r: 61, g: 70, b: 188 };
  };

  const rgb = parseRGB(accentColor);

  useEffect(() => {
    // Load custom domains
    try {
      const stored = localStorage.getItem('custom_dns_domains');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDomainText(parsed.join('\n'));
        } else {
          setDomainText(DEFAULT_DOMAINS.join('\n'));
        }
      } else {
        setDomainText(DEFAULT_DOMAINS.join('\n'));
      }
    } catch {
      setDomainText(DEFAULT_DOMAINS.join('\n'));
    }

    // Load custom iterations
    try {
      const storedIters = localStorage.getItem('custom_dns_iterations');
      if (storedIters) {
        const parsed = parseInt(storedIters, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 20) {
          setIterations(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSave = () => {
    const lines = domainText
      .split('\n')
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l.length > 0);
    
    if (lines.length > 0) {
      localStorage.setItem('custom_dns_domains', JSON.stringify(lines));
    } else {
      localStorage.removeItem('custom_dns_domains'); // fallback to default
    }

    localStorage.setItem('custom_dns_iterations', iterations.toString());

    // Notify same-window listeners (storage event only fires cross-tab)
    window.dispatchEvent(new CustomEvent('settings-changed'));

    onClose();
  };

  const handleReset = () => {
    setDomainText(DEFAULT_DOMAINS.join('\n'));
    setIterations(5);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md max-h-[90vh] flex flex-col"
      >
        <div className="p-6 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-black/80 backdrop-blur-md pt-2 pb-4 -mt-2 -mx-2 px-2 z-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" />
              Benchmark Settings
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-secondary hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Custom Benchmark Domains (One per line)
              </label>
              <textarea
                value={domainText}
                onChange={(e) => setDomainText(e.target.value)}
                className="w-full h-32 px-3 py-2 bg-black border border-surface-600 rounded-lg text-white font-mono text-sm placeholder:text-surface-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                placeholder="example.com&#10;google.com"
              />
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Queries will rotate through these domains during the benchmark. We recommend using well-known domains to avoid SERVFAIL responses triggered by DGA filters on some resolvers.
              </p>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-secondary">
                  Iterations per provider
                </label>
                <span className="text-sm font-mono text-violet-400">{iterations}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value, 10))}
                className="w-full accent-violet-500"
              />
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Higher iterations increase test accuracy but take longer. (1-20)
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-secondary" />
                <label className="block text-sm font-medium text-secondary">
                  Accent Color
                </label>
                <div 
                  className="ml-auto w-6 h-6 rounded border border-white/20" 
                  style={{ backgroundColor: accentColor }}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-red-400 w-4">R</span>
                  <input
                    type="range" min="0" max="255" value={rgb.r}
                    onChange={(e) => setAccentColor(`rgb(${e.target.value}, ${rgb.g}, ${rgb.b})`)}
                    className="flex-1 accent-red-500"
                  />
                  <span className="text-xs font-mono text-muted w-8 text-right">{rgb.r}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-green-400 w-4">G</span>
                  <input
                    type="range" min="0" max="255" value={rgb.g}
                    onChange={(e) => setAccentColor(`rgb(${rgb.r}, ${e.target.value}, ${rgb.b})`)}
                    className="flex-1 accent-green-500"
                  />
                  <span className="text-xs font-mono text-muted w-8 text-right">{rgb.g}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-blue-400 w-4">B</span>
                  <input
                    type="range" min="0" max="255" value={rgb.b}
                    onChange={(e) => setAccentColor(`rgb(${rgb.r}, ${rgb.g}, ${e.target.value})`)}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-xs font-mono text-muted w-8 text-right">{rgb.b}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                handleReset();
                resetAccentColor();
              }}
              className="flex items-center gap-1.5 text-sm text-secondary hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to default
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-24 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="w-24 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
