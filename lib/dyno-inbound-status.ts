/**
 * Dyno INBOUND status-update contract (Dyno -> POS).
 *
 * Spec under test:
 *   POST /orders/{orderId}/status
 *   Request:  { "statusCode": 1, "statusResponse": {} }
 *   Response: { "status": 2, "message": "Updated the status to 2 for order Id SW-101" }
 *
 * Mapping required by spec:
 *   statusCode 1 -> status 2 (Accepted)
 *   statusCode 3 -> status 4 (Ready)
 *
 * Generalised rule: mapped = statusCode + 1 for the known Dyno lane
 * (1->2 Accepted, 2->3 Preparing, 3->4 Ready, 4->5 Dispatched/Delivered).
 * Unknown / missing codes fall back to 422 validation error, never silent coerce.
 */

export const DYNO_STATUS_CODE_MAP: Record<number, number> = {
  1: 2, // NEW -> Accepted
  2: 3, // Accepted -> Preparing / In-kitchen
  3: 4, // Preparing -> Ready
  4: 5, // Ready -> Dispatched / Delivered
};

export interface DynoStatusUpdateRequest {
  statusCode?: unknown;
  statusResponse?: unknown;
}

export interface DynoStatusUpdateResponse {
  status: number;
  message: string;
}

export interface DynoStatusValidationError {
  status: number;
  message: string;
}

/**
 * Strict validator for the inbound status body.
 * Returns { ok: true, statusCode } or { ok: false, error } (HTTP 422 shape).
 */
export function validateDynoStatusBody(body: any):
  | { ok: true; statusCode: number; statusResponse: any }
  | { ok: false; error: DynoStatusValidationError } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      ok: false,
      error: { status: 422, message: 'Validation Failed: request body must be an object with statusCode' },
    };
  }
  if (body.statusCode === undefined || body.statusCode === null || (body.statusCode as string) === '') {
    return {
      ok: false,
      error: { status: 422, message: 'Validation Failed: statusCode is required' },
    };
  }
  const code = Number(body.statusCode);
  if (!Number.isInteger(code) || !(code in DYNO_STATUS_CODE_MAP)) {
    return {
      ok: false,
      error: { status: 422, message: `Validation Failed: unsupported statusCode ${String(body.statusCode)}` },
    };
  }
  return { ok: true, statusCode: code, statusResponse: (body as any).statusResponse ?? {} };
}

export function mapDynoStatusCodeToPosStatus(statusCode: number): number {
  const mapped = DYNO_STATUS_CODE_MAP[statusCode];
  if (mapped === undefined) {
    throw new Error(`Unsupported statusCode ${statusCode}`);
  }
  return mapped;
}

/**
 * Pure handler: given an orderId + raw body, produce the exact Dyno response shape.
 * Throws on invalid orderId so the Express wrapper can return 422.
 */
export function handleDynoStatusUpdate(orderId: unknown, body: any): DynoStatusUpdateResponse {
  const id = String(orderId ?? '').trim();
  if (!id) {
    throw Object.assign(new Error('Validation Failed: orderId path param is required'), { httpStatus: 422 });
  }
  const validated = validateDynoStatusBody(body);
  if (validated.ok === false) {
    throw Object.assign(new Error(validated.error.message), { httpStatus: 422 });
  }
  const mapped = mapDynoStatusCodeToPosStatus(validated.statusCode);
  return {
    status: mapped,
    message: `Updated the status to ${mapped} for order Id ${id}`,
  };
}
