import * as React from "react";

// Simple performance detection based on device characteristics
export function usePerformance() {
  const [performanceLevel, setPerformanceLevel] = React.useState<'high' | 'medium' | 'low'>('high');
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Check if we're on mobile
    const mobileCheck = window.innerWidth < 768;
    setIsMobile(mobileCheck);
    
    // Simple performance detection
    // In a real app, you might use more sophisticated methods like checking device memory,
    // CPU cores, or running performance benchmarks
    
    // For now, we'll use a simple heuristic:
    // - Mobile devices or devices with less than 4GB RAM -> low performance
    // - Tablets or devices with 4-6GB RAM -> medium performance
    // - Desktops or devices with more than 6GB RAM -> high performance
    
    // Since we can't easily access RAM info in browsers, we'll use screen size as a proxy
    let level: 'high' | 'medium' | 'low' = 'high';
    
    if (mobileCheck) {
      // Mobile devices get lower performance settings
      level = 'low';
    } else if (window.innerWidth < 1024) {
      // Tablets get medium performance settings
      level = 'medium';
    } else {
      // Desktop gets high performance settings
      level = 'high';
    }
    
    setPerformanceLevel(level);
  }, []);

  return {
    performanceLevel,
    isMobile,
    // Disable heavy animations on low performance devices
    disableAnimations: performanceLevel === 'low',
    // Reduce animation complexity on medium/low performance devices
    reduceAnimationComplexity: performanceLevel !== 'high',
    // Use simpler transitions on lower performance devices
    useSimpleTransitions: performanceLevel !== 'high'
  };
}