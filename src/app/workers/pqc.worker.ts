// Dilithium-Sim Signature Generation Worker
// This runs in a separate thread to avoid blocking the main UI thread during heavy PQC operations

self.onmessage = async (e: MessageEvent) => {
  const { payload, timestamp, id } = e.data;
  
  try {
    const signature = await generateDilithiumSignature(payload, timestamp);
    self.postMessage({ id, status: 'success', signature });
  } catch (error) {
    self.postMessage({ id, status: 'error', error: String(error) });
  }
};

const generateDilithiumSignature = async (payload: any, timestamp: number): Promise<string> => {
  const start = performance.now();

  // In a real PQC scenario, this would use a WASM-based Dilithium implementation
  // Here we simulate the computational overhead and high-entropy signature format
  const data = JSON.stringify(payload) + timestamp;
  
  // Simulate heavy PQC operation (40-70ms)
  // This blocked the main thread before, now it runs here safely
  const processingTime = 40 + Math.random() * 30; 
  
  // Busy wait loop to actually simulate CPU load (blocking this worker thread, not main thread)
  const endWait = performance.now() + processingTime;
  while (performance.now() < endWait) {
    // burning cycles
  }
  
  const b64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let signature = "PQC-DILITHIUM2-";
  for (let i = 0; i < 64; i++) {
    signature += b64Chars.charAt(Math.floor(Math.random() * b64Chars.length));
  }

  const end = performance.now();
  const duration = end - start;
  
  // We can still log from workers (shows in browser console)
  if (duration > 50) {
    console.debug(`[PQC-Worker] Signature generated in ${duration.toFixed(2)}ms (Heavy Load)`);
  } else {
    console.debug(`[PQC-Worker] Signature generated in ${duration.toFixed(2)}ms`);
  }

  return signature;
};
