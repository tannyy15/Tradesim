import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface OrderbookEntry {
  price: number;
  size: number;
  total: number;
  percentage: number;
}

interface OrderbookData {
  bids: OrderbookEntry[];
  asks: OrderbookEntry[];
  spread: number;
  spreadPercentage: number;
  timestamp: number;
}

interface OrderbookDisplayProps {
  data?: OrderbookData;
  symbol?: string;
  isLoading?: boolean;
}

const OrderbookDisplay = ({
  data = {
    bids: Array(10)
      .fill(0)
      .map((_, i) => ({
        price: 65000 - i * 10,
        size: Math.random() * 5 + 0.5,
        total: Math.random() * 50 + 10,
        percentage: Math.random() * 100,
      })),
    asks: Array(10)
      .fill(0)
      .map((_, i) => ({
        price: 65100 + i * 10,
        size: Math.random() * 5 + 0.5,
        total: Math.random() * 50 + 10,
        percentage: Math.random() * 100,
      })),
    spread: 100,
    spreadPercentage: 0.15,
    timestamp: Date.now(),
  },
  symbol = "BTC-USDT-SWAP",
  isLoading = false,
}: OrderbookDisplayProps) => {
  const [activeTab, setActiveTab] = useState("orderbook");
  const [lastPrice, setLastPrice] = useState(65050);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(
    null,
  );

  // Simulate price changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice =
        lastPrice +
        (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 20);
      setPriceDirection(newPrice > lastPrice ? "up" : "down");
      setLastPrice(newPrice);
    }, 3000);
    return () => clearInterval(interval);
  }, [lastPrice]);

  // Calculate depth chart percentages
  const maxTotal =
    data &&
    Array.isArray(data.bids) &&
    Array.isArray(data.asks) &&
    data.bids.length > 0 &&
    data.asks.length > 0
      ? Math.max(
          ...data.bids.map((bid) => bid.total),
          ...data.asks.map((ask) => ask.total),
        )
      : 0;

  return (
    <Card className="w-full h-full bg-background">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">
            {symbol} Orderbook
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Last Price:</span>
            <span
              className={`text-lg font-semibold ${priceDirection === "up" ? "text-green-500" : priceDirection === "down" ? "text-red-500" : ""}`}
            >
              {lastPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              {priceDirection === "up" && (
                <ArrowUpIcon className="inline ml-1 h-4 w-4 text-green-500" />
              )}
              {priceDirection === "down" && (
                <ArrowDownIcon className="inline ml-1 h-4 w-4 text-red-500" />
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            Spread: {data?.spread ? Number(data.spread).toFixed(2) : "--"} (
            {data?.spreadPercentage
              ? Number(data.spreadPercentage).toFixed(3)
              : "--"}
            %)
          </Badge>
          <Badge variant="outline" className="text-xs">
            Updated:{" "}
            {data?.timestamp
              ? new Date(data.timestamp).toLocaleTimeString()
              : "--"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="orderbook"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="orderbook">Orderbook</TabsTrigger>
            <TabsTrigger value="depth">Depth Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="orderbook" className="w-full">
            <div className="grid grid-cols-2 gap-4">
              {/* Bids */}
              <div>
                <div className="text-sm font-medium text-green-500 mb-2">
                  Bids
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.bids?.map((bid, index) => (
                      <TableRow key={`bid-${index}`}>
                        <TableCell className="text-right font-medium text-green-500">
                          {bid.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {typeof bid.size === "number"
                            ? bid.size.toFixed(4)
                            : bid.size}
                        </TableCell>
                        <TableCell className="text-right">
                          {typeof bid.total === "number"
                            ? bid.total.toFixed(4)
                            : bid.total}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Asks */}
              <div>
                <div className="text-sm font-medium text-red-500 mb-2">
                  Asks
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.asks?.map((ask, index) => (
                      <TableRow key={`ask-${index}`}>
                        <TableCell className="text-right font-medium text-red-500">
                          {ask.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {typeof ask.size === "number"
                            ? ask.size.toFixed(4)
                            : ask.size}
                        </TableCell>
                        <TableCell className="text-right">
                          {typeof ask.total === "number"
                            ? ask.total.toFixed(4)
                            : ask.total}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="depth" className="w-full">
            <div className="flex flex-col h-[500px]">
              <div className="flex h-full">
                {/* Bids depth visualization */}
                <div className="flex-1 flex flex-col justify-center items-end pr-1 space-y-1">
                  {data?.bids?.map((bid, index) => (
                    <div
                      key={`bid-depth-${index}`}
                      className="flex items-center w-full"
                    >
                      <div className="text-xs text-muted-foreground w-20 text-right pr-2">
                        {bid.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <div
                        className="h-6 bg-green-500/20 rounded-sm"
                        style={{ width: `${(bid.total / maxTotal) * 100}%` }}
                      ></div>
                    </div>
                  ))}
                </div>

                <Separator orientation="vertical" className="mx-2" />

                {/* Asks depth visualization */}
                <div className="flex-1 flex flex-col justify-center items-start pl-1 space-y-1">
                  {data?.asks?.map((ask, index) => (
                    <div
                      key={`ask-depth-${index}`}
                      className="flex items-center w-full"
                    >
                      <div
                        className="h-6 bg-red-500/20 rounded-sm"
                        style={{ width: `${(ask.total / maxTotal) * 100}%` }}
                      ></div>
                      <div className="text-xs text-muted-foreground w-20 text-left pl-2">
                        {ask.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <div className="text-sm text-muted-foreground">
                  <span className="inline-block w-3 h-3 bg-green-500/20 mr-1"></span>{" "}
                  Bids
                  <span className="mx-4"></span>
                  <span className="inline-block w-3 h-3 bg-red-500/20 mr-1"></span>{" "}
                  Asks
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OrderbookDisplay;
