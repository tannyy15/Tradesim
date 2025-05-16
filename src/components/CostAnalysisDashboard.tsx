"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
  CoinsIcon,
  PercentIcon,
  TrendingDownIcon,
  WalletIcon,
} from "lucide-react";

interface CostAnalysisMetric {
  label: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  trend?: "positive" | "negative" | "neutral";
  description?: string;
}

interface CostAnalysisDashboardProps {
  slippage?: number;
  marketImpact?: number;
  fees?: number;
  netTransactionCost?: number;
  processingLatency?: number;
  makerTakerProbability?: number;
  isLoading?: boolean;
}

const CostAnalysisDashboard = ({
  slippage = 0.05,
  marketImpact = 0.12,
  fees = 0.08,
  netTransactionCost = 0.25,
  processingLatency = 42,
  makerTakerProbability = 0.65,
  isLoading = false,
}: CostAnalysisDashboardProps) => {
  const metrics: CostAnalysisMetric[] = [
    {
      label: "Slippage",
      value: slippage,
      unit: "%",
      icon: <TrendingDownIcon className="h-4 w-4 text-amber-500" />,
      trend: slippage > 0.1 ? "negative" : "neutral",
      description: "Price difference between expected and executed price",
    },
    {
      label: "Market Impact",
      value: marketImpact,
      unit: "%",
      icon: <ArrowDownIcon className="h-4 w-4 text-red-500" />,
      trend: "negative",
      description: "Effect of your order on market price",
    },
    {
      label: "Fees",
      value: fees,
      unit: "%",
      icon: <CoinsIcon className="h-4 w-4 text-amber-500" />,
      trend: "negative",
      description: "Exchange trading fees",
    },
    {
      label: "Net Transaction Cost",
      value: netTransactionCost,
      unit: "%",
      icon: <WalletIcon className="h-4 w-4 text-red-500" />,
      trend: "negative",
      description: "Total cost of execution",
    },
  ];

  const renderTrendIndicator = (
    trend?: "positive" | "negative" | "neutral",
  ) => {
    if (trend === "positive") {
      return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    } else if (trend === "negative") {
      return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span>Cost Analysis Dashboard</span>
          {isLoading && (
            <Badge variant="outline" className="ml-2 animate-pulse">
              Calculating...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="p-4 border rounded-lg bg-slate-50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="font-medium text-sm">{metric.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-lg font-bold ${metric.trend === "negative" ? "text-red-600" : metric.trend === "positive" ? "text-green-600" : "text-gray-800"}`}
                  >
                    {typeof metric.value === "number"
                      ? metric.value.toFixed(2)
                      : metric.value}
                    {metric.unit}
                  </span>
                  {renderTrendIndicator(metric.trend)}
                </div>
              </div>
              <p className="text-xs text-gray-500">{metric.description}</p>
              {typeof metric.value === "number" && (
                <Progress
                  value={Math.min(metric.value * 100, 100)}
                  className="h-1.5 mt-2"
                />
              )}
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Processing Latency</span>
              </div>
              <span className="text-lg font-bold">{processingLatency} ms</span>
            </div>
            <p className="text-xs text-gray-500">
              Time taken to process the simulation
            </p>
            <Progress
              value={Math.min((processingLatency / 100) * 100, 100)}
              className="h-1.5 mt-2"
            />
          </div>

          <div className="p-4 border rounded-lg bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <PercentIcon className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-sm">
                  Maker/Taker Probability
                </span>
              </div>
              <span className="text-lg font-bold">
                {(makerTakerProbability * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Likelihood of order being filled as maker
            </p>
            <div className="relative pt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Taker</span>
                <span>Maker</span>
              </div>
              <Progress value={makerTakerProbability * 100} className="h-2" />
              <div
                className="absolute w-1 h-3 bg-black top-8 transform -translate-x-1/2"
                style={{ left: `${makerTakerProbability * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostAnalysisDashboard;
