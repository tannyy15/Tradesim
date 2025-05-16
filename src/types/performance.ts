/**
 * Performance metrics for tracking latency in the application
 */
export interface PerformanceMetrics {
  /**
   * Time taken to parse and prepare WebSocket data (milliseconds)
   */
  dataProcessingLatency: number[];

  /**
   * Time from receiving backend response to UI update (milliseconds)
   */
  uiUpdateLatency: number[];

  /**
   * End-to-end simulation loop latency - from WebSocket event to UI update (milliseconds)
   */
  endToEndLatency: number[];
}
