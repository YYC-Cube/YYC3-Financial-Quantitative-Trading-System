import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export const useMultiScreenSync = (channelName: string, onMessage: (data: any) => void) => {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const bc = new BroadcastChannel(channelName);
    channelRef.current = bc;
    
    bc.onmessage = (event) => {
      // console.log(`[MultiScreen] Received:`, event.data);
      onMessage(event.data);
    };

    return () => {
      bc.close();
    };
  }, [channelName]); // Intentionally omitting onMessage from deps to avoid reconnect loops if handler changes

  const broadcast = useCallback((type: string, payload: any) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type, payload, timestamp: Date.now() });
    }
  }, []);

  return { broadcast };
};
