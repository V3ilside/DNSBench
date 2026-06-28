'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useInView } from 'framer-motion';
import type { CommunityRating } from '@/types';
import { DOH_PROVIDERS } from '@/lib/doh-providers';
import { RATING_CATEGORIES } from '@/lib/community-ratings';

interface RadarComparisonProps {
  ratings: CommunityRating[];
  /** Up to 3 provider IDs to compare */
  selectedProviders: string[];
}

export function RadarComparison({ ratings, selectedProviders }: RadarComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Trigger animation when the component comes into view (HLTV style initialization)
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  const chartData = useMemo(() => {
    return RATING_CATEGORIES.map((cat) => {
      const dataPoint: any = { subject: cat.label, fullMark: 10 };
      selectedProviders.forEach((id) => {
        const rating = ratings.find((r) => r.providerId === id);
        if (rating) {
          dataPoint[id] = rating.categories[cat.key];
        } else {
          dataPoint[id] = 0;
        }
      });
      return dataPoint;
    });
  }, [ratings, selectedProviders]);

  const selectedData = useMemo(() => {
    return selectedProviders.map((id) => {
      const provider = DOH_PROVIDERS.find((p) => p.id === id);
      return {
        id,
        name: provider?.name ?? id,
        color: provider?.color ?? '#8884d8',
      };
    });
  }, [selectedProviders]);

  const radarRenderOrder = useMemo(() => {
    return [...selectedData].sort((a, b) => {
      if (a.id === hoveredId) return 1;
      if (b.id === hoveredId) return -1;
      return 0;
    });
  }, [selectedData, hoveredId]);

    if (selectedProviders.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] w-full text-muted text-sm">
        Select providers to compare
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ minHeight: '350px' }}>
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          {isInView ? (
            <RadarChart cx="50%" cy="45%" outerRadius="65%" data={chartData}>
              <defs>
                {/* CS2/HLTV style neon glow filter */}
                <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

            <PolarGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#f8fafc',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
              itemStyle={{ fontSize: '13px', fontWeight: 500 }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />

            {radarRenderOrder.map((data, index) => {
              const isHovered = hoveredId === data.id;
              const isOtherHovered = hoveredId !== null && !isHovered;
              
              return (
                <Radar
                  key={data.id}
                  name={data.name}
                  dataKey={data.id}
                  stroke={data.color}
                  strokeWidth={isHovered ? 4 : 2.5}
                  fill={data.color}
                  fillOpacity={isOtherHovered ? 0.05 : isHovered ? 0.5 : 0.25}
                  isAnimationActive={true}
                  animationBegin={index * 200} // Staggered entrance
                  animationDuration={1500}
                  animationEasing="ease-out"
                  style={{
                    filter: isOtherHovered ? 'none' : 'url(#neon-glow)',
                    transition: 'fill-opacity 0.3s ease, stroke-width 0.3s ease',
                  }}
                />
              );
            })}
          </RadarChart>
          ) : null}
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="absolute -bottom-2 left-0 right-0 flex flex-wrap justify-center gap-4">
        {selectedData.map((data) => (
          <div 
            key={data.id} 
            className="flex items-center gap-2 text-xs font-medium text-secondary bg-surface-800 px-2.5 py-1 rounded-full border border-surface-600 cursor-pointer transition-colors hover:text-white"
            onMouseEnter={() => setHoveredId(data.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: data.color, color: data.color }}
            />
            {data.name}
          </div>
        ))}
      </div>
    </div>
  );
}
