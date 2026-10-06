/**
 * Dyno ↔ POS integration suite (Swiggy + Zomato).
 *
 * Covers:
 *  1. INBOUND  POST /orders (Dyno -> POS)                — exact Dyno response schema
 *  2. INBOUND  POST /orders/{orderId}/status (Dyno -> POS) — statusCode 1->2, 3->4
 *  3. OUTBOUND GET/POST /api/v1/... (POS -> Dyno)          — query-param + header + 200/422 contracts
 *  4. Failure/validation cases (missing fields, bad IDs, unexpected vendor, HTTP 422)
 *
 * Strategy: real HTTP against the Express `app` on an ephemeral port for
 * inbound (true end-to-end), plus injected-mock fetch for outbound
 * (no network, asserts exact outgoing URL / headers / query params).
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { AddressInfo } from 'net';
import { app } from '../../server/app';
import { normalizeDynoPayload } from '../../server/routes/dynoHandler';
import {
  handleDynoStatusUpdate,
  validateDynoStatusBody,
  mapDynoStatusCodeToPosStatus,
} from '../lib/dyno-inbound-status';
import {
  getSwiggyActiveOrders,
  getZomatoCurrentOrders,
  acceptSwiggyOrder,
  markZomatoOrderReady,
  toggleSwiggyItemInStock,
  type DynoClientConfig,
} from '../lib/dyno-outbound-client';

// ── test server ──────────────────────────────────────────────────
let baseUrl = '';
let server: ReturnType<typeof app.listen> | null = null;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });
  const addr = server!.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    if (!server) return resolve();
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function postJson(path: string, body: any) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { httpStatus: res.status, json };
}

// ── mock-fetch factory for outbound ──────────────────────────────
function mockFetchFactory(handler: (url: string, init: any) => any) {
  const calls: Array<{ url: string; init: any }> = [];
  const fn = vi.fn(async (url: string, init: any) => {
    calls.push({ url, init });
    return handler(url, init);
  });
  return { fn: fn as unknown as typeof fetch, calls };
}

function jsonResponse(status: number, payload: any) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  };
}

const TEST_CFG = (fetchImpl: typeof fetch): DynoClientConfig => ({
  baseUrl: 'https://dynoapis.example',
  apiKey: 'test-key-123',
  fetchImpl,
  timeoutMs: 5000,
});

// ══════════════════════════════════════════════════════════════════
describe('INBOUND webhooks (Dyno -> POS)', () => {
  describe('POST /orders — new-order intake', () => {
    it('returns exact Dyno schema for Swiggy SW-101', async () => {
      const payload = {
        orders: [{ orderId: 'SW-101', resId: 'R1', vendor: 'Swiggy', status: 'NEW', data: {} }],
      };
      const { httpStatus, json } = await postJson('/orders', payload);
      expect(httpStatus).toBe(200);
      expect(Array.isArray(json)).toBe(true);
      expect(json).toHaveLength(1);
      expect(json[0]).toEqual({
        status: 200,
        orderId: 'SW-101',
        message: 'Order No. SW-101 Inserted Successfully',
      });
    });

    it('accepts the canonical /api/webhooks/dyno path with identical schema', async () => {
      const payload = {
        orders: [{ orderId: 'SW-101', resId: 'R1', vendor: 'Swiggy', status: 'NEW', data: {} }],
      };
      const { httpStatus, json } = await postJson('/api/webhooks/dyno', payload);
      expect(httpStatus).toBe(200);
      expect(json[0]).toMatchObject({ status: 200, orderId: 'SW-101' });
      expect(json[0].message).toBe('Order No. SW-101 Inserted Successfully');
    });

    it('handles Zomato payloads and multi-order batches', async () => {
      const payload = {
        orders: [
          { orderId: 'ZM-202', resId: 'R1', vendor: 'Zomato', status: 'NEW', data: {} },
          { orderId: 'SW-102', resId: 'R1', vendor: 'Swiggy', status: 'NEW', data: {} },
        ],
      };
      const { httpStatus, json } = await postJson('/orders', payload);
      expect(httpStatus).toBe(200);
      expect(json).toHaveLength(2);
      expect(json[0].orderId).toBe('ZM-202');
      expect(json[1].orderId).toBe('SW-102');
      for (const row of json) {
        expect(typeof row.status).toBe('number');
        expect(typeof row.orderId).toBe('string');
        expect(typeof row.message).toBe('string');
        expect(row.message).toContain(row.orderId);
      }
    });

    it('normalizes unexpected vendor values instead of rejecting (lenient intake)', () => {
      const norm = normalizeDynoPayload({
        orderId: 'XX-999',
        resId: 'R1',
        vendor: 'MagicPin-Food',
        status: 'NEW',
        data: {},
      });
      expect(norm.orderId).toBe('XX-999');
      expect(norm.source).toContain('magicpin');
    });

    it('still inserts when optional fields are missing (fallback IDs, never 500)', async () => {
      const { httpStatus, json } = await postJson('/orders', {
        orders: [{ vendor: 'Swiggy', status: 'NEW', data: {} }],
      });
      expect(httpStatus).toBe(200);
      expect(Array.isArray(json)).toBe(true);
      expect(json[0].status).toBe(200);
      expect(typeof json[0].orderId).toBe('string');
    });
  });

  describe('POST /orders/{orderId}/status — status events', () => {
    it('maps statusCode 1 -> status 2 (Accepted) with exact message', async () => {
      const { httpStatus, json } = await postJson('/orders/SW-101/status', {
        statusCode: 1,
        statusResponse: {},
      });
      expect(httpStatus).toBe(200);
      expect(json).toEqual({ status: 2, message: 'Updated the status to 2 for order Id SW-101' });
    });

    it('maps statusCode 3 -> status 4 (Ready) with exact message', async () => {
      const { httpStatus, json } = await postJson('/orders/SW-101/status', {
        statusCode: 3,
        statusResponse: {},
      });
      expect(httpStatus).toBe(200);
      expect(json).toEqual({ status: 4, message: 'Updated the status to 4 for order Id SW-101' });
    });

    it('mirrors the same contract on /api/orders/{orderId}/status', async () => {
      const { httpStatus, json } = await postJson('/api/orders/ZM-202/status', {
        statusCode: 1,
        statusResponse: {},
      });
      expect(httpStatus).toBe(200);
      expect(json).toEqual({ status: 2, message: 'Updated the status to 2 for order Id ZM-202' });
    });

    it('pure handler maps 1->2 and 3->4', () => {
      expect(mapDynoStatusCodeToPosStatus(1)).toBe(2);
      expect(mapDynoStatusCodeToPosStatus(3)).toBe(4);
      expect(handleDynoStatusUpdate('SW-101', { statusCode: 1, statusResponse: {} })).toEqual({
        status: 2,
        message: 'Updated the status to 2 for order Id SW-101',
      });
    });

    it('422 when statusCode is missing', async () => {
      const { httpStatus, json } = await postJson('/orders/SW-101/status', { statusResponse: {} });
      expect(httpStatus).toBe(422);
      expect(json.status).toBe(422);
      expect(String(json.message)).toMatch(/statusCode/i);
    });

    it('422 when statusCode is unsupported (e.g. 99)', async () => {
      const { httpStatus } = await postJson('/orders/SW-101/status', {
        statusCode: 99,
        statusResponse: {},
      });
      expect(httpStatus).toBe(422);
      expect(validateDynoStatusBody({ statusCode: 99 }).ok).toBe(false);
    });

    it('422 when orderId path param is blank', () => {
      expect(() => handleDynoStatusUpdate('   ', { statusCode: 1 })).toThrow();
      expect(() => handleDynoStatusUpdate('', { statusCode: 1 })).toThrow();
    });
  });
});

// ══════════════════════════════════════════════════════════════════
describe('OUTBOUND REST APIs (POS -> Dyno)', () => {
  it('GET /api/v1/swiggy/orders — fetches active orders, HTTP 200', async () => {
    const { fn, calls } = mockFetchFactory(() =>
      jsonResponse(200, { orders: [{ order_id: 'SW-101', status: 'NEW' }] }),
    );
    const res = await getSwiggyActiveOrders(TEST_CFG(fn));
    expect(res.ok).toBe(true);
    expect(res.httpStatus).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0].init.method).toBe('GET');
    expect(calls[0].url).toBe('https://dynoapis.example/api/v1/swiggy/orders');
    expect(calls[0].init.headers.Accept).toBe('application/json');
    expect(calls[0].init.headers['x-api-key']).toBe('test-key-123');
    expect(res.data.orders[0].order_id).toBe('SW-101');
  });

  it('GET /api/v1/zomato/orders/current — fetches current orders, HTTP 200', async () => {
    const { fn, calls } = mockFetchFactory(() =>
      jsonResponse(200, { orders: [{ order_id: 'ZM-202', status: 'NEW' }] }),
    );
    const res = await getZomatoCurrentOrders(TEST_CFG(fn));
    expect(res.ok).toBe(true);
    expect(calls[0].url).toBe('https://dynoapis.example/api/v1/zomato/orders/current');
    expect(calls[0].init.method).toBe('GET');
  });

  it('POST /api/v1/swiggy/orders/accept — exact query params order_id + prep_time', async () => {
    const { fn, calls } = mockFetchFactory(() => jsonResponse(200, { success: true }));
    const res = await acceptSwiggyOrder(TEST_CFG(fn), { order_id: 'SW-101', prep_time: 25 });
    expect(res.ok).toBe(true);
    expect(res.httpStatus).toBe(200);
    const url = new URL(calls[0].url);
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://dynoapis.example/api/v1/swiggy/orders/accept',
    );
    expect(url.searchParams.get('order_id')).toBe('SW-101');
    expect(url.searchParams.get('prep_time')).toBe('25');
    expect(calls[0].init.method).toBe('POST');
    expect(calls[0].init.headers['Content-Type']).toBe('application/json');
  });

  it('POST accept — propagates HTTP 422 validation errors without throwing', async () => {
    const { fn } = mockFetchFactory(() =>
      jsonResponse(422, { message: 'Validation Failed: prep_time is required' }),
    );
    const res = await acceptSwiggyOrder(TEST_CFG(fn), { order_id: 'SW-101', prep_time: '' as any });
    // client-side guard fires first (no network) — still a 422 contract
    expect(res.ok).toBe(false);
    expect(res.httpStatus).toBe(422);
  });

  it('POST accept — server-side 422 is surfaced with error + data', async () => {
    const { fn, calls } = mockFetchFactory(() =>
      jsonResponse(422, { message: 'Invalid order_id' }),
    );
    const res = await acceptSwiggyOrder(TEST_CFG(fn), { order_id: 'BAD-ID', prep_time: 25 });
    expect(res.ok).toBe(false);
    expect(res.httpStatus).toBe(422);
    expect(res.error).toMatch(/Invalid order_id/);
    expect(calls).toHaveLength(1);
  });

  it('POST /api/v1/zomato/orders/mark_ready — exact query param order_id', async () => {
    const { fn, calls } = mockFetchFactory(() => jsonResponse(200, { success: true }));
    const res = await markZomatoOrderReady(TEST_CFG(fn), { order_id: 'ZM-202' });
    expect(res.ok).toBe(true);
    const url = new URL(calls[0].url);
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://dynoapis.example/api/v1/zomato/orders/mark_ready',
    );
    expect(url.searchParams.get('order_id')).toBe('ZM-202');
    expect(calls[0].init.method).toBe('POST');
  });

  it('POST mark_ready — 422 on missing order_id, fetch NOT called', async () => {
    const { fn, calls } = mockFetchFactory(() => jsonResponse(200, {}));
    const res = await markZomatoOrderReady(TEST_CFG(fn), { order_id: '  ' });
    expect(res.ok).toBe(false);
    expect(res.httpStatus).toBe(422);
    expect(calls).toHaveLength(0);
  });

  it('POST /api/v1/swiggy/items/instock — exact query param item_id + JSON headers', async () => {
    const { fn, calls } = mockFetchFactory(() => jsonResponse(200, { success: true }));
    const res = await toggleSwiggyItemInStock(TEST_CFG(fn), { item_id: 'ITEM-1' });
    expect(res.ok).toBe(true);
    const url = new URL(calls[0].url);
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://dynoapis.example/api/v1/swiggy/items/instock',
    );
    expect(url.searchParams.get('item_id')).toBe('ITEM-1');
    expect(calls[0].init.headers['Content-Type']).toBe('application/json');
    expect(calls[0].init.headers.Accept).toBe('application/json');
  });

  it('POST instock — 422 on missing item_id, fetch NOT called', async () => {
    const { fn, calls } = mockFetchFactory(() => jsonResponse(200, {}));
    const res = await toggleSwiggyItemInStock(TEST_CFG(fn), { item_id: '' });
    expect(res.ok).toBe(false);
    expect(res.httpStatus).toBe(422);
    expect(calls).toHaveLength(0);
  });

  it('rejects invalid order IDs client-side (blank / whitespace)', async () => {
    const { fn, calls } = mockFetchFactory(() => jsonResponse(200, {}));
    const res = await acceptSwiggyOrder(TEST_CFG(fn), { order_id: '   ', prep_time: 25 });
    expect(res.ok).toBe(false);
    expect(res.httpStatus).toBe(422);
    expect(calls).toHaveLength(0);
  });
});
