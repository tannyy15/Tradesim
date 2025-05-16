# GoQuant Trade Simulator Backend

This is the Python FastAPI backend for the GoQuant Trade Simulator. It provides endpoints for simulating trades and calculating various trading metrics.

## Features

- **Trade Simulation API**: Calculate expected slippage, market impact, fees, and other metrics
- **Performance Monitoring**: Track and log latency metrics
- **Models**:
  - Expected Slippage (linear model)
  - Expected Fees (rule-based calculation)
  - Market Impact (simplified Almgren-Chriss model)
  - Maker/Taker Proportion (logistic regression)

## Setup

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pip install -r requirements.txt
```

### Running the Server

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

### Docker

Alternatively, you can use Docker:

```bash
docker build -t goquant-simulator .
docker run -p 8000:8000 goquant-simulator
```

## API Documentation

Once the server is running, you can access the auto-generated API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

### POST /simulate

Simulates a trade based on orderbook data and trade parameters.

**Request Body:**

```json
{
  "orderbook": {
    "bids": [
      { "price": 65000, "size": 1.5, "total": 1.5, "percentage": 10 }
    ],
    "asks": [
      { "price": 65100, "size": 1.2, "total": 1.2, "percentage": 8 }
    ],
    "spread": 100,
    "spreadPercentage": 0.15,
    "timestamp": 1621234567890
  },
  "parameters": {
    "symbol": "BTC-USDT-SWAP",
    "orderSize": 5,
    "feeTier": "vip",
    "executionStrategy": "market",
    "volatility": 0.02,
    "urgency": "medium"
  },
  "clientTimestamp": 1621234567890
}
```

**Response:**

```json
{
  "slippage": 0.12,
  "marketImpact": 0.08,
  "fees": 2.5,
  "netTransactionCost": 10.5,
  "processingLatency": 15.2,
  "makerTakerProbability": 0.65,
  "latencyMetrics": {
    "serverProcessingTime": 15.2,
    "totalServerTime": 120.5
  }
}
```

## Performance Monitoring

The backend logs performance metrics to both the console and a file (`api_latency.log`). These metrics include:

- Server processing time
- Total server time (including network latency)

You can analyze these logs to identify performance bottlenecks and optimize the application.
