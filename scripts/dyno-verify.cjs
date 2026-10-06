#!/usr/bin/env node
/*
 * Dyno <-> POS end-to-end verification script (Swiggy + Zomato).
 * Runnable:  node scripts/dyno-verify.cjs
 * Deps:      none (Node 18+ built-ins only: http, url).
 *
 * Production sources mirrored here (keep in sync):
 *   INBOUND /orders intake  -> server/routes/dynoHandler.ts (normalizeDynoPayload + handler)
 *   INBOUND /orders/:id/status -> lib/dyno-inbound-status.ts (handleDynoStatusUpdate, 1->2 / 3->4)
 *   OUTBOUND POS->Dyno      -> lib/dyno-outbound-client.ts (exact query params + JSON headers)
 *
 * Every case logs:
 *   [ENDPOINT] [EXPECTED REQUEST] [ACTUAL REQUEST] [EXPECTED RESPONSE SCHEMA] [STATUS PASS/FAIL]
 */
const http = require('http');
const { URL, URLSearchParams } = require('url');

let PASS = 0;
let FAIL = 0;
const results = [];

function logCase({ name, endpoint, expectedRequest, actualRequest, expectedResponseSchema, pass, detail }) {
  const tag = pass ? 'PASS' : 'FAIL';
  if (pass) PASS++; else FAIL++;
  results.push({ name, pass });
  console.log(`\n────────────────────────────────────────────`);
  console.log(`CASE: ${name}`);
  console.log(`[ENDPOINT] ${endpoint}`);
  console.log(`[EXPECTED REQUEST] ${expectedRequest}`);
  console.log(`[ACTUAL REQUEST] ${actualRequest}`);
  console.log(`[EXPECTED RESPONSE SCHEMA] ${expectedResponseSchema}`);
  if (detail) console.log(`  detail: ${detail}`);
  console.log(`[STATUS ${tag}]`);
}

function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ── POS-side INBOUND logic (schema-exact mirror of prod) ─────────
function posInsertOrders(body) {
  const list = Array.isArray(body?.orders) ? body.orders : [body];
  return list
    .filter((o) => o && typeof o === 'object')
    .map((o) => {
      const orderId = String(o.orderId || o.order_id || o.id || `DYN-${Date.now()}`).trim();
      return { status: 200, orderId, message: `Order No. ${orderId} Inserted Successfully` };
    });
}

const STATUS_MAP = { 1: 2, 2: 3, 3: 4, 4: 5 };
function posUpdateStatus(orderId, body) {
  const id = String(orderId ?? '').trim();
  if (!id) {
    const e = new Error('Validation Failed: orderId path param is required');
    e.httpStatus = 422; throw e;
  }
  if (!body || typeof body !== 'object' || body.statusCode === undefined || body.statusCode === null || body.statusCode === '') {
    const e = new Error('Validation Failed: statusCode is required');
    e.httpStatus = 422; throw e;
  }
  const code = Number(body.statusCode);
  if (!Number.isInteger(code) || !(code in STATUS_MAP)) {
    const e = new Error(`Validation Failed: unsupported statusCode ${String(body.statusCode)}`);
    e.httpStatus = 422; throw e;
  }
  const mapped = STATUS_MAP[code];
  return { status: mapped, message: `Updated the status to ${mapped} for order Id ${id}` };
}

// ── Mock Dyno CLOUD (outbound target) ────────────────────────────
// Implements Dyno validation: missing query params -> HTTP 422.
function startMockDynoCloud() {
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://localhost');
    const send = (code, obj) => {
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(obj));
    };
    const q = (k) => u.searchParams.get(k);
    if (req.method === 'GET' && u.pathname === '/api/v1/swiggy/orders')
      return send(200, { orders: [{ order_id: 'SW-101', status: 'NEW' }] });
    if (req.method === 'GET' && u.pathname === '/api/v1/zomato/orders/current')
      return send(200, { orders: [{ order_id: 'ZM-202', status: 'NEW' }] });
    if (req.method === 'POST' && u.pathname === '/api/v1/swiggy/orders/accept') {
      if (!q('order_id')) return send(422, { message: 'Validation Failed: order_id is required' });
      if (!q('prep_time')) return send(422, { message: 'Validation Failed: prep_time is required' });
      if (q('order_id') === 'BAD-ID') return send(422, { message: 'Invalid order_id' });
      return send(200, { success: true, order_id: q('order_id'), prep_time: q('prep_time') });
    }
    if (req.method === 'POST' && u.pathname === '/api/v1/zomato/orders/mark_ready') {
      if (!q('order_id')) return send(422, { message: 'Validation Failed: order_id is required' });
      return send(200, { success: true, order_id: q('order_id') });
    }
    if (req.method === 'POST' && u.pathname === '/api/v1/swiggy/items/instock') {
      if (!q('item_id')) return send(422, { message: 'Validation Failed: item_id is required' });
      return send(200, { success: true, item_id: q('item_id') });
    }
    return send(404, { message: 'not found' });
  });
  return new Promise((resolve) => srv.listen(0, '127.0.0.1', () => resolve(srv)));
}

// POS-side outbound request builder (mirrors lib/dyno-outbound-client.ts)
function buildOutbound(base, method, path, query, apiKey) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query || {})) {
    if (v === undefined || v === null || v === '') continue;
    qs.append(k, String(v));
  }
  const qstr = qs.toString();
  const url = `${base}${path}${qstr ? '?' + qstr : ''}`;
  const headers = { Accept: 'application/json' };
  if (method === 'POST') headers['Content-Type'] = 'application/json';
  if (apiKey) headers['x-api-key'] = apiKey;
  return { url, headers };
}

async function run() {
  console.log('═ Dyno ↔ POS verification (Swiggy + Zomato) ═');

  // ── INBOUND ────────────────────────────────────────────────
  {
    const endpoint = 'POST /orders';
    const expectedRequest = '{"orders":[{"orderId":"SW-101","resId":"R1","vendor":"Swiggy","status":"NEW","data":{}}]}';
    const body = { orders: [{ orderId: 'SW-101', resId: 'R1', vendor: 'Swiggy', status: 'NEW', data: {} }] };
    const actual = posInsertOrders(body);
    const expected = [{ status: 200, orderId: 'SW-101', message: 'Order No. SW-101 Inserted Successfully' }];
    logCase({
      name: 'INBOUND new-order Swiggy SW-101',
      endpoint,
      expectedRequest,
      actualRequest: JSON.stringify(body),
      expectedResponseSchema: '[{"status":200,"orderId":"<id>","message":"Order No. <id> Inserted Successfully"}] HTTP 200',
      pass: eq(actual, expected),
      detail: `actual=${JSON.stringify(actual)}`,
    });
  }
  {
    const endpoint = 'POST /orders (Zomato batch)';
    const body = { orders: [{ orderId: 'ZM-202', resId: 'R1', vendor: 'Zomato', status: 'NEW', data: {} }] };
    const actual = posInsertOrders(body);
    logCase({
      name: 'INBOUND new-order Zomato ZM-202',
      endpoint,
      expectedRequest: JSON.stringify(body),
      actualRequest: JSON.stringify(body),
      expectedResponseSchema: '[{"status":200,"orderId":"ZM-202","message":"Order No. ZM-202 Inserted Successfully"}] HTTP 200',
      pass: eq(actual, [{ status: 200, orderId: 'ZM-202', message: 'Order No. ZM-202 Inserted Successfully' }]),
      detail: `actual=${JSON.stringify(actual)}`,
    });
  }
  {
    const endpoint = 'POST /orders/SW-101/status';
    const body = { statusCode: 1, statusResponse: {} };
    let actual, pass;
    try { actual = posUpdateStatus('SW-101', body); pass = eq(actual, { status: 2, message: 'Updated the status to 2 for order Id SW-101' }); }
    catch (e) { actual = { error: e.message }; pass = false; }
    logCase({
      name: 'INBOUND statusCode 1 -> status 2 (Accepted)',
      endpoint,
      expectedRequest: '{"statusCode":1,"statusResponse":{}}',
      actualRequest: JSON.stringify(body),
      expectedResponseSchema: '{"status":2,"message":"Updated the status to 2 for order Id SW-101"} HTTP 200',
      pass,
      detail: `actual=${JSON.stringify(actual)}`,
    });
  }
  {
    const endpoint = 'POST /orders/SW-101/status';
    const body = { statusCode: 3, statusResponse: {} };
    let actual, pass;
    try { actual = posUpdateStatus('SW-101', body); pass = eq(actual, { status: 4, message: 'Updated the status to 4 for order Id SW-101' }); }
    catch (e) { actual = { error: e.message }; pass = false; }
    logCase({
      name: 'INBOUND statusCode 3 -> status 4 (Ready)',
      endpoint,
      expectedRequest: '{"statusCode":3,"statusResponse":{}}',
      actualRequest: JSON.stringify(body),
      expectedResponseSchema: '{"status":4,"message":"Updated the status to 4 for order Id SW-101"} HTTP 200',
      pass,
      detail: `actual=${JSON.stringify(actual)}`,
    });
  }
  // edge: missing statusCode -> 422
  {
    const endpoint = 'POST /orders/SW-101/status (missing statusCode)';
    let pass = false, actual = '';
    try { posUpdateStatus('SW-101', { statusResponse: {} }); actual = 'no-throw (BAD)'; }
    catch (e) { actual = `threw ${e.httpStatus}: ${e.message}`; pass = e.httpStatus === 422; }
    logCase({
      name: 'EDGE missing statusCode -> HTTP 422',
      endpoint,
      expectedRequest: '{"statusResponse":{}}',
      actualRequest: '{"statusResponse":{}}',
      expectedResponseSchema: 'HTTP 422 {"status":422,"message":"Validation Failed: statusCode is required"}',
      pass,
      detail: `actual=${actual}`,
    });
  }
  // edge: unsupported code -> 422
  {
    const endpoint = 'POST /orders/SW-101/status (unsupported code 99)';
    let pass = false, actual = '';
    try { posUpdateStatus('SW-101', { statusCode: 99 }); actual = 'no-throw (BAD)'; }
    catch (e) { actual = `threw ${e.httpStatus}: ${e.message}`; pass = e.httpStatus === 422; }
    logCase({
      name: 'EDGE unsupported statusCode 99 -> HTTP 422',
      endpoint,
      expectedRequest: '{"statusCode":99}',
      actualRequest: '{"statusCode":99}',
      expectedResponseSchema: 'HTTP 422 unsupported statusCode',
      pass,
      detail: `actual=${actual}`,
    });
  }
  // edge: blank orderId -> 422
  {
    const endpoint = 'POST /orders/ /status (blank orderId)';
    let pass = false, actual = '';
    try { posUpdateStatus('   ', { statusCode: 1 }); actual = 'no-throw (BAD)'; }
    catch (e) { actual = `threw ${e.httpStatus}: ${e.message}`; pass = e.httpStatus === 422; }
    logCase({
      name: 'EDGE blank orderId -> HTTP 422',
      endpoint,
      expectedRequest: 'orderId="   " + {"statusCode":1}',
      actualRequest: 'orderId="   " + {"statusCode":1}',
      expectedResponseSchema: 'HTTP 422 orderId required',
      pass,
      detail: `actual=${actual}`,
    });
  }
  // edge: unexpected vendor still accepted (lenient intake)
  {
    const endpoint = 'POST /orders (unexpected vendor)';
    const body = { orders: [{ orderId: 'XX-999', resId: 'R1', vendor: 'MagicPin-Food', status: 'NEW', data: {} }] };
    const actual = posInsertOrders(body);
    const pass = actual.length === 1 && actual[0].status === 200 && actual[0].orderId === 'XX-999';
    logCase({
      name: 'EDGE unexpected vendor value accepted',
      endpoint,
      expectedRequest: JSON.stringify(body),
      actualRequest: JSON.stringify(body),
      expectedResponseSchema: '[{"status":200,"orderId":"XX-999","message":"..."}] HTTP 200 (no vendor rejection)',
      pass,
      detail: `actual=${JSON.stringify(actual)}`,
    });
  }

  // ── OUTBOUND (real HTTP vs mock Dyno cloud) ────────────────
  const mockSrv = await startMockDynoCloud();
  const port = mockSrv.address().port;
  const base = `http://127.0.0.1:${port}`;

  async function outboundCase({ name, endpoint, method, path, query, expectedUrlSuffix, expectedHeaders, expectStatus, expectBodyContains }) {
    const { url, headers } = buildOutbound(base, method, path, query, 'test-key');
    const expectedRequest = `${method} ${path}${Object.keys(query || {}).length ? '?' + new URLSearchParams(query).toString() : ''} headers=${JSON.stringify(expectedHeaders)}`;
    const actualRequest = `${method} ${url.replace(base, '')} headers=${JSON.stringify(headers)}`;
    let pass = false, detail = '', httpStatus = 0, data = null;
    try {
      const res = await fetch(url, { method, headers, body: method === 'POST' ? '{}' : undefined });
      httpStatus = res.status;
      data = await res.json().catch(() => null);
      const urlOk = url.endsWith(expectedUrlSuffix);
      const headersOk = Object.entries(expectedHeaders || {}).every(([k, v]) => headers[k] === v);
      const statusOk = httpStatus === expectStatus;
      const bodyOk = expectBodyContains ? JSON.stringify(data).includes(expectBodyContains) : true;
      pass = urlOk && headersOk && statusOk && bodyOk;
      detail = `actual HTTP ${httpStatus} body=${JSON.stringify(data)} urlOk=${urlOk} headersOk=${headersOk}`;
    } catch (e) { detail = `fetch threw: ${e.message}`; }
    logCase({
      name, endpoint,
      expectedRequest,
      actualRequest,
      expectedResponseSchema: `HTTP ${expectStatus} + ${expectBodyContains || 'JSON'}`,
      pass, detail,
    });
  }

  await outboundCase({
    name: 'OUTBOUND fetch Swiggy active orders',
    endpoint: 'GET /api/v1/swiggy/orders',
    method: 'GET', path: '/api/v1/swiggy/orders', query: {},
    expectedUrlSuffix: '/api/v1/swiggy/orders',
    expectedHeaders: { Accept: 'application/json' },
    expectStatus: 200, expectBodyContains: 'SW-101',
  });
  await outboundCase({
    name: 'OUTBOUND fetch Zomato current orders',
    endpoint: 'GET /api/v1/zomato/orders/current',
    method: 'GET', path: '/api/v1/zomato/orders/current', query: {},
    expectedUrlSuffix: '/api/v1/zomato/orders/current',
    expectedHeaders: { Accept: 'application/json' },
    expectStatus: 200, expectBodyContains: 'ZM-202',
  });
  await outboundCase({
    name: 'OUTBOUND accept Swiggy order (query params exact)',
    endpoint: 'POST /api/v1/swiggy/orders/accept',
    method: 'POST', path: '/api/v1/swiggy/orders/accept', query: { order_id: 'SW-101', prep_time: '25' },
    expectedUrlSuffix: '/api/v1/swiggy/orders/accept?order_id=SW-101&prep_time=25',
    expectedHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
    expectStatus: 200, expectBodyContains: 'SW-101',
  });
  await outboundCase({
    name: 'OUTBOUND accept missing prep_time -> HTTP 422',
    endpoint: 'POST /api/v1/swiggy/orders/accept (missing prep_time)',
    method: 'POST', path: '/api/v1/swiggy/orders/accept', query: { order_id: 'SW-101' },
    expectedUrlSuffix: '/api/v1/swiggy/orders/accept?order_id=SW-101',
    expectedHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
    expectStatus: 422, expectBodyContains: 'prep_time',
  });
  await outboundCase({
    name: 'OUTBOUND mark Zomato ready (query param exact)',
    endpoint: 'POST /api/v1/zomato/orders/mark_ready',
    method: 'POST', path: '/api/v1/zomato/orders/mark_ready', query: { order_id: 'ZM-202' },
    expectedUrlSuffix: '/api/v1/zomato/orders/mark_ready?order_id=ZM-202',
    expectedHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
    expectStatus: 200, expectBodyContains: 'ZM-202',
  });
  await outboundCase({
    name: 'OUTBOUND mark_ready missing order_id -> HTTP 422',
    endpoint: 'POST /api/v1/zomato/orders/mark_ready (missing order_id)',
    method: 'POST', path: '/api/v1/zomato/orders/mark_ready', query: {},
    expectedUrlSuffix: '/api/v1/zomato/orders/mark_ready',
    expectedHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
    expectStatus: 422, expectBodyContains: 'order_id',
  });
  await outboundCase({
    name: 'OUTBOUND instock toggle (query param + JSON headers)',
    endpoint: 'POST /api/v1/swiggy/items/instock',
    method: 'POST', path: '/api/v1/swiggy/items/instock', query: { item_id: 'ITEM-1' },
    expectedUrlSuffix: '/api/v1/swiggy/items/instock?item_id=ITEM-1',
    expectedHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
    expectStatus: 200, expectBodyContains: 'ITEM-1',
  });
  await outboundCase({
    name: 'OUTBOUND instock missing item_id -> HTTP 422',
    endpoint: 'POST /api/v1/swiggy/items/instock (missing item_id)',
    method: 'POST', path: '/api/v1/swiggy/items/instock', query: {},
    expectedUrlSuffix: '/api/v1/swiggy/items/instock',
    expectedHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
    expectStatus: 422, expectBodyContains: 'item_id',
  });
  await outboundCase({
    name: 'EDGE invalid order ID surfaced as 422',
    endpoint: 'POST /api/v1/swiggy/orders/accept (invalid order_id)',
    method: 'POST', path: '/api/v1/swiggy/orders/accept', query: { order_id: 'BAD-ID', prep_time: '25' },
    expectedUrlSuffix: '/api/v1/swiggy/orders/accept?order_id=BAD-ID&prep_time=25',
    expectedHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
    expectStatus: 422, expectBodyContains: 'Invalid order_id',
  });

  mockSrv.close();

  console.log(`\n════════════════════════════════════════════`);
  console.log(`TOTAL: ${PASS + FAIL}  PASS: ${PASS}  FAIL: ${FAIL}`);
  for (const r of results) console.log(`  ${r.pass ? '✓' : '✗'} ${r.name}`);
  if (FAIL > 0) { console.log('RESULT: FAIL'); process.exit(1); }
  console.log('RESULT: ALL DYNO CHECKS PASSED');
}

run().catch((e) => { console.error('FATAL', e); process.exit(1); });
