import { useState, useEffect, useCallback } from 'react';

export const useBroadcastSync = <T>(channelName: string, initialState: T) => {
  const [state, setState] = useState<T>(initialState);
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  useEffect(() => {
    const bc = new BroadcastChannel(channelName);
    setChannel(bc);

    bc.onmessage = (event) => {
      console.log(`[Broadcast ${channelName}] Received:`, event.data);
      if (event.data && event.data.type === 'STATE_UPDATE') {
        setState(event.data.payload);
      }
    };

    return () => {
      bc.close();
    };
  }, [channelName]);

  const syncState = useCallback((newState: T) => {
    setState(newState);
    if (channel) {
      channel.postMessage({ type: 'STATE_UPDATE', payload: newState });
    }
  }, [channel]);

  return [state, syncState] as const;
};