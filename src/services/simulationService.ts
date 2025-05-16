import { PerformanceMetrics } from "@/types/performance";

export interface OrderbookEntry {
  price: number;
  size: number;
  total: number;
  percentage: number;
}

export interface OrderbookData {
  bids: OrderbookEntry[];
  asks: OrderbookEntry[];
  spread: number;
  spreadPercentage: number;
  timestamp: number;
}

export interface TradeParameters {
  symbol: string;
  orderSize: number;
  feeTier: string;
  executionStrategy: string;
  volatility?: number;
  urgency?: string;
}

export interface SimulationRequest {
  orderbook: OrderbookData;
  parameters: TradeParameters;
  clientTimestamp: number;
}

export interface LatencyMetrics {
  serverProcessingTime: number;
  totalServerTime: number;
}

export interface SimulationResponse {
  slippage: number;
  marketImpact: number;
  fees: number;
  netTransactionCost: number;
  processingLatency: number;
  makerTakerProbability: number;
  latencyMetrics: LatencyMetrics;
}

export class SimulationService {
  private apiUrl: string;
  private performanceMetrics: PerformanceMetrics = {
    dataProcessingLatency: [],
    uiUpdateLatency: [],
    endToEndLatency: [],
  };

  constructor(apiUrl: string = "http://localhost:8000") {
    this.apiUrl = apiUrl;
  }

  /**
   * Run a trade simulation with the given orderbook data and parameters
   */
  async runSimulation(
    orderbook: OrderbookData,
    parameters: TradeParameters,
  ): Promise<SimulationResponse> {
    // Start timing for data processing
    const dataProcessingStart = performance.now();

    // Prepare the request payload
    const request: SimulationRequest = {
      orderbook,
      parameters,
      clientTimestamp: Date.now(),
    };

    // Record data processing time
    const dataProcessingEnd = performance.now();
    const dataProcessingLatency = dataProcessingEnd - dataProcessingStart;
    this.performanceMetrics.dataProcessingLatency.push(dataProcessingLatency);

    // Start timing for end-to-end latency
    const endToEndStart = performance.now();

    try {
      // Make the API call
      const response = await fetch(`${this.apiUrl}/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result: SimulationResponse = await response.json();

      // Record end-to-end latency
      const endToEndEnd = performance.now();
      const endToEndLatency = endToEndEnd - endToEndStart;
      this.performanceMetrics.endToEndLatency.push(endToEndLatency);

      // Return the simulation result
      return result;
    } catch (error) {
      console.error("Error running simulation:", error);
      throw error;
    }
  }

  /**
   * Record UI update latency
   */
  recordUIUpdateLatency(latency: number): void {
    this.performanceMetrics.uiUpdateLatency.push(latency);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMetrics;
  }

  /**
   * Get average metrics
   */
  getAverageMetrics(): { [key: string]: number } {
    const calculateAverage = (arr: number[]): number => {
      if (arr.length === 0) return 0;
      return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    };

    return {
      avgDataProcessingLatency: calculateAverage(
        this.performanceMetrics.dataProcessingLatency,
      ),
      avgUIUpdateLatency: calculateAverage(
        this.performanceMetrics.uiUpdateLatency,
      ),
      avgEndToEndLatency: calculateAverage(
        this.performanceMetrics.endToEndLatency,
      ),
    };
  }
}

// Create a singleton instance
const simulationService = new SimulationService();
export default simulationService;
