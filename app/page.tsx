'use client';

import { useState } from 'react';
import { SpeedTestPanel } from '@/components/SpeedTest/SpeedTestPanel';
import { NetworkPanel } from '@/components/NetworkInfo/NetworkPanel';
import { RatingsPanel } from '@/components/Ratings/RatingsPanel';
import { UptimePanel } from '@/components/Uptime/UptimePanel';
import { ReviewsPanel } from '@/components/Reviews/ReviewsPanel';
import { TabNav, TabId } from '@/components/Dashboard/TabNav';
import { GitBranch, ChevronDown } from 'lucide-react';
import { DOH_PROVIDERS } from '@/lib/doh-providers';
import { HeaderControls } from '@/components/HeaderControls';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('speed');

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-4 md:px-8 bg-black/80 backdrop-blur-xl border-b border-surface-600">
        <a href="/" className="flex items-center gap-2 font-bold text-lg text-white tracking-tight">
          DNS Bench
        </a>

        <HeaderControls />
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="pt-28 pb-12 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Find your optimal DNS.
        </h1>

        <p className="mt-4 text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Benchmark <strong className="text-white font-semibold">{DOH_PROVIDERS.length} DNS-over-HTTPS resolvers</strong> using customizable iterations per test and strict <strong className="text-white font-semibold">&lt;5s</strong> query timeouts to find the most responsive and reliable option for your network. No tracking. Completely client-sided.
        </p>
      </header>

      {/* ── Main Dashboard ────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 pb-16 max-w-5xl mx-auto w-full space-y-8">
        <TabNav activeTab={activeTab} onChange={setActiveTab} />

        {/* Dynamic Panels */}
        <div className="min-h-[500px]">
          <div className={activeTab === 'speed' ? 'space-y-8 animate-in fade-in zoom-in-95 duration-300' : 'hidden'}>
            <SpeedTestPanel />

            {/* Divider */}
            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-surface-600" />
              <span className="text-xs text-muted uppercase tracking-widest font-semibold">
                Network Identity
              </span>
              <div className="flex-1 h-px bg-surface-600" />
            </div>

            <NetworkPanel />

            {/* How it works */}
            <details className="group rounded-2xl bg-surface-800 border border-surface-600 overflow-hidden">
              <summary aria-expanded="false" className="flex items-center justify-between px-5 py-4 cursor-pointer list-none text-sm font-semibold text-secondary hover:text-white transition-colors select-none">
                <span>How this test works</span>
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 text-sm text-secondary leading-relaxed space-y-3 border-t border-surface-600 pt-4">
                <p>
                  <strong className="text-white">Client-side primarily.</strong> DoH queries run directly from your browser where CORS allows. A server-side proxy acts as a fallback for strict providers.
                </p>
                <p>
                  <strong className="text-white">Warm-up pass.</strong> Before
                  timing begins, each provider receives one un-timed request to prime
                  connections.
                </p>
                <p>
                  <strong className="text-white">Customizable iterations.</strong> Each
                  provider is queried multiple times using major websites to simulate real-world resolution.
                </p>
                <p>
                  <strong className="text-white">5s timeout.</strong> Requests
                  exceeding 5 seconds are marked as timeouts.
                </p>
              </div>
            </details>
          </div>

          <div className={activeTab === 'ratings' ? 'animate-in fade-in zoom-in-95 duration-300' : 'hidden'}>
            <RatingsPanel />
          </div>

          <div className={activeTab === 'uptime' ? 'animate-in fade-in zoom-in-95 duration-300' : 'hidden'}>
            <UptimePanel />
          </div>

          <div className={activeTab === 'reviews' ? 'animate-in fade-in zoom-in-95 duration-300' : 'hidden'}>
            <ReviewsPanel />
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-600 py-6 px-4 text-center">
        <p className="text-xs text-muted">
          DNS SpeedTest · Open source · No tracking · No cookies
        </p>
      </footer>
    </div>
  );
}
