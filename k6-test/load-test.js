import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import exec from 'k6/execution';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.4/index.js';

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------
const responseTimeTrend  = new Trend('custom_response_time', true);
const responseTimeSuccessByScenario = new Trend('custom_response_time_success_by_scenario', true);
const errorRate          = new Rate('custom_error_rate');
const requestCount       = new Counter('custom_request_count');
const upstreamTimeTrend  = new Trend('upstream_response_time', true);

const trendGetStock          = new Trend('endpoint_get_stock', true);
const trendGetAllIds         = new Trend('endpoint_get_all_stock_ids', true);
const trendGetUser           = new Trend('endpoint_get_user_detail', true);
const trendUpdateUser        = new Trend('endpoint_update_user', true);
const trendLogin             = new Trend('endpoint_login', true);
const trendFavoriteStock     = new Trend('endpoint_favorite_stock', true);
const trendGetAhpConfig      = new Trend('endpoint_get_ahp_config', true);
const trendUpdateAhpConfig   = new Trend('endpoint_update_ahp_config', true);
const trendGetYearData       = new Trend('endpoint_get_stock_year_data', true);
const trendPortfolio         = new Trend('endpoint_portfolio_allocate', true);

// ---------------------------------------------------------------------------
// Configuration (all overridable via -e flags)
// ---------------------------------------------------------------------------
const BASE_URLS = (__ENV.BASE_URL || 'http://localhost:3000').split(',').map(u => u.trim());
function baseUrl() {
  // Keep each VU pinned to one upstream to maximize keep-alive reuse.
  const vuId = exec.vu.idInTest || 1;
  return BASE_URLS[(vuId - 1) % BASE_URLS.length];
}

const TEST_STOCK_IDS = (__ENV.STOCK_IDS || 'ACB,BID,SHB,TCB,VCB').split(',');
const TEST_USER_IDS  = (__ENV.USER_IDS  || '157322592569524224').split(',');
const TEST_YEARS     = (__ENV.YEARS     || '2021,2022,2023,2024').split(',').map(Number);

const LOGIN_CREDS = {
  userId:   __ENV.LOGIN_USER_ID || '157322592569524224',
  username: __ENV.LOGIN_USERNAME || 'testuser1',
  password: __ENV.LOGIN_PASSWORD || 'password123',
};

const PORTFOLIO_REQ = {
  userId:         __ENV.PORTFOLIO_USER_ID || '157322592569524224',
  budget:         Number(__ENV.PORTFOLIO_BUDGET || 100000000),
  numberOfStocks: Number(__ENV.PORTFOLIO_NUM_STOCKS || 3),
  lotSize:        100,
};

// User update test data — only safe fields (no email, no password)
const USER_UPDATE_USER_ID = __ENV.USER_ID_FOR_UPDATE || '157322592569524224';
const USER_UPDATE_ORIGINAL = {
  userId:      USER_UPDATE_USER_ID,
  phoneNumber: __ENV.USER_PHONE || '0901234567',
};
const USER_UPDATE_MODIFIED = {
  userId:      USER_UPDATE_USER_ID,
  phoneNumber: '0909999888',
};

// AHP config — original and modified matrices for round-trip test
const AHP_CONFIG_ID = __ENV.AHP_CONFIG_ID || '123';
const AHP_USER_ID   = __ENV.AHP_USER_ID   || '157322592569524224';

const AHP_ORIGINAL_MATRIX = '[[1,2,4,6,8,3,5],[0.5,1,3,5,7,2,4],[0.25,0.3333,1,4,6,2,3],[0.1667,0.2,0.25,1,5,3,4],[0.125,0.1429,0.1667,0.2,1,4,6],[0.3333,0.5,0.5,0.3333,0.25,1,2],[0.2,0.25,0.3333,0.25,0.1667,0.5,1]]';
const AHP_MODIFIED_MATRIX = '[[1,3,5,7,9,4,6],[0.3333,1,4,6,8,3,5],[0.2,0.25,1,5,7,3,4],[0.1429,0.1667,0.2,1,6,4,5],[0.1111,0.125,0.1429,0.1667,1,5,7],[0.25,0.3333,0.3333,0.25,0.2,1,3],[0.1667,0.2,0.25,0.2,0.1429,0.3333,1]]';

// Favorite stock used for add/remove cycle
const FAVORITE_STOCK_ID = __ENV.FAVORITE_STOCK_ID || 'ACB';

// Set to "true" to skip all write endpoints (PUT/POST that modify DB)
const READ_ONLY = (__ENV.READ_ONLY || 'false') === 'true';

// Traffic weight distribution — write endpoints are zeroed out when READ_ONLY=true
const WEIGHTS = {
  getStock:          0.20,
  getAllStockIds:     0.05,
  getUserDetail:     0.10,
  updateUser:        READ_ONLY ? 0 : 0.10,
  login:             READ_ONLY ? 0 : 0.10,
  favoriteStock:     READ_ONLY ? 0 : 0.10,
  getAhpConfig:      0.05,
  updateAhpConfig:   READ_ONLY ? 0 : 0.05,
  getStockYearData:  0.10,
  portfolioAllocate: READ_ONLY ? 0 : 0.15,
};

const ENDPOINT_CONFIG = {
  getStock:          { metric: 'endpoint_get_stock',           tag: 'get_stock',           threshold: 'p(95)<1000' },
  getAllStockIds:    { metric: 'endpoint_get_all_stock_ids',   tag: 'get_all_stock_ids',   threshold: 'p(95)<500'  },
  getUserDetail:     { metric: 'endpoint_get_user_detail',     tag: 'get_user_detail',     threshold: 'p(95)<1500' },
  updateUser:        { metric: 'endpoint_update_user',         tag: 'update_user',         threshold: 'p(95)<3000' },
  login:             { metric: 'endpoint_login',               tag: 'login',               threshold: 'p(95)<3000' },
  favoriteStock:     { metric: 'endpoint_favorite_stock',      tag: 'favorite_stock',      threshold: 'p(95)<3000' },
  getAhpConfig:      { metric: 'endpoint_get_ahp_config',      tag: 'get_ahp_config',      threshold: 'p(95)<1000' },
  updateAhpConfig:   { metric: 'endpoint_update_ahp_config',   tag: 'update_ahp_config',   threshold: 'p(95)<5000' },
  getStockYearData:  { metric: 'endpoint_get_stock_year_data', tag: 'get_stock_year_data', threshold: 'p(95)<1000' },
  portfolioAllocate: { metric: 'endpoint_portfolio_allocate',  tag: 'portfolio_allocate',  threshold: 'p(95)<5000' },
};

const enabledEndpointKeys = Object.keys(WEIGHTS).filter((key) => WEIGHTS[key] > 0);
const endpointThresholds = Object.fromEntries(
    enabledEndpointKeys.map((key) => [ENDPOINT_CONFIG[key].metric, [ENDPOINT_CONFIG[key].threshold]]),
);

// ---------------------------------------------------------------------------
// Load profile — step through RPS levels to measure performance at each level
// ---------------------------------------------------------------------------
const RPS_STEPS = (__ENV.RPS_STEPS || '100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950,1000')
    .split(',').map(Number);
const STEP_DURATION = __ENV.STEP_DURATION || '30s';

/**
 * Seconds of idle time after each RPS step before the next step starts.
 * k6 cannot poll "VUs == 0"; this gap lets the previous scenario finish in-flight work.
 * Set STEP_GAP_SEC=0 to disable (steps back-to-back).
 * Unset defaults to 60s (covers k6 default gracefulStop ~30s + buffer so steps rarely overlap).
 */
const STEP_GAP_SEC =
  __ENV.STEP_GAP_SEC === undefined || __ENV.STEP_GAP_SEC === ''
    ? 60
    : Math.max(0, parseInt(__ENV.STEP_GAP_SEC, 10) || 0);

const scenarios = {};
let _startOffset = 0;
const stepDurSec = parseInt(STEP_DURATION, 10) || 30;

for (const rps of RPS_STEPS) {
  scenarios[`rps_${rps}`] = {
    executor: 'constant-arrival-rate',
    rate: rps,
    timeUnit: '1s',
    duration: STEP_DURATION,
    preAllocatedVUs: Math.max(rps * 2, 100),
    maxVUs: Math.max(rps * 5, 500),
    startTime: `${_startOffset}s`,
  };
  _startOffset += stepDurSec + STEP_GAP_SEC;
}

const perScenarioThresholds = {};
const perScenarioSuccessThresholds = {};
for (const rps of RPS_STEPS) {
  perScenarioThresholds[`http_req_duration{scenario:rps_${rps}}`] = ['max>=0'];
  perScenarioThresholds[`http_req_failed{scenario:rps_${rps}}`] = ['rate>=0'];
  // Force k6 to materialize scenario-tagged submetrics for custom success-only trend.
  perScenarioSuccessThresholds[`custom_response_time_success_by_scenario{scenario:rps_${rps}}`] = ['max>=0'];
}

export const options = {
  scenarios,
  thresholds: {
    http_req_duration:             ['p(95)<2000', 'p(99)<5000'],
    custom_error_rate:             ['rate<0.05'],
    ...endpointThresholds,
    ...perScenarioThresholds,
    ...perScenarioSuccessThresholds,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function recordMetrics(res, endpointTrend) {
  responseTimeTrend.add(res.timings.duration);
  endpointTrend.add(res.timings.duration);
  requestCount.add(1);
  errorRate.add(res.status >= 400 || res.status === 0);
  if (res.status > 0 && res.status < 400) {
    responseTimeSuccessByScenario.add(res.timings.duration, { scenario: exec.scenario.name });
  }

  const upstream = res.headers['X-Response-Time'] || res.headers['x-response-time'];
  if (upstream) {
    upstreamTimeTrend.add(parseFloat(upstream));
  }
}

const _loggedErrors = {};
function logFirstError(label, res) {
  if (res.status >= 400 && !_loggedErrors[label]) {
    _loggedErrors[label] = true;
    console.warn(
        `[${label}] status=${res.status} body=${res.body ? res.body.substring(0, 300) : '(empty)'}`,
    );
  }
}

const JSON_HEADERS = { headers: { 'Content-Type': 'application/json' } };

// ---------------------------------------------------------------------------
// Endpoint test functions
// ---------------------------------------------------------------------------

// ---- GET /api/stock/get/:stockId ----
function testGetStock() {
  const stockId = pickRandom(TEST_STOCK_IDS);
  const res = group('GET /api/stock/get/:stockId', () =>
      http.get(`${baseUrl()}/api/stock/get/${stockId}`, {
        tags: { endpoint: 'get_stock' },
      })
  );
  check(res, {
    'get_stock: status 200|404': (r) => r.status === 200 || r.status === 404,
    'get_stock: has body':       (r) => r.body && r.body.length > 0,
  });
  recordMetrics(res, trendGetStock);
}

// ---- GET /api/stock/getAllStocksId ----
function testGetAllStockIds() {
  const res = group('GET /api/stock/getAllStocksId', () =>
      http.get(`${baseUrl()}/api/stock/getAllStocksId`, {
        tags: { endpoint: 'get_all_stock_ids' },
      })
  );
  check(res, {
    'get_all_ids: status 200': (r) => r.status === 200,
    'get_all_ids: is array':   (r) => {
      try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
    },
  });
  recordMetrics(res, trendGetAllIds);
}

// ---- GET /api/user/getDetail/:userId ----
function testGetUserDetail() {
  const userId = pickRandom(TEST_USER_IDS);
  const res = group('GET /api/user/getDetail/:userId', () =>
      http.get(`${baseUrl()}/api/user/getDetail/${userId}`, {
        tags: { endpoint: 'get_user_detail' },
      })
  );
  check(res, {
    'get_user: status 200|404': (r) => r.status === 200 || r.status === 404,
  });
  recordMetrics(res, trendGetUser);
}

// ---- PUT /api/user/update (safe fields only, then revert) ----
function testUpdateUser() {
  group('PUT /api/user/update (round-trip)', () => {
    const res1 = http.put(
        `${baseUrl()}/api/user/update`,
        JSON.stringify(USER_UPDATE_MODIFIED),
        { ...JSON_HEADERS, tags: { endpoint: 'update_user', phase: 'modify' } },
    );
    check(res1, {
      'update_user (modify): status 200': (r) => r.status === 200,
    });
    logFirstError('update_user_modify', res1);
    recordMetrics(res1, trendUpdateUser);

    const res2 = http.put(
        `${baseUrl()}/api/user/update`,
        JSON.stringify(USER_UPDATE_ORIGINAL),
        { ...JSON_HEADERS, tags: { endpoint: 'update_user', phase: 'revert' } },
    );
    check(res2, {
      'update_user (revert): status 200': (r) => r.status === 200,
    });
    logFirstError('update_user_revert', res2);
    recordMetrics(res2, trendUpdateUser);
  });
}

// ---- POST /api/user/login ----
function testLogin() {
  const res = group('POST /api/user/login', () =>
      http.post(
          `${baseUrl()}/api/user/login`,
          JSON.stringify(LOGIN_CREDS),
          { ...JSON_HEADERS, tags: { endpoint: 'login' } },
      )
  );
  check(res, {
    'login: status 200|401': (r) => r.status === 200 || r.status === 401,
  });
  logFirstError('login', res);
  recordMetrics(res, trendLogin);
}

// ---- POST addFavoriteStock ? removeFavoriteStock (paired) ----
function testFavoriteStock() {
  const userId = pickRandom(TEST_USER_IDS);
  const payload = {
    userId: userId,
    stockId: FAVORITE_STOCK_ID,
  };

  group('POST /api/user/addFavoriteStock + removeFavoriteStock', () => {
    const addRes = http.post(
        `${baseUrl()}/api/user/addFavoriteStock`,
        JSON.stringify(payload),
        { ...JSON_HEADERS, tags: { endpoint: 'favorite_stock', action: 'add' } },
    );
    check(addRes, {
      'addFavorite: status 200': (r) => r.status === 200,
    });
    logFirstError('addFavoriteStock', addRes);
    recordMetrics(addRes, trendFavoriteStock);

    const removeRes = http.post(
        `${baseUrl()}/api/user/removeFavoriteStock`,
        JSON.stringify(payload),
        { ...JSON_HEADERS, tags: { endpoint: 'favorite_stock', action: 'remove' } },
    );
    check(removeRes, {
      'removeFavorite: status 200': (r) => r.status === 200,
    });
    logFirstError('removeFavoriteStock', removeRes);
    recordMetrics(removeRes, trendFavoriteStock);
  });
}

// ---- GET /api/ahpConfig/get/:userId ----
function testGetAhpConfig() {
  const userId = pickRandom(TEST_USER_IDS);
  const res = group('GET /api/ahpConfig/get/:userId', () =>
      http.get(`${baseUrl()}/api/ahpConfig/get/${userId}`, {
        tags: { endpoint: 'get_ahp_config' },
      })
  );
  check(res, {
    'get_ahp: status 200|404': (r) => r.status === 200 || r.status === 404,
  });
  recordMetrics(res, trendGetAhpConfig);
}

// ---- PUT /api/ahpConfig/update (modify ? revert) ----
function testUpdateAhpConfig() {
  group('PUT /api/ahpConfig/update (round-trip)', () => {
    const modified = {
      ahpConfigId: AHP_CONFIG_ID,
      userId: AHP_USER_ID,
      pairwiseMatrixJson: AHP_MODIFIED_MATRIX,
    };
    const res1 = http.put(
        `${baseUrl()}/api/ahpConfig/update`,
        JSON.stringify(modified),
        { ...JSON_HEADERS, tags: { endpoint: 'update_ahp_config', phase: 'modify' } },
    );
    check(res1, {
      'update_ahp (modify): status 200': (r) => r.status === 200,
    });
    logFirstError('update_ahp_modify', res1);
    recordMetrics(res1, trendUpdateAhpConfig);

    const reverted = {
      ahpConfigId: AHP_CONFIG_ID,
      userId: AHP_USER_ID,
      pairwiseMatrixJson: AHP_ORIGINAL_MATRIX,
    };
    const res2 = http.put(
        `${baseUrl()}/api/ahpConfig/update`,
        JSON.stringify(reverted),
        { ...JSON_HEADERS, tags: { endpoint: 'update_ahp_config', phase: 'revert' } },
    );
    check(res2, {
      'update_ahp (revert): status 200': (r) => r.status === 200,
    });
    logFirstError('update_ahp_revert', res2);
    recordMetrics(res2, trendUpdateAhpConfig);
  });
}

// ---- GET /api/stockYearData/get/:stockId/:year ----
function testGetStockYearData() {
  const stockId = pickRandom(TEST_STOCK_IDS);
  const year    = pickRandom(TEST_YEARS);
  const res = group('GET /api/stockYearData/get/:stockId/:year', () =>
      http.get(`${baseUrl()}/api/stockYearData/get/${stockId}/${year}`, {
        tags: { endpoint: 'get_stock_year_data' },
      })
  );
  check(res, {
    'get_year_data: status 200|404': (r) => r.status === 200 || r.status === 404,
  });
  recordMetrics(res, trendGetYearData);
}

// ---- POST /api/portfolio/allocate ----
function testPortfolioAllocate() {
  const res = group('POST /api/portfolio/allocate', () =>
      http.post(
          `${baseUrl()}/api/portfolio/allocate`,
          JSON.stringify(PORTFOLIO_REQ),
          { ...JSON_HEADERS, tags: { endpoint: 'portfolio_allocate' } },
      )
  );
  check(res, {
    'portfolio: status 200': (r) => r.status === 200,
    'portfolio: success':    (r) => {
      try { return JSON.parse(r.body).success === true; } catch { return false; }
    },
  });
  logFirstError('portfolio_allocate', res);
  recordMetrics(res, trendPortfolio);
}

// ---------------------------------------------------------------------------
// Weighted random endpoint selection
// ---------------------------------------------------------------------------
const endpointTable = [];
for (const [name, weight] of Object.entries(WEIGHTS)) {
  const count = Math.round(weight * 100);
  for (let i = 0; i < count; i++) {
    endpointTable.push(name);
  }
}

const endpointFunctions = {
  getStock:          testGetStock,
  getAllStockIds:     testGetAllStockIds,
  getUserDetail:     testGetUserDetail,
  updateUser:        testUpdateUser,
  login:             testLogin,
  favoriteStock:     testFavoriteStock,
  getAhpConfig:      testGetAhpConfig,
  updateAhpConfig:   testUpdateAhpConfig,
  getStockYearData:  testGetStockYearData,
  portfolioAllocate: testPortfolioAllocate,
};

// ---------------------------------------------------------------------------
// Main VU function
// ---------------------------------------------------------------------------
export default function () {
  const selected = pickRandom(endpointTable);
  const fn = endpointFunctions[selected];
  if (fn) fn();
  sleep(Math.random() * 0.5);
}

// ---------------------------------------------------------------------------
// Lifecycle hooks
// ---------------------------------------------------------------------------
export function setup() {
  console.log('========================================');
  console.log(`  Targets:    ${BASE_URLS.join(' , ')}`);
  console.log(`  Mode:       ${READ_ONLY ? 'READ-ONLY (writes disabled)' : 'FULL (reads + writes)'}`);
  console.log(`  RPS Steps:  ${RPS_STEPS.join(', ')}`);
  console.log(`  Step Dur:   ${STEP_DURATION} each`);
  console.log(`  Step gap:   ${STEP_GAP_SEC}s idle after each step before the next (STEP_GAP_SEC; 0 = no gap)`);
  const estSec =
    RPS_STEPS.length * stepDurSec + Math.max(0, RPS_STEPS.length - 1) * STEP_GAP_SEC;
  console.log(`  Est. span:  ~${estSec}s active+gap (excl. gracefulStop tail)`);
  console.log(`  Stock IDs:  ${TEST_STOCK_IDS.join(', ')}`);
  console.log(`  User IDs:   ${TEST_USER_IDS.join(', ')}`);
  console.log(`  Years:      ${TEST_YEARS.join(', ')}`);
  console.log('========================================');

  for (const url of BASE_URLS) {
    const health = http.get(`${url}/health`);
    const ok = check(health, {
      [`setup: ${url} is reachable`]: (r) => r.status === 200,
    });
    if (!ok) {
      console.error(`API unreachable at ${url}/health — test may fail`);
    }
  }

  return { startTime: Date.now() };
}

export function teardown(data) {
  const elapsed = ((Date.now() - data.startTime) / 1000).toFixed(1);
  console.log(`Test completed in ${elapsed}s`);
}

function fmtMs(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  return `${value.toFixed(2)}ms`;
}

export function handleSummary(data) {
  const csvPath = __ENV.SIMPLE_CSV_PATH || 'summary-simple.csv';
  const lines = ['rps,avg,min,max,med,p(90),p(95),error_rate,avg_success,min_success,max_success,med_success,p(90)_success,p(95)_success'];

  for (const rps of RPS_STEPS) {
    const durationKey = `http_req_duration{scenario:rps_${rps}}`;
    const failedKey = `http_req_failed{scenario:rps_${rps}}`;
    const successKey = `custom_response_time_success_by_scenario{scenario:rps_${rps}}`;

    const duration = data.metrics[durationKey];
    const failed = data.metrics[failedKey];
    const success = data.metrics[successKey];

    if (!duration || !duration.values) continue;

    const v = duration.values;
    if (typeof v.avg !== 'number') continue;

    const errRate = failed && failed.values
        ? `${(failed.values.rate * 100).toFixed(2)}%`
        : '0.00%';
    const sv = success?.values;

    lines.push([
      rps,
      fmtMs(v.avg),
      fmtMs(v.min),
      fmtMs(v.max),
      fmtMs(v.med),
      fmtMs(v['p(90)']),
      fmtMs(v['p(95)']),
      errRate,
      fmtMs(sv?.avg),
      fmtMs(sv?.min),
      fmtMs(sv?.max),
      fmtMs(sv?.med),
      fmtMs(sv?.['p(90)']),
      fmtMs(sv?.['p(95)']),
    ].join(','));
  }

  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    [csvPath]: `${lines.join('\n')}\n`,
  };
}

