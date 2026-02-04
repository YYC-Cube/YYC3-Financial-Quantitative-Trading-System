import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Bell } from '@/app/components/SafeIcons';

export interface Alert {
  id: string;
  type: 'price' | 'volume' | 'technical' | 'system';
  symbol: string;
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
}

interface AlertThreshold {
  symbol: string;
  type: 'above' | 'below';
  value: number;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAlerts: () => void;
  thresholds: AlertThreshold[];
  addThreshold: (t: AlertThreshold) => void;
  removeThreshold: (symbol: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([
    { symbol: 'VIX', type: 'above', value: 20 },
    { symbol: 'BTC/USDT', type: 'above', value: 100000 },
  ]);

  const addAlert = useCallback((newAlert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    const alert: Alert = {
      ...newAlert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };
    setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50
    
    // Simple log instead of toast
    console.log(`[Alert] ${alert.symbol}: ${alert.message}`);
  }, []);

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const clearAlerts = () => setAlerts([]);

  const addThreshold = (t: AlertThreshold) => setThresholds(prev => [...prev, t]);
  const removeThreshold = (symbol: string) => setThresholds(prev => prev.filter(t => t.symbol !== symbol));

  // Simulated WebSocket for alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      
      // Simulate Price Breakout
      if (rand < 0.05) {
        addAlert({
          type: 'price',
          symbol: 'ETH/USDT',
          message: '价格突破阻力位 $2,500',
          severity: 'warning'
        });
      }

      // Simulate VIX Threshold check (Mock)
      const mockVix = 18 + Math.random() * 5;
      thresholds.forEach(t => {
        if (t.symbol === 'VIX') {
          if (t.type === 'above' && mockVix > t.value) {
            // Only alert every 30 seconds for threshold to avoid spam
            const lastAlert = alerts.find(a => a.symbol === 'VIX' && (new Date().getTime() - a.timestamp.getTime() < 30000));
            if (!lastAlert) {
              addAlert({
                type: 'system',
                symbol: 'VIX',
                message: `恐慌指数 (VIX) 已突破阈值: ${mockVix.toFixed(2)}`,
                severity: 'critical'
              });
            }
          }
        }
      });

      // Simulate Technical Indicator (RSI Divergence)
      if (rand > 0.98) {
        addAlert({
          type: 'technical',
          symbol: 'SOL/USDT',
          message: '检测到 RSI 底背离信号 (1H)',
          severity: 'info'
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [addAlert, thresholds, alerts]);

  return (
    <AlertContext.Provider value={{ 
      alerts, addAlert, markAsRead, clearAlerts, 
      thresholds, addThreshold, removeThreshold 
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
