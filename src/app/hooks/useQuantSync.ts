import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface SyncMessage {
  type: 'ORDER_CANCELLED' | 'POSITION_CLOSED' | 'PRICE_UPDATE' | 'HEARTBEAT' | 'ORDER_ACK' | 'SYNC_COMPENSATION';
  payload: any;
  source: string;
  senderId?: string;
  sequenceNumber: number;
  timestamp: number;
  ttl: number; // Time-to-live in milliseconds
  signature?: string; 
}

const INSTANCE_ID = Math.random().toString(36).substring(2, 15);
const STORAGE_KEY = 'yyc_quant_sync_seq';
const DB_NAME = 'YYC_Quant_Cache';
const STORE_NAME = 'pending_commands';
const SECRET_SEED = 'yyc-secure-quantum-key-2026-v2';
const DEFAULT_TTL = 300000; // 5 minutes

// Web Crypto API Helpers
const getCryptoKey = async () => {
  const enc = new TextEncoder();
  const keyData = enc.encode(SECRET_SEED);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
};

const signMessage = async (msg: Omit<SyncMessage, 'signature'>): Promise<string> => {
  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const data = enc.encode(JSON.stringify(msg));
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
};

const verifySignature = async (msg: SyncMessage): Promise<boolean> => {
  if (!msg.signature) return false;
  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const { signature, ...rest } = msg;
    const data = enc.encode(JSON.stringify(rest));
    const sigArray = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', key, sigArray, data);
  } catch (e) {
    return false;
  }
};

// IndexedDB Utility
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'sequenceNumber' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const useQuantSync = () => {
  const [lastMessage, setLastMessage] = useState<SyncMessage | null>(null);
  const [activePeers, setActivePeers] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingList, setPendingList] = useState<SyncMessage[]>([]);
  const lastProcessedSeq = useRef<Record<string, number>>({});
  
  const getInitialSeq = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 1;
  };

  const localSeqRef = useRef(getInitialSeq());

  const saveLocalSeq = (seq: number) => {
    localSeqRef.current = seq;
    localStorage.setItem(STORAGE_KEY, seq.toString());
  };

  const refreshPendingStatus = useCallback(async () => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result as SyncMessage[];
      setPendingCount(all.length);
      setPendingList(all.sort((a, b) => a.sequenceNumber - b.sequenceNumber));
    };
  }, []);

  const broadcast = useCallback((message: SyncMessage) => {
    const event = new CustomEvent('quant-sync-broadcast', { detail: message });
    window.dispatchEvent(event);
  }, []);

  const sendMessage = useCallback(async (msg: Omit<SyncMessage, 'senderId' | 'sequenceNumber' | 'signature' | 'timestamp' | 'ttl'> & { sequenceNumber?: number, ttl?: number }) => {
    const seq = msg.sequenceNumber || localSeqRef.current;
    
    const messageBase: Omit<SyncMessage, 'signature'> = { 
      ...msg, 
      senderId: INSTANCE_ID, 
      sequenceNumber: seq,
      timestamp: Date.now(),
      ttl: msg.ttl || DEFAULT_TTL
    };
    
    const signature = await signMessage(messageBase);
    const signedMessage: SyncMessage = { ...messageBase, signature };
    
    if (!msg.sequenceNumber) {
      saveLocalSeq(seq + 1);
    }

    if (!navigator.onLine) {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(signedMessage);
      await refreshPendingStatus();
      toast.warning('指令已进入离线队列', {
        description: `Seq: ${seq} 将在网络恢复且未过期时补偿`,
        position: 'top-center'
      });
      return;
    }
    
    broadcast(signedMessage);
  }, [broadcast, refreshPendingStatus]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = async () => {
        const pending = request.result as SyncMessage[];
        if (pending.length === 0) return;

        const now = Date.now();
        const validMessages = pending.filter(m => (now - m.timestamp) < m.ttl);
        const expiredCount = pending.length - validMessages.length;

        if (expiredCount > 0) {
          toast.error(`已熔断 ${expiredCount} 条过期指令`, {
            description: '超过 5 分钟的离线指令已被自动作废（TTL 熔断）',
          });
        }

        if (validMessages.length > 0) {
          toast.promise(
            (async () => {
              for (const msg of validMessages) {
                broadcast({ ...msg, type: 'SYNC_COMPENSATION' });
                await new Promise(r => setTimeout(r, 200));
              }
              const deleteTx = db.transaction(STORE_NAME, 'readwrite');
              deleteTx.objectStore(STORE_NAME).clear();
              await refreshPendingStatus();
            })(),
            {
              loading: '正在执行离线指令同步补偿...',
              success: `补偿同步完成: ${validMessages.length} 条指令已上云`,
              error: '同步补偿失败',
            }
          );
        } else {
          const deleteTx = db.transaction(STORE_NAME, 'readwrite');
          deleteTx.objectStore(STORE_NAME).clear();
          await refreshPendingStatus();
        }
      };
    };

    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    refreshPendingStatus(); // Initial load
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [broadcast, refreshPendingStatus]);

  // Heartbeat
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      sendMessage({
        type: 'HEARTBEAT',
        payload: { timestamp: Date.now() },
        source: 'SYSTEM',
        sequenceNumber: localSeqRef.current
      });
    }, 15000);
    return () => clearInterval(heartbeatInterval);
  }, [sendMessage]);

  useEffect(() => {
    const handleBroadcast = async (e: any) => {
      const msg = e.detail as SyncMessage;
      if (msg.senderId === INSTANCE_ID) return;
      
      const isValid = await verifySignature(msg);
      if (!isValid) {
        toast.error('检测到非安全指令', { description: '签名校验失败（HSM 级拦截）' });
        return;
      }

      // Check TTL for received messages as well
      if ((Date.now() - msg.timestamp) > msg.ttl) {
        console.warn('[Sync] Received expired message, dropping.');
        return;
      }

      const senderKey = msg.senderId || msg.source;
      const lastSeq = lastProcessedSeq.current[senderKey] || 0;
      
      if (msg.type === 'HEARTBEAT') {
        setActivePeers(prev => {
          if (prev.has(senderKey)) return prev;
          const next = new Set(prev);
          next.add(senderKey);
          return next;
        });
        return;
      }

      if (msg.sequenceNumber <= lastSeq && msg.type !== 'ORDER_ACK') return;
      
      lastProcessedSeq.current[senderKey] = msg.sequenceNumber;
      setLastMessage(msg);
      
      if (msg.type === 'ORDER_CANCELLED' || msg.type === 'SYNC_COMPENSATION') {
        toast.info(msg.type === 'SYNC_COMPENSATION' ? '指令补偿同步' : '多端同步: SOS 指令', {
          description: `来自 ${msg.source} (Seq: ${msg.sequenceNumber})`,
          position: 'top-center'
        });
      }

      if (msg.type === 'ORDER_ACK') {
        toast.success(`指令确认回执 (ACK)`, {
          description: `柜台已确认指令 Seq: ${msg.sequenceNumber}`,
          icon: '✅',
          position: 'top-center'
        });
      }
    };

    window.addEventListener('quant-sync-broadcast', handleBroadcast);
    return () => window.removeEventListener('quant-sync-broadcast', handleBroadcast);
  }, []);

  return { 
    lastMessage, 
    sendMessage, 
    currentSeq: localSeqRef.current,
    activePeersCount: activePeers.size,
    isOnline,
    pendingCount,
    pendingList
  };
};
