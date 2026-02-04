import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export type HIDAction = 'BUY_MARKET' | 'SELL_MARKET' | 'CANCEL_ALL' | 'TOGGLE_RISK_VIEW' | 'ACTIVATE_AI';

interface KeyMapping {
  [key: string]: HIDAction;
}

// Simulated Elgato Stream Deck Layout (3x5) or similar
const DEFAULT_MAPPING: KeyMapping = {
  '1,0': 'BUY_MARKET',      // Button 1
  '1,1': 'SELL_MARKET',     // Button 2
  '2,0': 'CANCEL_ALL',      // Button 3 (Red)
  '0,0': 'TOGGLE_RISK_VIEW',
  '0,4': 'ACTIVATE_AI',
};

export const useWebHID = (onAction: (action: HIDAction) => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<string | null>(null);

  // Mock HID connection for demo environment
  const connectDevice = async () => {
    try {
      // In a real environment:
      // const devices = await navigator.hid.requestDevice({ filters: [] });
      // if (devices.length > 0) { ... }
      
      // Simulating connection delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsConnected(true);
      setDeviceName("Elgato Stream Deck XL (Simulated)");
      toast.success("外部交易键盘已连接", {
        description: "Elgato Stream Deck XL - 映射方案: HighFreq_V2",
        icon: "🎹"
      });
    } catch (err) {
      console.error(err);
      toast.error("无法连接 HID 设备");
    }
  };

  const disconnectDevice = () => {
    setIsConnected(false);
    setDeviceName(null);
    toast.info("设备已断开连接");
  };

  // Simulation function for UI testing since we don't have physical hardware
  const simulateKeyPress = useCallback((buttonId: string) => {
    if (!isConnected) {
      toast.warning("请先连接硬件设备");
      return;
    }

    setLastInput(buttonId);
    
    // Visual feedback simulation
    if (navigator.vibrate) navigator.vibrate(50);

    const action = DEFAULT_MAPPING[buttonId];
    if (action) {
      console.log(`[WebHID] Mapped input ${buttonId} to action ${action}`);
      onAction(action);
    } else {
      console.warn(`[WebHID] Unmapped input: ${buttonId}`);
    }
  }, [isConnected, onAction]);

  return {
    isConnected,
    deviceName,
    lastInput,
    connectDevice,
    disconnectDevice,
    simulateKeyPress
  };
};
