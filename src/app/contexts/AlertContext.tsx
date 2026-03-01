import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface Alert {
  id: string;
  type: 'price' | 'volume' | 'technical' | 'system' | 'risk' | 'model';
  symbol: string;
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  source?: string; // originating module
}

export type ThresholdMetric = 'price' | 'change' | 'volume_spike' | 'rsi' | 'drawdown' | 'var' | 'cpu' | 'latency' | 'accuracy';

export interface AlertThreshold {
  id: string;
  symbol: string;          // asset symbol or '__system__' for system metrics
  metric: ThresholdMetric;
  condition: 'above' | 'below';
  value: number;
  enabled: boolean;
  cooldownMs: number;      // minimum ms between repeat triggers
  lastTriggered?: number;  // timestamp of last trigger
}

// Human-readable labels for metrics
export const METRIC_LABELS: Record<ThresholdMetric, string> = {
  price: '价格',
  change: '涨跌幅(%)',
  volume_spike: '量能异动(x)',
  rsi: 'RSI指标',
  drawdown: '回撤(%)',
  var: 'VaR风险值',
  cpu: 'CPU使用率(%)',
  latency: '网络延迟(ms)',
  accuracy: '模型精度(%)',
};

export const METRIC_ICONS: Record<ThresholdMetric, string> = {
  price: '💲',
  change: '📊',
  volume_spike: '📈',
  rsi: '🔄',
  drawdown: '📉',
  var: '🛡️',
  cpu: '🖥️',
  latency: '🌐',
  accuracy: '🤖',
};

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAlerts: () => void;
  thresholds: AlertThreshold[];
  addThreshold: (t: Omit<AlertThreshold, 'id'>) => void;
  updateThreshold: (id: string, updates: Partial<AlertThreshold>) => void;
  removeThreshold: (id: string) => void;
  toggleThreshold: (id: string) => void;
  checkAndTrigger: (data: ThresholdCheckData) => void;
}

// Data shape for threshold checking
export interface ThresholdCheckData {
  marketPrices: Record<string, number>;    // symbol -> price
  marketChanges: Record<string, number>;   // symbol -> change%
  marketVolumeSpikes: Record<string, number>; // symbol -> volume spike multiplier (1.0 = normal)
  marketRSI: Record<string, number>;       // symbol -> RSI value (0-100)
  systemCpu: number;
  systemLatency: number;
  riskDrawdown: number;
  riskVar95: number;
  modelAccuracy: number;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

let nextId = 1;
function genId() {
  return `alert_${Date.now()}_${nextId++}`;
}
function genThresholdId() {
  return `th_${Date.now()}_${nextId++}`;
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Load thresholds from localStorage on mount, fallback to defaults
  const [thresholds, setThresholds] = useState<AlertThreshold[]>(() => {
    try {
      const stored = localStorage.getItem('yyc_alert_thresholds');
      if (stored) {
        const parsed = JSON.parse(stored) as AlertThreshold[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* ignore parse errors */ }
    return [
      { id: 'th_default_1', symbol: 'BTC/USDT', metric: 'price', condition: 'above', value: 100000, enabled: true, cooldownMs: 60000 },
      { id: 'th_default_2', symbol: 'BTC/USDT', metric: 'change', condition: 'above', value: 5, enabled: true, cooldownMs: 120000 },
      { id: 'th_default_3', symbol: '__system__', metric: 'cpu', condition: 'above', value: 80, enabled: true, cooldownMs: 30000 },
      { id: 'th_default_4', symbol: 'ETH/USDT', metric: 'price', condition: 'below', value: 2000, enabled: true, cooldownMs: 60000 },
      { id: 'th_default_5', symbol: '__system__', metric: 'latency', condition: 'above', value: 40, enabled: true, cooldownMs: 30000 },
      { id: 'th_default_6', symbol: 'BTC/USDT', metric: 'rsi', condition: 'above', value: 70, enabled: true, cooldownMs: 120000 },
      { id: 'th_default_7', symbol: 'BTC/USDT', metric: 'rsi', condition: 'below', value: 30, enabled: true, cooldownMs: 120000 },
      { id: 'th_default_8', symbol: 'BTC/USDT', metric: 'volume_spike', condition: 'above', value: 3, enabled: true, cooldownMs: 90000 },
      { id: 'th_default_9', symbol: 'ETH/USDT', metric: 'volume_spike', condition: 'above', value: 3, enabled: true, cooldownMs: 90000 },
      { id: 'th_default_10', symbol: 'SOL/USDT', metric: 'rsi', condition: 'above', value: 75, enabled: true, cooldownMs: 120000 },
    ];
  });

  // Persist thresholds to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('yyc_alert_thresholds', JSON.stringify(thresholds));
    } catch (e) { /* ignore storage errors */ }
  }, [thresholds]);

  // Keep a mutable ref for cooldown tracking without causing re-renders
  const cooldownRef = useRef<Record<string, number>>({});

  // === Sound & Vibration for critical alerts ===
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playAlertSound = useCallback((severity: Alert['severity']) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (severity === 'critical') {
        // Urgent double-beep
        osc.frequency.value = 880;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else if (severity === 'warning') {
        // Single soft beep
        osc.frequency.value = 660;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) { /* AudioContext not supported */ }
  }, []);

  const triggerVibration = useCallback((severity: Alert['severity']) => {
    try {
      if ('vibrate' in navigator) {
        if (severity === 'critical') {
          navigator.vibrate([200, 100, 200, 100, 300]); // SOS-like
        } else if (severity === 'warning') {
          navigator.vibrate([150, 50, 150]);
        }
      }
    } catch (e) { /* vibration not supported */ }
  }, []);

  const addAlert = useCallback((newAlert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    const alert: Alert = {
      ...newAlert,
      id: genId(),
      timestamp: new Date(),
      read: false,
    };
    setAlerts(prev => [alert, ...prev].slice(0, 100)); // Keep last 100

    // Sound & vibration for warning/critical
    if (newAlert.severity === 'critical' || newAlert.severity === 'warning') {
      playAlertSound(newAlert.severity);
      triggerVibration(newAlert.severity);
    }
  }, [playAlertSound, triggerVibration]);

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const clearAlerts = () => setAlerts([]);

  const addThreshold = useCallback((t: Omit<AlertThreshold, 'id'>) => {
    setThresholds(prev => [...prev, { ...t, id: genThresholdId() }]);
  }, []);

  const updateThreshold = useCallback((id: string, updates: Partial<AlertThreshold>) => {
    setThresholds(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const removeThreshold = useCallback((id: string) => {
    setThresholds(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleThreshold = useCallback((id: string) => {
    setThresholds(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  }, []);

  // Core threshold checking engine
  const checkAndTrigger = useCallback((data: ThresholdCheckData) => {
    const now = Date.now();

    thresholds.forEach(th => {
      if (!th.enabled) return;

      // Cooldown check
      const lastFired = cooldownRef.current[th.id] || 0;
      if (now - lastFired < th.cooldownMs) return;

      let currentValue: number | undefined;
      let displaySymbol = th.symbol;

      switch (th.metric) {
        case 'price':
          currentValue = data.marketPrices[th.symbol];
          break;
        case 'change':
          currentValue = data.marketChanges[th.symbol];
          break;
        case 'volume_spike':
          currentValue = data.marketVolumeSpikes[th.symbol];
          break;
        case 'rsi':
          currentValue = data.marketRSI[th.symbol];
          break;
        case 'cpu':
          currentValue = data.systemCpu;
          displaySymbol = '系统';
          break;
        case 'latency':
          currentValue = data.systemLatency;
          displaySymbol = '网络';
          break;
        case 'drawdown':
          currentValue = data.riskDrawdown;
          displaySymbol = '组合';
          break;
        case 'var':
          currentValue = Math.abs(data.riskVar95);
          displaySymbol = '风控';
          break;
        case 'accuracy':
          currentValue = data.modelAccuracy;
          displaySymbol = '模型';
          break;
        default:
          return;
      }

      if (currentValue === undefined) return;

      const triggered = th.condition === 'above'
        ? currentValue > th.value
        : currentValue < th.value;

      if (triggered) {
        cooldownRef.current[th.id] = now;

        const condStr = th.condition === 'above' ? '突破上限' : '跌破下限';
        const severity: Alert['severity'] =
          th.metric === 'cpu' || th.metric === 'latency' ? 'warning' :
          th.metric === 'var' || th.metric === 'drawdown' ? 'critical' :
          th.metric === 'volume_spike' ? 'warning' :
          th.metric === 'rsi' ? 'info' : 'warning';
        const type: Alert['type'] =
          th.metric === 'price' || th.metric === 'change' ? 'price' :
          th.metric === 'cpu' || th.metric === 'latency' ? 'system' :
          th.metric === 'var' || th.metric === 'drawdown' ? 'risk' :
          th.metric === 'volume_spike' || th.metric === 'rsi' ? 'technical' : 'technical';

        addAlert({
          type,
          symbol: displaySymbol,
          message: `${METRIC_LABELS[th.metric]} ${condStr}: 当前 ${typeof currentValue === 'number' ? currentValue.toFixed(2) : currentValue}，阈值 ${th.value}`,
          severity,
          source: th.metric === 'cpu' || th.metric === 'latency' ? 'admin' : th.metric === 'var' || th.metric === 'drawdown' ? 'risk' : th.metric === 'volume_spike' || th.metric === 'rsi' ? 'market' : 'market',
        });
      }
    });
  }, [thresholds, addAlert]);

  // Simulated periodic alerts (lower frequency since real checks will happen via bridge)
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.03) {
        addAlert({
          type: 'technical',
          symbol: 'SOL/USDT',
          message: '检测到 RSI 底背离信号 (1H)',
          severity: 'info',
          source: 'market',
        });
      }
      if (rand > 0.97) {
        addAlert({
          type: 'system',
          symbol: '量子计算',
          message: '量子任务 #Q-1847 完成，保真度 99.2%',
          severity: 'info',
          source: 'quantum',
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [addAlert]);

  return (
    <AlertContext.Provider value={{
      alerts, addAlert, markAsRead, markAllAsRead, clearAlerts,
      thresholds, addThreshold, updateThreshold, removeThreshold, toggleThreshold,
      checkAndTrigger,
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlerts must be used within an AlertProvider');
  return context;
};