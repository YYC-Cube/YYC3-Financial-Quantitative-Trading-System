/// <reference types="vitest/globals" />

declare global {
  var fetch: typeof globalThis.fetch;
  function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timeout;
  function clearTimeout(timeoutId: NodeJS.Timeout): void;
  function setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timer;
  function clearInterval(timerId: NodeJS.Timer): void;
}

export {};
