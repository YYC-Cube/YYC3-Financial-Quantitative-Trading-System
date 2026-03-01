// ================================================================
// YYC-QATS Frontend Analytics Service
// ================================================================
// Lightweight, privacy-respecting usage tracking for H1-E2 experiment
// - No PII collection (uses random session IDs)
// - All data stored in localStorage (no external transmission)
// - User can view/export/clear data from Admin module
// - Daily rotation to prevent storage overflow
// ================================================================

export type EventType =
  | 'module_view'      // Switched to a module
  | 'sub_view'         // Switched to a sub-page
  | 'tertiary_view'    // Switched to a tertiary tab
  | 'cross_nav'        // Used CrossModuleBar or navigateTo()
  | 'feature_use'      // Used a specific feature (e.g. add alert, run backtest)
  | 'kline_interact'   // Interacted with K-line chart (timeframe change, indicator toggle)
  | 'watchlist_action'  // Watchlist add/remove/reorder
  | 'alert_trigger'    // Alert threshold triggered
  | 'data_source'      // Data source status change (live/sim)
  | 'session_start'    // Session began
  | 'session_end';     // Session ended (beforeunload)

export interface AnalyticsEvent {
  type: EventType;
  payload: Record<string, string | number | boolean>;
  timestamp: number;
  sessionId: string;
  moduleContext: string;   // Which module the user was in when event fired
}

export interface SessionSummary {
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number;       // ms
  moduleViews: Record<string, number>;   // module → view count
  moduleDwell: Record<string, number>;   // module → total dwell time ms
  subViews: Record<string, number>;      // "module/sub" → view count
  crossNavCount: number;
  featureUseCount: number;
  totalEvents: number;
  uniqueModules: number;
}

// Storage key prefix
const STORAGE_PREFIX = 'yyc_analytics_';
const MAX_EVENTS_PER_DAY = 5000;
const MAX_DAYS_RETAINED = 30;

class AnalyticsServiceImpl {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private sessionStart: number;
  private currentModule = 'market';
  private moduleEnterTime = Date.now();
  private moduleDwell: Record<string, number> = {};
  private initialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
  }

  // ── Initialization ──
  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Load today's events from storage
    this.loadToday();

    // Track session start
    this.track('session_start', { userAgent: navigator.userAgent.slice(0, 80) });

    // Track session end on page unload
    const handleUnload = () => {
      this.flushModuleDwell();
      this.track('session_end', {
        duration: Date.now() - this.sessionStart,
        totalEvents: this.events.length,
      });
      this.persist();
    };

    window.addEventListener('beforeunload', handleUnload);

    // Periodic persistence (every 30s)
    setInterval(() => this.persist(), 30000);

    // Clean up old data
    this.rotateStorage();
  }

  // ── Core Tracking ──
  track(type: EventType, payload: Record<string, string | number | boolean> = {}): void {
    if (this.events.length >= MAX_EVENTS_PER_DAY) return;

    const event: AnalyticsEvent = {
      type,
      payload,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      moduleContext: this.currentModule,
    };

    this.events.push(event);
  }

  // ── Module Navigation Tracking ──
  trackModuleChange(fromModule: string, toModule: string): void {
    // Record dwell time for the previous module
    const dwellMs = Date.now() - this.moduleEnterTime;
    this.moduleDwell[fromModule] = (this.moduleDwell[fromModule] || 0) + dwellMs;

    this.currentModule = toModule;
    this.moduleEnterTime = Date.now();

    this.track('module_view', {
      from: fromModule,
      to: toModule,
      dwellMs,
    });
  }

  trackSubChange(module: string, fromSub: string, toSub: string): void {
    this.track('sub_view', {
      module,
      from: fromSub,
      to: toSub,
    });
  }

  trackTertiaryChange(module: string, sub: string, tertiary: string): void {
    this.track('tertiary_view', { module, sub, tertiary });
  }

  trackCrossNav(fromModule: string, toModule: string, toSub: string, source: string): void {
    this.track('cross_nav', {
      from: fromModule,
      to: toModule,
      toSub,
      source, // 'crossbar' | 'navigateTo' | 'summary_card'
    });
  }

  trackFeatureUse(feature: string, details: Record<string, string | number | boolean> = {}): void {
    this.track('feature_use', { feature, ...details });
  }

  trackKLineInteraction(action: string, value: string): void {
    this.track('kline_interact', { action, value });
  }

  trackWatchlistAction(action: 'add' | 'remove' | 'reorder' | 'search', symbol?: string): void {
    this.track('watchlist_action', { action, symbol: symbol || '' });
  }

  trackDataSourceChange(status: string): void {
    this.track('data_source', { status });
  }

  // ── Analysis Helpers ──
  getSessionSummary(): SessionSummary {
    this.flushModuleDwell();

    const moduleViews: Record<string, number> = {};
    const subViews: Record<string, number> = {};
    let crossNavCount = 0;
    let featureUseCount = 0;

    for (const event of this.events) {
      if (event.sessionId !== this.sessionId) continue;

      if (event.type === 'module_view') {
        const mod = event.payload.to as string;
        moduleViews[mod] = (moduleViews[mod] || 0) + 1;
      }
      if (event.type === 'sub_view') {
        const key = `${event.payload.module}/${event.payload.to}`;
        subViews[key] = (subViews[key] || 0) + 1;
      }
      if (event.type === 'cross_nav') crossNavCount++;
      if (event.type === 'feature_use') featureUseCount++;
    }

    return {
      sessionId: this.sessionId,
      startTime: this.sessionStart,
      endTime: Date.now(),
      duration: Date.now() - this.sessionStart,
      moduleViews,
      moduleDwell: { ...this.moduleDwell },
      subViews,
      crossNavCount,
      featureUseCount,
      totalEvents: this.events.filter(e => e.sessionId === this.sessionId).length,
      uniqueModules: Object.keys(moduleViews).length,
    };
  }

  // Get all-time module heatmap data (aggregated across all stored days)
  getModuleHeatmap(): { module: string; views: number; dwellMinutes: number }[] {
    const allEvents = this.getAllStoredEvents();
    const moduleStats: Record<string, { views: number; dwell: number }> = {};

    for (const event of allEvents) {
      if (event.type === 'module_view') {
        const mod = event.payload.to as string;
        if (!moduleStats[mod]) moduleStats[mod] = { views: 0, dwell: 0 };
        moduleStats[mod].views++;
        moduleStats[mod].dwell += (event.payload.dwellMs as number) || 0;
      }
    }

    return Object.entries(moduleStats)
      .map(([module, stats]) => ({
        module,
        views: stats.views,
        dwellMinutes: +(stats.dwell / 60000).toFixed(1),
      }))
      .sort((a, b) => b.views - a.views);
  }

  // Get cross-module transition matrix
  getCrossModuleMatrix(): { from: string; to: string; count: number }[] {
    const allEvents = this.getAllStoredEvents();
    const matrix: Record<string, number> = {};

    for (const event of allEvents) {
      if (event.type === 'module_view' || event.type === 'cross_nav') {
        const from = (event.payload.from as string) || '';
        const to = (event.payload.to as string) || '';
        if (from && to && from !== to) {
          const key = `${from}→${to}`;
          matrix[key] = (matrix[key] || 0) + 1;
        }
      }
    }

    return Object.entries(matrix)
      .map(([key, count]) => {
        const [from, to] = key.split('→');
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count);
  }

  // Get daily activity summary
  getDailyStats(): { date: string; events: number; sessions: number; uniqueModules: number }[] {
    const days: Record<string, { events: number; sessions: Set<string>; modules: Set<string> }> = {};

    for (const event of this.getAllStoredEvents()) {
      const date = new Date(event.timestamp).toISOString().slice(0, 10);
      if (!days[date]) days[date] = { events: 0, sessions: new Set(), modules: new Set() };
      days[date].events++;
      days[date].sessions.add(event.sessionId);
      if (event.type === 'module_view') {
        days[date].modules.add(event.payload.to as string);
      }
    }

    return Object.entries(days)
      .map(([date, stats]) => ({
        date,
        events: stats.events,
        sessions: stats.sessions.size,
        uniqueModules: stats.modules.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // ── Export / Import ──
  exportJSON(): string {
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      events: this.getAllStoredEvents(),
      summary: {
        totalEvents: this.getAllStoredEvents().length,
        moduleHeatmap: this.getModuleHeatmap(),
        crossModuleMatrix: this.getCrossModuleMatrix(),
        dailyStats: this.getDailyStats(),
      },
    }, null, 2);
  }

  downloadExport(): void {
    const json = this.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yyc-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clearAllData(): void {
    this.events = [];
    // Remove all analytics keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  }

  getTotalStoredEvents(): number {
    return this.getAllStoredEvents().length;
  }

  // ── Internal Helpers ──
  private generateSessionId(): string {
    // Use crypto.randomUUID if available, else fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID().slice(0, 8);
    }
    return Math.random().toString(36).slice(2, 10);
  }

  private flushModuleDwell(): void {
    const now = Date.now();
    const dwellMs = now - this.moduleEnterTime;
    this.moduleDwell[this.currentModule] = (this.moduleDwell[this.currentModule] || 0) + dwellMs;
    this.moduleEnterTime = now;
  }

  private todayKey(): string {
    return STORAGE_PREFIX + new Date().toISOString().slice(0, 10);
  }

  private loadToday(): void {
    try {
      const stored = localStorage.getItem(this.todayKey());
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch {
      this.events = [];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.todayKey(), JSON.stringify(this.events));
    } catch {
      // Storage full — trim oldest events
      if (this.events.length > 100) {
        this.events = this.events.slice(-Math.floor(this.events.length / 2));
        try {
          localStorage.setItem(this.todayKey(), JSON.stringify(this.events));
        } catch { /* give up */ }
      }
    }
  }

  private getAllStoredEvents(): AnalyticsEvent[] {
    const all: AnalyticsEvent[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '[]');
          all.push(...data);
        } catch { /* skip corrupt */ }
      }
    }
    return all.sort((a, b) => a.timestamp - b.timestamp);
  }

  private rotateStorage(): void {
    const cutoff = Date.now() - MAX_DAYS_RETAINED * 24 * 60 * 60 * 1000;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        const dateStr = key.replace(STORAGE_PREFIX, '');
        const date = new Date(dateStr).getTime();
        if (date && date < cutoff) {
          localStorage.removeItem(key);
        }
      }
    }
  }
}

// ── Singleton Export ──
let _analyticsInstance: AnalyticsServiceImpl | null = null;

export function getAnalytics(): AnalyticsServiceImpl {
  if (!_analyticsInstance) {
    _analyticsInstance = new AnalyticsServiceImpl();
  }
  return _analyticsInstance;
}

export type { AnalyticsServiceImpl as AnalyticsService };
