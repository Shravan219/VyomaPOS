export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'dispatched' | 'waiting for payment' | 'completed' | 'cancelled';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export type ReservationStatus = 'booked' | 'seated' | 'cancelled' | 'completed';

/** Floor sections for the reservation floor plan (indoor vs rooftop/lounge). */
export type TableSection = 'Indoor' | 'Rooftop' | 'Lounge';

export interface Reservation {
  id: string;
  guest_name: string;
  phone: string;
  party_size: number;
  reservation_time: string; // ISO timestamp
  table_number: string; // e.g. "T-04" or "Table 4"
  status: ReservationStatus;
  notes?: string | null;
  created_at: string;
}

export interface CreateReservationInput {
  guest_name: string;
  phone: string;
  party_size: number;
  reservation_time: string;
  table_number: string;
  notes?: string;
}

export interface RestaurantTable {
  id: string | number;
  table_number: string;
  capacity: number;
  status: TableStatus;
  section?: string;
  active_order_id?: string | null;
  customer_name?: string | null;
  total_amount?: number;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  item_notes?: string;
}

export interface Order {
  id: string;
  created_at: string;
  placed_at_ist?: string;
  token: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  customer_name?: string;
  customer_phone?: string;
  table_id?: string | number;
  gstin?: string;
  order_type?: 'dine_in' | 'takeaway' | 'delivery' | 'aggregator';
  aggregator_platform?: 'swiggy' | 'zomato' | 'ubereats' | 'magicpin' | string;
  source?: string;
  callback_url?: string;
  notes?: string;
  custom_instructions?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount_price?: number | null;
  category: string;
  image?: string;
  is_sold_out: boolean;
}

export function normalizeOrderItems(rawItems: any): OrderItem[] {
  let arr: any[] = [];
  if (Array.isArray(rawItems)) {
    arr = rawItems;
  } else if (typeof rawItems === 'string') {
    try {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) {
        arr = parsed;
      } else if (parsed && typeof parsed === 'object') {
        arr = [parsed];
      } else if (rawItems.trim()) {
        arr = [{ name: rawItems.trim(), quantity: 1, price: 0 }];
      }
    } catch {
      if (rawItems.trim()) {
        arr = [{ name: rawItems.trim(), quantity: 1, price: 0 }];
      }
    }
  } else if (rawItems && typeof rawItems === 'object') {
    arr = [rawItems];
  }

  if (arr.length === 0) {
    return [{ id: '1', name: 'Order Item', quantity: 1, price: 0 }];
  }

  return arr.map((item: any, idx: number) => {
    if (typeof item === 'string') {
      return { id: `item_${idx + 1}`, name: item, quantity: 1, price: 0 };
    }
    const name = String(
      item?.Item_Name ||
      item?.ItemName ||
      item?.item_name ||
      item?.itemName ||
      item?.name ||
      item?.Name ||
      item?.title ||
      item?.Title ||
      item?.description ||
      item?.dish_name ||
      `Item ${idx + 1}`
    ).trim();

    const price = Number(
      item?.price ??
      item?.Price ??
      item?.Rate ??
      item?.rate ??
      item?.item_price ??
      item?.Item_Price ??
      item?.unit_price ??
      item?.amount ??
      0
    ) || 0;

    const quantity = Number(
      item?.quantity ??
      item?.Quantity ??
      item?.qty ??
      item?.Qty ??
      item?.count ??
      item?.Count ??
      1
    ) || 1;

    return {
      id: String(item?.id || item?.item_id || item?.Item_ID || `item_${idx + 1}`),
      name: name || `Item ${idx + 1}`,
      quantity: isNaN(quantity) || quantity <= 0 ? 1 : quantity,
      price: isNaN(price) ? 0 : price,
      item_notes: item?.notes || item?.item_notes || item?.special_instructions || undefined
    };
  });
}

export function normalizeOrder(rawOrder: any): Order {
  if (!rawOrder) {
    return {
      id: `ord_${Date.now()}`,
      created_at: new Date().toISOString(),
      token: '#0000',
      status: 'pending',
      total: 0,
      items: [{ id: '1', name: 'Order Item', quantity: 1, price: 0 }]
    };
  }
  return {
    ...rawOrder,
    items: normalizeOrderItems(
      rawOrder?.items || 
      rawOrder?.order_items || 
      rawOrder?.orderItems || 
      rawOrder?.Item || 
      rawOrder?.item || 
      rawOrder?.OrderItems || 
      rawOrder?.order_details ||
      rawOrder?.OrderDetails ||
      rawOrder?.cart ||
      rawOrder?.dishes
    )
  };
}

/**
 * Aggregator lifecycle cap: orders fulfilled by a 3rd-party rider (Swiggy,
 * Zomato, Dyno, …) end their manual POS journey at Handover ("OUT_FOR_DELIVERY").
 * Completion arrives via the delivery webhook — the POS must not offer a manual
 * "Mark Delivered" step for these orders.
 */
export function isAggregatorOrder(order: Order): boolean {
  const platform = (order.aggregator_platform || '').trim().toLowerCase();
  if (platform) return true;
  const orderType = (order.order_type || '').trim().toLowerCase();
  if (orderType === 'aggregator' || orderType === 'delivery') return true;
  return false;
}

/**
 * Collapse duplicate cards for the same logical order.
 *
 * The same order can reach the client under two different keys: the server
 * memory copy is keyed by aggregator id (e.g. "SW-101") while its Supabase
 * row carries a random UUID — but both share the token. Id-keyed merges
 * (`map.set(o.id || o.token)`) then render the pair as two "dummy" cards.
 * This folds same-token records into one, so Payments/Online never show
 * ghosts.
 *
 * Safety: placeholder tokens (`#0000`) never collapse, and same-token pairs
 * from different calendar days (token reuse) are kept separate.
 */
const PLACEHOLDER_TOKENS = new Set(['', '#', '#0000', 'nan', 'undefined']);

function orderLifecycleRank(status: string | undefined): number {
  switch ((status || '').toLowerCase().trim()) {
    case 'pending': return 0;
    case 'preparing': return 1;
    case 'ready': return 2;
    case 'dispatched':
    case 'out_for_delivery':
    case 'out for delivery': return 3;
    case 'waiting for payment':
    case 'waiting_for_payment': return 4;
    case 'completed':
    case 'cancelled': return 5;
    default: return 0;
  }
}

function sameCalendarDay(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return true; // missing timestamp → allow collapse
  const da = new Date(a);
  const db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return true;
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

function preferOrderRecord(a: Order, b: Order): Order {
  const rankDiff = orderLifecycleRank(b.status) - orderLifecycleRank(a.status);
  if (rankDiff !== 0) return rankDiff > 0 ? b : a;
  const score = (o: Order) =>
    (o.aggregator_platform ? 4 : 0) +
    (o.order_type === 'aggregator' || o.order_type === 'delivery' ? 2 : 0) +
    (o.callback_url ? 1 : 0);
  const scoreDiff = score(b) - score(a);
  if (scoreDiff !== 0) return scoreDiff > 0 ? b : a;
  const ta = new Date(a.created_at || 0).getTime();
  const tb = new Date(b.created_at || 0).getTime();
  return tb >= ta ? b : a;
}

export function dedupeOrders(list: Order[]): Order[] {
  const byId = new Map<string, Order>();
  for (const o of list) {
    if (!o) continue;
    const k = o.id || o.token;
    if (!k) continue;
    const prev = byId.get(k);
    byId.set(k, prev ? preferOrderRecord(prev, o) : o);
  }
  const byToken = new Map<string, Order>();
  const untokened: Order[] = [];
  for (const o of byId.values()) {
    const t = (o.token || '').trim().toLowerCase();
    if (!t || PLACEHOLDER_TOKENS.has(t)) {
      untokened.push(o);
      continue;
    }
    const prev = byToken.get(t);
    if (!prev) {
      byToken.set(t, o);
    } else if (sameCalendarDay(prev.created_at, o.created_at)) {
      byToken.set(t, preferOrderRecord(prev, o));
    } else {
      untokened.push(o);
    }
  }
  return [...byToken.values(), ...untokened];
}

/**
 * Active-list membership: completed/cancelled are out, and dispatched
 * aggregator orders leave the active views on Handover (the rider has the
 * order; completion arrives via webhook). In-house dispatched orders stay
 * visible so staff can still tap "Mark Delivered".
 */
export function isActiveOrder(order: Order): boolean {
  const st = (order.status || '').toLowerCase().trim();
  if (st === 'completed' || st === 'cancelled') return false;
  if (st === 'dispatched' && isAggregatorOrder(order)) return false;
  return true;
}

export function getOrderPlatform(order: Order): 'swiggy' | 'zomato' | 'other_online' | 'dine_in' {
  if (order.aggregator_platform === 'swiggy') return 'swiggy';
  if (order.aggregator_platform === 'zomato') return 'zomato';

  const tokenUpper = (order.token || '').toUpperCase();
  if (tokenUpper.startsWith('SWI') || tokenUpper.startsWith('SW') || tokenUpper.includes('SWI') || tokenUpper.includes('SWIGGY')) return 'swiggy';
  if (tokenUpper.startsWith('ZOM') || tokenUpper.startsWith('ZM') || tokenUpper.includes('ZOM') || tokenUpper.includes('ZOMATO')) return 'zomato';

  const tableStr = (order.table_id || '').toString().toLowerCase();
  if (tableStr.includes('swiggy') || tableStr.includes('sw_')) return 'swiggy';
  if (tableStr.includes('zomato') || tableStr.includes('zom_')) return 'zomato';

  const name = (order.customer_name || '').toLowerCase();
  const notes = (order.notes || '').toLowerCase();
  const instructions = (order.custom_instructions || '').toLowerCase();
  const fullText = `${name} ${notes} ${instructions} ${tableStr}`;

  if (fullText.includes('swiggy')) return 'swiggy';
  if (fullText.includes('zomato')) return 'zomato';

  if (order.order_type === 'aggregator' || order.order_type === 'delivery') {
    return 'other_online';
  }

  if (fullText.includes('online') || fullText.includes('ubereats') || fullText.includes('magicpin')) {
    return 'other_online';
  }

  return 'dine_in';
}
