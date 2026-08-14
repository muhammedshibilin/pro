'use client';

import { useState, useEffect } from 'react';

/**
 * Adaptive device detection hook.
 *
 * Uses window.matchMedia for efficient, event-driven detection (no resize polling).
 * SSR-safe: defaults to desktop during server rendering, then corrects on hydration.
 *
 * Breakpoints:
 *   Mobile:  < 768px
 *   Tablet:  768px – 1023px (uses desktop layout with adjusted spacing)
 *   Desktop: >= 1024px
 */

interface DeviceType {
  /** True when viewport is < 768px */
  isMobile: boolean;
  /** True when viewport is >= 768px and < 1024px */
  isTablet: boolean;
  /** True when viewport is >= 1024px */
  isDesktop: boolean;
  /** True when viewport is >= 768px (desktop OR tablet — uses desktop layout) */
  isDesktopOrTablet: boolean;
}

export function useDeviceType(): DeviceType {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');

    const update = () => {
      setIsMobile(mobileQuery.matches);
      setIsTablet(tabletQuery.matches);
    };

    // Set initial values
    update();

    // Listen for changes
    mobileQuery.addEventListener('change', update);
    tabletQuery.addEventListener('change', update);

    return () => {
      mobileQuery.removeEventListener('change', update);
      tabletQuery.removeEventListener('change', update);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isDesktopOrTablet: !isMobile,
  };
}
