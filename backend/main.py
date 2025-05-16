from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import numpy as np
import time
import json
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api_latency.log")
    ]
)
logger = logging.getLogger("trade-simulator")

app = FastAPI(title="GoQuant Trade Simulator API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class OrderbookEntry(BaseModel):
    price: float
    size: float
    total: float
    percentage: float

class OrderbookData(BaseModel):
    bids: List[OrderbookEntry]
    asks: List[OrderbookEntry]
    spread: float
    spreadPercentage: float
    timestamp: int

class TradeParameters(BaseModel):
    symbol: str
    orderSize: float
    feeTier: str
    executionStrategy: str
    volatility: Optional[float] = None
    urgency: Optional[str] = None

class SimulationRequest(BaseModel):
    orderbook: OrderbookData
    parameters: TradeParameters
    clientTimestamp: int = Field(..., description="Client timestamp for latency calculation")

class LatencyMetrics(BaseModel):
    serverProcessingTime: float
    totalServerTime: float

class SimulationResponse(BaseModel):
    slippage: float
    marketImpact: float
    fees: float
    netTransactionCost: float
    processingLatency: float
    makerTakerProbability: float
    latencyMetrics: LatencyMetrics

# Helper functions for models
def calculate_slippage(orderbook: OrderbookData, order_size: float) -> float:
    """Calculate expected slippage using a simple linear model"""
    # Extract bid/ask prices and sizes
    if order_size <= 0:
        return 0.0
    
    # For a buy order, we look at the ask side
    remaining_size = order_size
    total_cost = 0.0
    mid_price = (orderbook.asks[0].price + orderbook.bids[0].price) / 2
    
    for ask in orderbook.asks:
        if remaining_size <= 0:
            break
        
        filled_size = min(remaining_size, ask.size)
        total_cost += filled_size * ask.price
        remaining_size -= filled_size
    
    # If we couldn't fill the entire order with the available liquidity
    if remaining_size > 0:
        # Assume a 2% premium for the remaining size as a penalty
        total_cost += remaining_size * orderbook.asks[-1].price * 1.02
    
    avg_execution_price = total_cost / order_size
    slippage_percentage = (avg_execution_price / mid_price - 1) * 100
    
    return slippage_percentage

def calculate_market_impact(orderbook: OrderbookData, order_size: float, volatility: float = 0.02) -> float:
    """Calculate market impact using a simplified Almgren-Chriss model"""
    # Simplified Almgren-Chriss model
    # Impact = σ * sqrt(order_size / daily_volume) * sqrt(urgency)
    
    # Estimate daily volume from orderbook depth as a proxy
    estimated_daily_volume = sum(bid.total for bid in orderbook.bids) + sum(ask.total for ask in orderbook.asks)
    estimated_daily_volume *= 24  # Scale up to represent a full day
    
    # Avoid division by zero
    if estimated_daily_volume == 0:
        estimated_daily_volume = order_size * 100  # Fallback assumption
    
    # Urgency factor (higher means more urgent execution)
    urgency_factor = 1.0
    
    # Calculate impact
    impact = volatility * np.sqrt(order_size / estimated_daily_volume) * np.sqrt(urgency_factor)
    
    # Convert to percentage
    impact_percentage = impact * 100
    
    return impact_percentage

def calculate_fees(order_size: float, fee_tier: str) -> float:
    """Calculate trading fees based on fee tier"""
    fee_rates = {
        "standard": 0.001,  # 0.1%
        "vip1": 0.0008,    # 0.08%
        "vip2": 0.0006,    # 0.06%
        "vip3": 0.0004,    # 0.04%
        "vip": 0.0005      # 0.05%
    }
    
    rate = fee_rates.get(fee_tier.lower(), 0.001)  # Default to standard rate
    return order_size * rate

def calculate_maker_taker_probability(orderbook: OrderbookData, order_size: float) -> float:
    """Calculate probability of order being filled as maker vs taker using logistic model"""
    # Features for logistic model
    spread = orderbook.spread
    book_depth = len(orderbook.bids) + len(orderbook.asks)
    liquidity_ratio = sum(bid.size for bid in orderbook.bids) / max(sum(ask.size for ask in orderbook.asks), 0.001)
    
    # Simplified logistic function
    # P(maker) = 1 / (1 + exp(-z))
    # where z = b0 + b1*spread + b2*book_depth + b3*liquidity_ratio + b4*order_size
    
    # Coefficients (would be trained in a real model)
    b0 = -0.5
    b1 = 2.0   # Higher spread increases maker probability
    b2 = 0.01  # More depth slightly increases maker probability
    b3 = 0.5   # Higher liquidity ratio increases maker probability
    b4 = -0.1  # Larger order size decreases maker probability
    
    # Normalize inputs
    norm_spread = min(spread / 10.0, 1.0)  # Assume max relevant spread is 10
    norm_depth = min(book_depth / 100.0, 1.0)  # Normalize depth
    norm_liquidity = min(liquidity_ratio, 2.0) / 2.0  # Cap at 2.0
    norm_order_size = min(order_size / 10.0, 1.0)  # Assume 10 BTC is large
    
    # Calculate logistic function input
    z = b0 + b1*norm_spread + b2*norm_depth + b3*norm_liquidity + b4*norm_order_size
    
    # Calculate probability
    maker_probability = 1.0 / (1.0 + np.exp(-z))
    
    return maker_probability

@app.get("/")
async def root():
    return {"message": "GoQuant Trade Simulator API"}

@app.post("/simulate", response_model=SimulationResponse)
async def simulate_trade(request: SimulationRequest):
    # Start timing server processing
    server_start_time = time.time()
    
    try:
        # Extract data
        orderbook = request.orderbook
        parameters = request.parameters
        client_timestamp = request.clientTimestamp
        
        # Calculate metrics
        slippage = calculate_slippage(orderbook, parameters.orderSize)
        
        # Use default volatility if not provided
        volatility = parameters.volatility if parameters.volatility is not None else 0.02
        market_impact = calculate_market_impact(orderbook, parameters.orderSize, volatility)
        
        fees = calculate_fees(parameters.orderSize, parameters.feeTier)
        maker_taker_prob = calculate_maker_taker_probability(orderbook, parameters.orderSize)
        
        # Calculate net transaction cost
        net_cost = (slippage + market_impact + fees) / 100 * parameters.orderSize
        
        # Calculate latency metrics
        server_processing_time = time.time() - server_start_time
        total_server_time = time.time() - (client_timestamp / 1000)  # Convert client timestamp to seconds
        
        # Log latency information
        logger.info(f"Simulation request processed - Server processing time: {server_processing_time*1000:.2f}ms, "  
                   f"Total server time: {total_server_time*1000:.2f}ms")
        
        # Create response
        response = SimulationResponse(
            slippage=slippage,
            marketImpact=market_impact,
            fees=fees,
            netTransactionCost=net_cost,
            processingLatency=server_processing_time * 1000,  # Convert to milliseconds
            makerTakerProbability=maker_taker_prob,
            latencyMetrics=LatencyMetrics(
                serverProcessingTime=server_processing_time * 1000,
                totalServerTime=total_server_time * 1000
            )
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing simulation request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
