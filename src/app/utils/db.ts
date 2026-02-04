import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'yyc_trading_db';
const STORE_NAME = 'pending_orders';
const VERSION = 1;

export interface PendingOrder {
  sequenceNumber: number;
  type: string;
  payload: any;
  source: string;
  timestamp: number;
  ttl: number;
  fingerprint?: string;
  signature?: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
}

// PQC Worker Interface
let pqcWorker: Worker | null = null;
const pendingSignatures = new Map<string, { resolve: (sig: string) => void, reject: (err: any) => void }>();

const getWorker = () => {
  if (!pqcWorker) {
    pqcWorker = new Worker(new URL('../workers/pqc.worker.ts', import.meta.url), { type: 'module' });
    pqcWorker.onmessage = (e) => {
      const { id, status, signature, error } = e.data;
      const handler = pendingSignatures.get(id);
      if (handler) {
        if (status === 'success') handler.resolve(signature);
        else handler.reject(error);
        pendingSignatures.delete(id);
      }
    };
  }
  return pqcWorker;
};

const generateDilithiumSignature = (payload: any, timestamp: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    pendingSignatures.set(id, { resolve, reject });
    getWorker().postMessage({ payload, timestamp, id });
  });
};

export const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'sequenceNumber' });
      }
    },
  });
};

export const savePendingOrder = async (order: PendingOrder) => {
  const db = await initDB();
  
  // Apply Dilithium-Sim Signature before persistence
  if (!order.signature) {
    order.signature = await generateDilithiumSignature(order.payload, order.timestamp);
  }
  
  await db.put(STORE_NAME, order);
};

export const getPendingOrders = async (): Promise<PendingOrder[]> => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const deletePendingOrder = async (sequenceNumber: number) => {
  const db = await initDB();
  await db.delete(STORE_NAME, sequenceNumber);
};

export const clearPendingOrders = async () => {
  const db = await initDB();
  await db.clear(STORE_NAME);
};

export const updateOrderStatus = async (sequenceNumber: number, status: PendingOrder['status']) => {
  const db = await initDB();
  const order = await db.get(STORE_NAME, sequenceNumber);
  if (order) {
    order.status = status;
    await db.put(STORE_NAME, order);
  }
};
