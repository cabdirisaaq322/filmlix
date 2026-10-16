'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AdContainerProps {
  slot: 'header' | 'sidebar' | 'footer' | 'player-top' | 'player-bottom';
  className?: string;
  children?: React.ReactNode;
}

const AD_SLOT_CONFIG: Record<string, { width: string; height: string; dataZone?: string }> = {
  header: { width: '100%', height: '90px', dataZone: 'header-banner' },
  sidebar: { width: '300px', height: '250px', dataZone: 'sidebar-banner' },
  footer: { width: '100%', height: '90px', dataZone: 'footer-banner' },
  'player-top': { width: '100%', height: '90px', dataZone: 'player-top-banner' },
  'player-bottom': { width: '100%', height: '90px', dataZone: 'player-bottom-banner' },
};

export function AdContainer({ slot, className, children }: AdContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const config = AD_SLOT_CONFIG[slot];

  useEffect(() => {
    if (!containerRef.current) return;

    const initAd = () => {
      // Monetag / Adsterra integration point
      // Replace with your actual ad network code
      
      // Example Monetag:
      // (window as any).monetag = (window as any).monetag || [];
      // (window as any).monetag.push({
      //   zone: YOUR_ZONE_ID,
      //   container: containerRef.current,
      //   format: 'banner',
      // });

      // Example Adsterra:
      // const script = document.createElement('script');
      // script.src = 'https://www.highperformanceformat.com/zone.js';
      // script.dataset.zone = 'YOUR_ZONE_ID';
      // script.async = true;
      // containerRef.current?.appendChild(script);

      // VAST Video Ad Example:
      // const vastScript = document.createElement('script');
      // vastScript.src = 'https://your-vast-server.com/vast.js';
      // vastScript.dataset.zone = 'YOUR_ZONE_ID';
      // document.body.appendChild(vastScript);
    };

    initAd();
  }, [slot]);

  if (children) {
    return (
      <div
        ref={containerRef}
        className={cn('relative', className)}
        style={{ width: config.width, height: config.height }}
        role="complementary"
        aria-label="Advertisement"
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center',
        className
      )}
      style={{ width: config.width, height: config.height, minWidth: config.width, minHeight: config.height }}
      role="complementary"
      aria-label="Advertisement"
      data-ad-slot={config.dataZone}
    >
      <div className="text-slate-500 text-xs px-2 text-center">
        Ad Slot: {slot}
        <br />
        ({config.width} × {config.height})
      </div>
      {/* 
        INSERT YOUR AD NETWORK CODE HERE
        
        Examples:
        
        1. Monetag Banner:
        <script async src="https://cdn.monetag.com/banner.js" data-zone="YOUR_ZONE_ID"></script>
        
        2. Adsterra:
        <script async src="https://www.highperformanceformat.com/zone.js" data-zone="YOUR_ZONE_ID"></script>
        
        3. VAST Video Pre-roll (for player):
        <script>
          window.vastPlayer = new VastPlayer({
            zoneId: 'YOUR_ZONE_ID',
            container: '#player-container',
            onAdEnd: () => startContent()
          });
        </script>
      */}
    </div>
  );
}