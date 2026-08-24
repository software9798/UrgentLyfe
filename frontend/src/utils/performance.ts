// Lightweight Performance & Telemetry Utility for UrgentLyfe AI & API monitoring

export interface PerfMetric {
  id: string;
  category: 'AI_CHAT' | 'AI_VOICE' | 'AI_VISION' | 'API_HTTP' | 'UI_RENDER';
  label: string;
  durationMs: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerfMetric[] = [];
  private maxRecords = 50;
  private listeners: Array<(metric: PerfMetric) => void> = [];

  /**
   * Starts a performance timer for an operation.
   * Returns a completion callback that records duration in ms.
   */
  startTimer(category: PerfMetric['category'], label: string, metadata?: Record<string, any>) {
    const startTime = performance.now();
    const id = `perf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    return (extraMetadata?: Record<string, any>): PerfMetric => {
      const durationMs = Math.round(performance.now() - startTime);
      const metric: PerfMetric = {
        id,
        category,
        label,
        durationMs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        metadata: { ...metadata, ...extraMetadata },
      };

      this.record(metric);
      return metric;
    };
  }

  /**
   * Helper to measure async execution time directly
   */
  async measureAsync<T>(
    category: PerfMetric['category'],
    label: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ result: T; durationMs: number }> {
    const end = this.startTimer(category, label, metadata);
    try {
      const result = await fn();
      const metric = end({ status: 'SUCCESS' });
      return { result, durationMs: metric.durationMs };
    } catch (error: any) {
      end({ status: 'ERROR', error: error.message || String(error) });
      throw error;
    }
  }

  record(metric: PerfMetric) {
    this.metrics.unshift(metric);
    if (this.metrics.length > this.maxRecords) {
      this.metrics.pop();
    }
    this.listeners.forEach((listener) => listener(metric));
  }

  getMetrics(): PerfMetric[] {
    return [...this.metrics];
  }

  getAverageLatency(category?: PerfMetric['category']): number {
    const filtered = category ? this.metrics.filter((m) => m.category === category) : this.metrics;
    if (filtered.length === 0) return 0;
    const total = filtered.reduce((acc, curr) => acc + curr.durationMs, 0);
    return Math.round(total / filtered.length);
  }

  subscribe(listener: (metric: PerfMetric) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  clear() {
    this.metrics = [];
  }
}

export const perfMonitor = new PerformanceMonitor();
