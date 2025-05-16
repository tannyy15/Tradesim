import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderbookDisplay from "./OrderbookDisplay";
import TradeParametersForm from "./TradeParametersForm";
import CostAnalysisDashboard from "./CostAnalysisDashboard";

interface SimulationResult {
  slippage: number;
  marketImpact: number;
  fees: number;
  netTransactionCost: number;
  processingLatency: number;
  makerTakerProbability: number;
}

const Home = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [orderbookData, setOrderbookData] = useState<any>(null);
  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        const data = JSON.parse(event.data);
        setOrderbookData(data);
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

  // Handle form submission and run simulation
  const handleRunSimulation = async (parameters: any) => {
    setIsLoading(true);

    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate a response with mock data

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock simulation result
      const result: SimulationResult = {
        slippage: Math.random() * 0.5,
        marketImpact: Math.random() * 0.8,
        fees:
          parameters.orderSize *
          0.001 *
          (parameters.feeTier === "vip" ? 0.5 : 1),
        netTransactionCost: Math.random() * parameters.orderSize * 0.02,
        processingLatency: Math.random() * 100 + 50,
        makerTakerProbability: Math.random(),
      };

      setSimulationResult(result);
    } catch (error) {
      console.error("Error running simulation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          GoQuant Trade Simulator
        </h1>
        <p className="text-muted-foreground">
          Real-time market data analysis and trade cost estimation
        </p>
      </header>

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
                onSubmit={handleRunSimulation}
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
                  <CostAnalysisDashboard data={simulationResult} />
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
