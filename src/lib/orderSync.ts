// Standardized status mapping for outbound Dyno POS integration
// Full lifecycle: Accept -> Preparing -> Ready -> Out-for-delivery -> Delivered
export const DYNO_STATUS_MAP = {
  pending: 'ACCEPTED',
  preparing: 'PREPARING',
  ready: 'READY',
  dispatched: 'OUT_FOR_DELIVERY',
  completed: 'DELIVERED',
  cancelled: 'CANCELLED'
} as const;

/**
 * Dispatches an outbound status change notification to Dyno API via our backend API.
 */
export async function syncOrderStatusToDyno(params: {
  orderId: string;
  token?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled' | string;
  source?: string;
  /** Per-order aggregator callback URL — forwarded so the server relay posts here instead of the global Dyno URL. */
  callbackUrl?: string;
}) {
  // Send the RAW internal status (e.g. 'dispatched'). The server relay maps
  // to Dyno vocabulary only for the outbound payload, and persists the raw
  // value to memory + Supabase — previously the mapped value
  // ('OUT_FOR_DELIVERY', …) was written to the DB, violating the
  // orders_status_check constraint and corrupting status semantics.
  const rawStatus = String(params.status || '').toLowerCase().trim();

  try {
    const response = await fetch('/api/orders/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: params.orderId || params.token,
        token: params.token || params.orderId,
        status: rawStatus,
        source: params.source || 'DYNO',
        ...(params.callbackUrl ? { custom_target_url: params.callbackUrl } : {})
      })
    });

    if (!response.ok) {
      console.warn(`[Dyno Sync] HTTP ${response.status} when updating order ${params.orderId}`);
    } else {
      const data = await response.json();
      console.log(`[Dyno Sync] Outbound status sync successful:`, data);
    }
  } catch (error) {
    console.warn(`[Dyno Sync Error] Could not reach status sync endpoint:`, error);
  }
}

export const syncOrderStatusToPetpooja = syncOrderStatusToDyno;
