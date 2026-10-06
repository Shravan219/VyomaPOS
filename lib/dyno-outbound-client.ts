/**
 * Dyno OUTBOUND client (POS -> Dyno).
 *
 * Endpoints under test (Dyno cloud):
 *   GET  /api/v1/swiggy/orders
 *   GET  /api/v1/zomato/orders/current
 *   POST /api/v1/swiggy/orders/accept?order_id=SW-101&prep_time=25
 *   POST /api/v1/zomato/orders/mark_ready?order_id=ZM-202
 *   POST /api/v1/swiggy/items/instock?item_id=ITEM-1   (headers: application/json)
 *
 * Design:
 * - All query params built with URLSearchParams (exact names: order_id, prep_time, item_id).
 * - All requests send Accept: application/json; POSTs also send Content-Type: application/json.
 * - x-api-key attached when configured.
 * - fetch implementation injectable for unit tests (defaults to global fetch).
 * - 2xx => { ok: true, httpStatus, data }; 422 => { ok: false, httpStatus: 422, error, data };
 *   other non-2xx => { ok: false, ... } — never throws on HTTP error, only on network failure.
 */

export interface DynoClientConfig {
  baseUrl: string; // e.g. https://dynoapis.com  (no trailing slash)
  apiKey?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface DynoResult {
  ok: boolean;
  httpStatus: number;
  data: any;
  error?: string;
  /** Echo of the exact outgoing request for schema verification */
  request: { method: string; url: string; headers: Record<string, string>; body?: string };
}

function resolveFetch(config: DynoClientConfig): typeof fetch {
  if (config.fetchImpl) return config.fetchImpl;
  if (typeof fetch !== 'undefined') return fetch.bind(globalThis);
  throw new Error('No fetch implementation available');
}

function baseHeaders(config: DynoClientConfig, isPost: boolean): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json' };
  if (isPost) h['Content-Type'] = 'application/json';
  if (config.apiKey) h['x-api-key'] = config.apiKey;
  return h;
}

function cleanBase(baseUrl: string): string {
  if (!baseUrl) throw new Error('Dyno baseUrl is required');
  return baseUrl.replace(/\/+$/, '');
}

async function parseJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function doRequest(
  config: DynoClientConfig,
  method: 'GET' | 'POST',
  path: string,
  query: Record<string, string | number | undefined | null>,
  body?: any,
): Promise<DynoResult> {
  const fetchFn = resolveFetch(config);
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    qs.append(k, String(v));
  }
  const qstr = qs.toString();
  const url = `${cleanBase(config.baseUrl)}${path}${qstr ? `?${qstr}` : ''}`;
  const headers = baseHeaders(config, method === 'POST');
  const bodyStr = method === 'POST' ? JSON.stringify(body ?? {}) : undefined;

  const request = { method, url, headers, ...(bodyStr !== undefined ? { body: bodyStr } : {}) };

  const controller = new AbortController();
  const timeoutMs = config.timeoutMs ?? 8000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchFn(url, { method, headers, ...(bodyStr !== undefined ? { body: bodyStr } : {}), signal: controller.signal });
    const data = await parseJsonSafe(res as unknown as Response);
    if ((res as Response).ok) {
      return { ok: true, httpStatus: (res as Response).status, data, request };
    }
    return {
      ok: false,
      httpStatus: (res as Response).status,
      data,
      error: (data as any)?.message || (data as any)?.error || `HTTP ${(res as Response).status}`,
      request,
    };
  } catch (err: any) {
    return {
      ok: false,
      httpStatus: err?.name === 'AbortError' ? 408 : 503,
      data: null,
      error: err?.message || 'Network failure',
      request,
    };
  } finally {
    clearTimeout(timer);
  }
}

// ── Active-order fetches ──────────────────────────────────────────

export function getSwiggyActiveOrders(config: DynoClientConfig): Promise<DynoResult> {
  return doRequest(config, 'GET', '/api/v1/swiggy/orders', {});
}

export function getZomatoCurrentOrders(config: DynoClientConfig): Promise<DynoResult> {
  return doRequest(config, 'GET', '/api/v1/zomato/orders/current', {});
}

// ── Mutations (query-param contracts are Dyno-strict) ────────────

export function acceptSwiggyOrder(
  config: DynoClientConfig,
  params: { order_id: string; prep_time: string | number },
): Promise<DynoResult> {
  if (!params?.order_id?.trim()) {
    return Promise.resolve({
      ok: false,
      httpStatus: 422,
      data: null,
      error: 'Validation Failed: order_id is required',
      request: {
        method: 'POST',
        url: `${cleanBase(config.baseUrl)}/api/v1/swiggy/orders/accept`,
        headers: baseHeaders(config, true),
      },
    });
  }
  if (params.prep_time === undefined || params.prep_time === null || String(params.prep_time).trim() === '') {
    return Promise.resolve({
      ok: false,
      httpStatus: 422,
      data: null,
      error: 'Validation Failed: prep_time is required',
      request: {
        method: 'POST',
        url: `${cleanBase(config.baseUrl)}/api/v1/swiggy/orders/accept`,
        headers: baseHeaders(config, true),
      },
    });
  }
  return doRequest(config, 'POST', '/api/v1/swiggy/orders/accept', {
    order_id: params.order_id,
    prep_time: params.prep_time,
  });
}

export function markZomatoOrderReady(
  config: DynoClientConfig,
  params: { order_id: string },
): Promise<DynoResult> {
  if (!params?.order_id?.trim()) {
    return Promise.resolve({
      ok: false,
      httpStatus: 422,
      data: null,
      error: 'Validation Failed: order_id is required',
      request: {
        method: 'POST',
        url: `${cleanBase(config.baseUrl)}/api/v1/zomato/orders/mark_ready`,
        headers: baseHeaders(config, true),
      },
    });
  }
  return doRequest(config, 'POST', '/api/v1/zomato/orders/mark_ready', { order_id: params.order_id });
}

export function toggleSwiggyItemInStock(
  config: DynoClientConfig,
  params: { item_id: string },
): Promise<DynoResult> {
  if (!params?.item_id?.trim()) {
    return Promise.resolve({
      ok: false,
      httpStatus: 422,
      data: null,
      error: 'Validation Failed: item_id is required',
      request: {
        method: 'POST',
        url: `${cleanBase(config.baseUrl)}/api/v1/swiggy/items/instock`,
        headers: baseHeaders(config, true),
      },
    });
  }
  return doRequest(config, 'POST', '/api/v1/swiggy/items/instock', { item_id: params.item_id });
}
