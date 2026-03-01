import { useEffect, useRef } from 'react';
import { useGlobalData } from '@/app/contexts/GlobalDataContext';
import { useAlerts, ThresholdCheckData } from '@/app/contexts/AlertContext';

/**
 * DataAlertBridge — a renderless component that sits inside both
 * GlobalDataProvider and AlertProvider to bridge live data into
 * the threshold checking engine.
 *
 * It periodically collects data from GlobalDataContext and calls
 * AlertContext.checkAndTrigger() to evaluate thresholds against
 * live values. This avoids circular dependency between the two
 * contexts while enabling real-time automated alerting.
 *
 * v2: Also pushes critical/warning alerts to Service Worker for
 * native OS notifications when the app is backgrounded.
 */
export function DataAlertBridge() {
  const { marketData, riskMetrics, systemMetrics, modelMetrics, account, setAlertCount } = useGlobalData();
  const { checkAndTrigger, alerts } = useAlerts();
  const lastCheckRef = useRef(0);
  const prevAlertCountRef = useRef(0);
  // Persistent simulated RSI and volume spike state (seeded per symbol, drifts over time)
  const rsiStateRef = useRef<Record<string, number>>({});
  const volSpikeStateRef = useRef<Record<string, number>>({});

  // Sync unread alert count to GlobalData for Navbar badge
  useEffect(() => {
    const unread = alerts.filter(a => !a.read).length;
    setAlertCount(unread);

    // Push new critical/warning alerts to Service Worker for native notification
    if (alerts.length > prevAlertCountRef.current) {
      const newAlerts = alerts.slice(0, alerts.length - prevAlertCountRef.current);
      newAlerts.forEach(alert => {
        if ((alert.severity === 'critical' || alert.severity === 'warning') && !alert.read) {
          pushToServiceWorker(alert.symbol, alert.message, alert.severity);
        }
      });
    }
    prevAlertCountRef.current = alerts.length;
  }, [alerts, setAlertCount]);

  // Periodically check thresholds against live data
  useEffect(() => {
    const now = Date.now();
    // Throttle: check at most every 5 seconds
    if (now - lastCheckRef.current < 5000) return;
    lastCheckRef.current = now;

    // Build the check data from GlobalData
    const marketPrices: Record<string, number> = {};
    const marketChanges: Record<string, number> = {};
    const marketVolumeSpikes: Record<string, number> = {};
    const marketRSI: Record<string, number> = {};

    marketData.forEach(asset => {
      marketPrices[asset.symbol] = asset.price;
      marketChanges[asset.symbol] = asset.change;

      // Simulate volume spike multiplier (1.0 = normal, >2.0 = spike)
      // Drift from previous value with occasional spikes
      const prevSpike = volSpikeStateRef.current[asset.symbol] ?? 1.0;
      const spikeDrift = (Math.random() - 0.48) * 0.15;
      const spikeJump = Math.random() > 0.95 ? (Math.random() * 2.5) : 0; // rare large spike
      const newSpike = Math.max(0.3, Math.min(5.0, prevSpike + spikeDrift + spikeJump));
      volSpikeStateRef.current[asset.symbol] = newSpike;
      marketVolumeSpikes[asset.symbol] = +newSpike.toFixed(2);

      // Simulate RSI (0-100) — mean-reverting random walk around 50
      const prevRSI = rsiStateRef.current[asset.symbol] ?? (45 + Math.random() * 20);
      const rsiDrift = (Math.random() - 0.5) * 4 + (50 - prevRSI) * 0.05; // mean-revert to 50
      const newRSI = Math.max(5, Math.min(95, prevRSI + rsiDrift));
      rsiStateRef.current[asset.symbol] = newRSI;
      marketRSI[asset.symbol] = +newRSI.toFixed(1);
    });

    const data: ThresholdCheckData = {
      marketPrices,
      marketChanges,
      marketVolumeSpikes,
      marketRSI,
      systemCpu: systemMetrics.cpuUsage,
      systemLatency: systemMetrics.networkLatency,
      riskDrawdown: Math.abs(riskMetrics.maxDrawdown),
      riskVar95: riskMetrics.portfolioVaR95,
      modelAccuracy: modelMetrics.avgAccuracy,
    };

    checkAndTrigger(data);
  }, [marketData, riskMetrics, systemMetrics, modelMetrics, checkAndTrigger]);

  // This component renders nothing
  return null;
}

/** Push alert to Service Worker for native OS notification */
function pushToServiceWorker(symbol: string, message: string, severity: string) {
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Only show native notification if permission granted and document is hidden
      if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: `[${symbol}] ${severity === 'critical' ? '紧急预警' : '风控提醒'}`,
          body: message,
          severity,
        });
      }
    }
  } catch (e) {
    // Silently fail - notifications are optional enhancement
  }
}