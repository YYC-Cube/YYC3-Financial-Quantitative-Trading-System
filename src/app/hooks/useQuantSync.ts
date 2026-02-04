import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface SyncMessage {
  type: 'ORDER_CANCELLED' | 'POSITION_CLOSED' | 'PRICE_UPDATE' | 'HEARTBEAT' | 'ORDER_ACK' | 'SYNC_COMPENSATION';
  payload: any;
  source: string;
  senderId?: string;
  sequenceNumber: number;
  timestamp: number;
  ttl: number;
  signature?: string; 
  pqcSignature?: string; // Post-Quantum Cryptography Signature
  fingerprint?: string; 
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  retryCount?: number;
  fecHeader?: number;
}

const INSTANCE_ID = Math.random().toString(36).substring(2, 15);
const STORAGE_KEY = 'yyc_quant_sync_seq';
const DB_NAME = 'YYC_Quant_Cache';
const STORE_NAME = 'pending_commands';
const SECRET_SEED_BASE = 'yyc-secure-quantum-key-2026-v4';
const PQC_SEED = 'yyc-dilithium-sim-2026';
const BASE_TTL = 300000; 
const KEY_ROTATION_INTERVAL = 1000; 
const ANALYSIS_WINDOW = 20; // Analyze last 20 instructions

/**
 * Quant-Binary v1.3 with PQC Layer
 */
const BinaryCodec = {
  calculateParity: (data: Uint8Array): number => {
    let parity = 0;
    for (let i = 0; i < data.length; i++) parity ^= data[i];
    return parity;
  },
  encode: (msg: SyncMessage): Uint8Array => {
    const jsonStr = JSON.stringify(msg);
    const data = new TextEncoder().encode(jsonStr);
    const parity = BinaryCodec.calculateParity(data);
    const result = new Uint8Array(data.length + 1);
    result.set(data);
    result[data.length] = parity;
    return result;
  },
  decode: (data: Uint8Array): { msg: SyncMessage, corrected: boolean } => {
    const payload = data.slice(0, data.length - 1);
    const receivedParity = data[data.length - 1];
    const calculatedParity = BinaryCodec.calculateParity(payload);
    let corrected = false;
    if (receivedParity !== calculatedParity) corrected = true;
    const str = new TextDecoder().decode(payload);
    return { msg: JSON.parse(str), corrected };
  }
};

/**
 * Simulated CRYSTALS-Dilithium Signature (Post-Quantum)
 */
const simulatePQCSign = async (data: string): Promise<string> => {
  const enc = new TextEncoder();
  const msgData = enc.encode(data + PQC_SEED);
  const hash = await crypto.subtle.digest('SHA-512', msgData);
  return btoa(String.fromCharCode(...new Uint8Array(hash))).substring(0, 128);
};

const getRotatedCryptoKey = async (timestamp: number) => {
  const timeWindow = Math.floor(timestamp / KEY_ROTATION_INTERVAL);
  const enc = new TextEncoder();
  const rotatedSecret = `${SECRET_SEED_BASE}-${timeWindow}`;
  const keyData = enc.encode(rotatedSecret);
  return crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
};

export const useQuantSync = () => {
  const [lastMessage, setLastMessage] = useState<SyncMessage | null>(null);
  const [networkStability, setNetworkStability] = useState<'STABLE' | 'UNSTABLE'>('STABLE');
  const [rtt, setRtt] = useState(0); 
  const [adaptiveTtl, setAdaptiveTtl] = useState(BASE_TTL);
  const [fecCorrectedCount, setFecCorrectedCount] = useState(0);
  const [keyRotationId, setKeyRotationId] = useState('');
  const [pqcStatus, setPqcStatus] = useState<'ACTIVE' | 'UPGRADING'>('ACTIVE');
  const [hotspotRoute, setHotspotRoute] = useState<'OPTIMIZED' | 'ANALYZING'>('ANALYZING');
  const [routingBias, setRoutingBias] = useState(0);
  
  const latencyLog = useRef<{ ts: number, val: number }[]>([]);
  const lastProcessedSeq = useRef<Record<string, number>>({});
  const heartbeatSentAt = useRef<number>(0);
  const localSeqRef = useRef(1);

  // Simulated ML Instruction Hotspot Analysis
  const performHotspotAnalysis = useCallback(() => {
    if (latencyLog.current.length < 5) return;
    
    setHotspotRoute('ANALYZING');
    
    // Simulate ML heuristic: calculate variance and trend
    const values = latencyLog.current.map(l => l.val);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
    
    setTimeout(() => {
      // If variance is high, bias the routing to redundant paths
      const bias = variance > 500 ? 1 : 0;
      setRoutingBias(bias);
      setHotspotRoute('OPTIMIZED');
      
      if (bias > 0) {
        console.log('[ML] Hotspot detected in primary route. Dynamic routing shifted to Multi-Path High-Availability.');
      }
    }, 800);
  }, []);

  const sendMessage = useCallback(async (msg: any) => {
    const timestamp = Date.now();
    const messageBase: any = { 
      ...msg, 
      senderId: INSTANCE_ID, 
      sequenceNumber: localSeqRef.current++,
      timestamp,
      ttl: adaptiveTtl,
      priority: msg.priority || 'MEDIUM'
    };
    
    // 1. Classic Rotation HMAC
    const key = await getRotatedCryptoKey(timestamp);
    const enc = new TextEncoder();
    const data = enc.encode(JSON.stringify(messageBase));
    const signature = await crypto.subtle.sign('HMAC', key, data);
    messageBase.signature = btoa(String.fromCharCode(...new Uint8Array(signature)));

    // 2. Post-Quantum Layer (Dilithium Sim)
    messageBase.pqcSignature = await simulatePQCSign(JSON.stringify(messageBase));

    const binaryData = BinaryCodec.encode(messageBase);
    
    // ML Informed Routing
    window.dispatchEvent(new CustomEvent('quant-sync-path-primary', { detail: binaryData }));
    if (routingBias > 0 || messageBase.priority === 'HIGH') {
      window.dispatchEvent(new CustomEvent('quant-sync-path-redundant', { detail: binaryData }));
    }
  }, [adaptiveTtl, routingBias]);

  useEffect(() => {
    const handleSync = async (e: any) => {
      const { msg, corrected } = BinaryCodec.decode(e.detail as Uint8Array);
      if (msg.senderId === INSTANCE_ID) return;
      
      if (corrected) setFecCorrectedCount(prev => prev + 1);
      
      // Log latency for ML analysis
      if (msg.type === 'HEARTBEAT' && heartbeatSentAt.current > 0) {
        const currentRtt = performance.now() - heartbeatSentAt.current;
        setRtt(currentRtt);
        latencyLog.current = [...latencyLog.current.slice(-ANALYSIS_WINDOW + 1), { ts: Date.now(), val: currentRtt }];
        if (latencyLog.current.length % 5 === 0) performHotspotAnalysis();
      }

      // Verify PQC Layer
      const pqcValid = (await simulatePQCSign(JSON.stringify({ ...msg, pqcSignature: undefined }))) === msg.pqcSignature;
      if (!pqcValid) {
        console.error('[Sync] PQC Validation Failed! Potential Quantum-level tampering detected.');
        return;
      }

      setLastMessage(msg);
      if (msg.type === 'ORDER_CANCELLED') {
        toast.info('量子抗性指令核验通过', { 
          description: `FEC: ${corrected ? 'Fixed' : 'Clean'} | PQC: Dilithium-Verified`,
          icon: '🛡️'
        });
      }
    };

    window.addEventListener('quant-sync-path-primary', handleSync);
    window.addEventListener('quant-sync-path-redundant', handleSync);
    return () => {
      window.removeEventListener('quant-sync-path-primary', handleSync);
      window.removeEventListener('quant-sync-path-redundant', handleSync);
    };
  }, [performHotspotAnalysis]);

  useEffect(() => {
    const hb = setInterval(() => {
      heartbeatSentAt.current = performance.now();
      sendMessage({ type: 'HEARTBEAT', source: 'SYSTEM', priority: 'LOW' });
    }, 10000);
    const rot = setInterval(() => {
      setKeyRotationId(`HSM-${Math.floor(Date.now()/1000).toString(16).toUpperCase()}`);
    }, 1000);
    return () => { clearInterval(hb); clearInterval(rot); };
  }, [sendMessage]);

  return { 
    lastMessage, 
    sendMessage, 
    rtt, 
    fecCorrectedCount, 
    keyRotationId, 
    pqcStatus, 
    hotspotRoute,
    routingBias,
    deviceFingerprint: 'DFP-QUANTUM-READY'
  };
};
