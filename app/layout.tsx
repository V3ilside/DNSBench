import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'DNS Speed Test — Find Your Fastest DNS Resolver',
  description:
    'Real-time DoH (DNS over HTTPS) benchmark across 18+ providers. Check latency, ISP, DNSSEC status, and DNS security from your browser. No install, no data collected.',
  keywords: [
    'DNS speed test',
    'DoH benchmark',
    'fastest DNS',
    'DNS over HTTPS',
    'DNSSEC check',
    'DNS resolver',
    'network diagnostic',
    'Cloudflare DNS',
    'Google DNS',
    'Quad9',
  ],
  openGraph: {
    title: 'DNS Speed Test — Find Your Fastest Resolver',
    description:
      'Benchmark 18+ DNS-over-HTTPS resolvers from your browser. Free, private, instant.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'DNS Speed Test',
    description: 'Benchmark 18+ DoH resolvers. Free, private, browser-based.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-black text-secondary selection:bg-accent/30 flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
