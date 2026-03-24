# FinSight — k6 Load Test

## Prerequisites

```bash
# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# macOS
brew install k6
```

## Quick Start

```bash
# Default (localhost:3000)
k6 run load-test.js

# Custom target
k6 run -e BASE_URL=http://192.168.1.100:3000 load-test.js

# Full example with all config
k6 run \
  -e BASE_URL=http://10.0.0.5:3000 \
  -e STOCK_IDS=FPT,VCB,TCB \
  -e USER_IDS=144995632409477120 \
  -e YEARS=2023,2024 \
  -e LOGIN_USERNAME=admin \
  -e LOGIN_PASSWORD=secret \
  load-test.js
```

## Export Results

```bash
# JSON detail (every data point)
k6 run --out json=results.json load-test.js

# CSV output
k6 run --out csv=results.csv load-test.js

# Summary JSON (aggregate metrics)
k6 run --summary-export=summary.json load-test.js

# Combined
k6 run --summary-export=summary.json --out json=results.json load-test.js
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:3000` | API base URL |
| `STOCK_IDS` | `FPT,VCB,TCB,MWG,VNM,HPG,MSN,VIC,VHM,VRE` | Comma-separated stock IDs |
| `USER_IDS` | `144995632409477120` | Comma-separated user IDs |
| `YEARS` | `2023,2024` | Years for stock year data queries |
| `LOGIN_USERNAME` | `testuser` | Login credentials |
| `LOGIN_PASSWORD` | `testpassword` | Login credentials |
| `USER_ID_FOR_UPDATE` | `144995632409477120` | User ID for update round-trip |
| `USER_PHONE` | `0901234567` | Original phone number to revert to |
| `AHP_CONFIG_ID` | `123` | AHP config ID for update round-trip |
| `AHP_USER_ID` | `144995632409477120` | User ID owning AHP config |
| `FAVORITE_STOCK_ID` | `FPT` | Stock ID for add/remove favorite cycle |
| `PORTFOLIO_USER_ID` | `144995632409477120` | User for portfolio allocation |
| `PORTFOLIO_BUDGET` | `100000000` | Budget in VND |
| `PORTFOLIO_NUM_STOCKS` | `5` | Number of stocks to allocate |

## Load Profile

Ramping arrival rate (5 → 200 RPS) over ~5 minutes:

```
 RPS
 200 ┤                          ┌──────────┐
 150 ┤                     ┌────┘          │
 100 ┤                ┌────┘               │
  75 ┤           ┌────┘                    │
  50 ┤      ┌────┘                         └────┐
  25 ┤ ┌────┘                                   │
  10 ┤─┘                                        │
   5 ┤                                           └──→ 0
     └─────────────────────────────────────────────── time
     0s   30   60   90  120  150  180  210  270  310s
```

## Endpoints Tested

### Read-only (direct DB query)

| Endpoint | Weight | Description |
|---|---|---|
| `GET /api/stock/get/:stockId` | 20% | Fetch stock with year data |
| `GET /api/stock/getAllStocksId` | 5% | List all stock IDs |
| `GET /api/user/getDetail/:userId` | 10% | User profile + subscriptions + AHP config |
| `GET /api/ahpConfig/get/:userId` | 5% | AHP pairwise matrix and weights |
| `GET /api/stockYearData/get/:stockId/:year` | 10% | Fundamentals for one year |

### Write (Kafka round-trip, state-safe via paired operations)

| Endpoint | Weight | Safety Mechanism |
|---|---|---|
| `PUT /api/user/update` | 10% | Modifies phone only, immediately reverts |
| `POST /api/user/login` | 10% | Read-only authentication check |
| `POST /api/user/addFavoriteStock` | 10% | Always paired with remove in same iteration |
| `POST /api/user/removeFavoriteStock` | (paired) | Runs immediately after add |
| `PUT /api/ahpConfig/update` | 5% | Modifies matrix, immediately reverts to original |
| `POST /api/portfolio/allocate` | 15% | Pure computation, no DB writes |

### Excluded (unsafe side effects)

| Endpoint | Reason |
|---|---|
| `POST /api/user/create` | Sends welcome email |
| `DELETE /api/user/delete` | Destructive |
| `PUT /api/user/updatePassword` | Credential change |
| `POST /api/stock/create` | Mutates stock table |
| `PUT /api/stock/update` | Mutates stock table |
| `DELETE /api/stock/delete` | Destructive |
| `POST /api/subscription/create` | Creates PayOS payment link |

## Thresholds

| Metric | Pass Criteria |
|---|---|
| `http_req_duration p(95)` | < 2000ms |
| `http_req_duration p(99)` | < 5000ms |
| `custom_error_rate` | < 5% |
| `endpoint_get_stock p(95)` | < 1000ms |
| `endpoint_login p(95)` | < 3000ms |
| `endpoint_portfolio_allocate p(95)` | < 5000ms |

## Custom Metrics

| Metric | Type | Description |
|---|---|---|
| `custom_response_time` | Trend | All endpoints combined |
| `custom_error_rate` | Rate | % of 4xx/5xx responses |
| `custom_request_count` | Counter | Total requests fired |
| `upstream_response_time` | Trend | From `X-Response-Time` header (if set) |
| `endpoint_*` | Trend | Per-endpoint latency distribution |
