import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderbookDisplay from "./OrderbookDisplay";
import TradeParametersForm from "./TradeParametersForm";
import CostAnalysisDashboard from "./CostAnalysisDashboard";
import simulationService, {
  SimulationResponse,
  OrderbookData,
} from "@/services/simulationService";

interface SimulationResult extends SimulationResponse {}

const Home = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [orderbookData, setOrderbookData] = useState<OrderbookData | null>(
    null,
  );
  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    avgDataProcessingLatency: number;
    avgUIUpdateLatency: number;
    avgEndToEndLatency: number;
  }>({
    avgDataProcessingLatency: 0,
    avgUIUpdateLatency: 0,
    avgEndToEndLatency: 0,
  });

  // Ref to track UI update timing
  const uiUpdateStartTimeRef = useRef<number | null>(null);

  // Connect to WebSocket for real-time orderbook data
  useEffect(() => {
    const ws = new WebSocket(
      "wss://ws.gomarket-cpp.goquant.io/ws/l2-orderbook/okx/BTC-USDT-SWAP",
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        // Start timing for data processing
        const dataProcessingStart = performance.now();

        const rawData = JSON.parse(event.data);

        // Process the raw data into the format our application expects
        const processedData: OrderbookData = {
          bids: rawData.bids.map((bid: [number, number], index: number) => ({
            price: bid[0],
            size: bid[1],
            total: rawData.bids
              .slice(0, index + 1)
              .reduce(
                (sum: number, item: [number, number]) => sum + item[1],
                0,
              ),
            percentage: 0, // Will be calculated after all entries are processed
          })),
          asks: rawData.asks.map((ask: [number, number], index: number) => ({
            price: ask[0],
            size: ask[1],
            total: rawData.asks
              .slice(0, index + 1)
              .reduce(
                (sum: number, item: [number, number]) => sum + item[1],
                0,
              ),
            percentage: 0, // Will be calculated after all entries are processed
          })),
          spread: rawData.asks[0][0] - rawData.bids[0][0],
          spreadPercentage:
            ((rawData.asks[0][0] - rawData.bids[0][0]) / rawData.bids[0][0]) *
            100,
          timestamp: Date.now(),
        };

        // Calculate percentages based on max total
        const maxTotal = Math.max(
          ...processedData.bids.map((bid) => bid.total),
          ...processedData.asks.map((ask) => ask.total),
        );

        processedData.bids = processedData.bids.map((bid) => ({
          ...bid,
          percentage: (bid.total / maxTotal) * 100,
        }));

        processedData.asks = processedData.asks.map((ask) => ({
          ...ask,
          percentage: (ask.total / maxTotal) * 100,
        }));

        setOrderbookData(processedData);

        // End timing for data processing
        const dataProcessingEnd = performance.now();
        const dataProcessingLatency = dataProcessingEnd - dataProcessingStart;
        console.log(
          `WebSocket data processing latency: ${dataProcessingLatency.toFixed(2)}ms`,
        );
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Update performance metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceMetrics(simulationService.getAverageMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle form submission and run simulation
  const handleRunSimulation = async (parameters: any) => {
    setIsLoading(true);

    // Start timing for UI update
    uiUpdateStartTimeRef.current = performance.now();

    try {
      if (!orderbookData) {
        throw new Error("Orderbook data is not available");
      }

      // Call the simulation service
      const result = await simulationService.runSimulation(orderbookData, {
        symbol: parameters.asset || "BTC-USDT-SWAP",
        orderSize: parameters.orderSize,
        feeTier: parameters.feeTier,
        executionStrategy: parameters.executionStrategy,
        volatility: parameters.volatility,
        urgency: parameters.urgency,
      });

      setSimulationResult(result);

      // Record UI update latency
      if (uiUpdateStartTimeRef.current) {
        const uiUpdateLatency =
          performance.now() - uiUpdateStartTimeRef.current;
        simulationService.recordUIUpdateLatency(uiUpdateLatency);
        console.log(`UI update latency: ${uiUpdateLatency.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error("Error running simulation:", error);
    } finally {
      setIsLoading(false);
      uiUpdateStartTimeRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Trade Simulator Dashboard
        </h1>
        <p className="text-muted-foreground">
          Real-time market data analysis and trade cost estimation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Orderbook Visualization</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderbookDisplay data={orderbookData} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <TradeParametersForm
                onRunSimulation={handleRunSimulation}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="metrics">
                <TabsList className="mb-4">
                  <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                <TabsContent value="metrics">
                  <CostAnalysisDashboard
                    slippage={simulationResult?.slippage}
                    marketImpact={simulationResult?.marketImpact}
                    fees={simulationResult?.fees}
                    netTransactionCost={simulationResult?.netTransactionCost}
                    processingLatency={simulationResult?.processingLatency}
                    makerTakerProbability={
                      simulationResult?.makerTakerProbability
                    }
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value="performance">
                  {simulationResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">
                            Processing Latency
                          </p>
                          <p className="text-2xl font-bold">
                            {simulationResult.processingLatency.toFixed(2)} ms
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">
                            Maker/Taker Probability
                          </p>
                          <p className="text-2xl font-bold">
                            {(
                              simulationResult.makerTakerProbability * 100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">
                          Latency Metrics
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">
                              Data Processing
                            </p>
                            <p className="text-xl font-bold">
                              {performanceMetrics.avgDataProcessingLatency.toFixed(
                                2,
                              )}{" "}
                              ms
                            </p>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">
                              UI Update
                            </p>
                            <p className="text-xl font-bold">
                              {performanceMetrics.avgUIUpdateLatency.toFixed(2)}{" "}
                              ms
                            </p>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">
                              End-to-End
                            </p>
                            <p className="text-xl font-bold">
                              {performanceMetrics.avgEndToEndLatency.toFixed(2)}{" "}
                              ms
                            </p>
                          </div>
                        </div>

                        {simulationResult.latencyMetrics && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-muted p-4 rounded-lg">
                              <p className="text-sm font-medium text-muted-foreground">
                                Server Processing Time
                              </p>
                              <p className="text-xl font-bold">
                                {simulationResult.latencyMetrics.serverProcessingTime.toFixed(
                                  2,
                                )}{" "}
                                ms
                              </p>
                            </div>
                            <div className="bg-muted p-4 rounded-lg">
                              <p className="text-sm font-medium text-muted-foreground">
                                Total Server Time
                              </p>
                              <p className="text-xl font-bold">
                                {simulationResult.latencyMetrics.totalServerTime.toFixed(
                                  2,
                                )}{" "}
                                ms
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Run a simulation to view performance metrics
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
