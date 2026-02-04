import { useCallback } from 'react';

type HapticType = 'success' | 'error' | 'warning' | 'selection' | 'impact' | 'notification';

export const useHaptics = () => {
  const vibrate = useCallback((type: HapticType) => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    switch (type) {
      case 'success':
        // Light double tap
        navigator.vibrate([10, 30, 10]);
        break;
      case 'error':
        // Heavy triple vibration
        navigator.vibrate([50, 100, 50, 100, 50]);
        break;
      case 'warning':
        // Medium double vibration
        navigator.vibrate([30, 50, 30]);
        break;
      case 'selection':
        // Very light tick for UI selection
        navigator.vibrate(5);
        break;
      case 'impact':
        // Single sharp impact
        navigator.vibrate(15);
        break;
      case 'notification':
        // Standard notification pattern
        navigator.vibrate([100, 50, 100]);
        break;
      default:
        break;
    }
  }, []);

  return { triggerHaptic: vibrate };
};
