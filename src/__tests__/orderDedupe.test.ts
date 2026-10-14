import { describe, it, expect } from 'vitest';
import { dedupeOrders, type Order } from '../types';

function makeOrder(overrides: Partial<Order> & { id: string }): Order {
  return {
    created_at: '2026-10-14T12:00:00+05:30',
    token: '#0001',
    status: 'pending',
    total: 100,
    items: [],
    ...overrides,
  } as Order;
}

describe('dedupeOrders — phantom duplicate cards', () => {
  it('folds a memory + Supabase twin (same token, different ids) into one card', () => {
    const memory = makeOrder({ id: 'SW-101', token: '#0148', status: 'ready', order_type: 'aggregator', aggregator_platform: 'swiggy' });
    const dbRow = makeOrder({ id: 'c0c52a9c-5737-45d9-8227-6f55cc87d44c', token: '#0148', status: 'ready' });
    const out = dedupeOrders([dbRow, memory]);
    expect(out).toHaveLength(1);
    // Prefers the aggregator-marked record (stable SW-101 id for relay/display).
    expect(out[0].id).toBe('SW-101');
  });

  it('keeps genuinely different orders apart', () => {
    const a = makeOrder({ id: 'a', token: '#0001' });
    const b = makeOrder({ id: 'b', token: '#0002' });
    expect(dedupeOrders([a, b])).toHaveLength(2);
  });

  it('never collapses placeholder #0000 tokens', () => {
    const a = makeOrder({ id: 'a', token: '#0000' });
    const b = makeOrder({ id: 'b', token: '#0000' });
    expect(dedupeOrders([a, b])).toHaveLength(2);
  });

  it('keeps same-token orders from different days separate (token reuse)', () => {
    const a = makeOrder({ id: 'a', token: '#1234', created_at: '2026-10-13T12:00:00+05:30' });
    const b = makeOrder({ id: 'b', token: '#1234', created_at: '2026-10-14T12:00:00+05:30' });
    expect(dedupeOrders([a, b])).toHaveLength(2);
  });

  it('prefers the more advanced lifecycle status between twins', () => {
    const stale = makeOrder({ id: 'SW-101', token: '#0148', status: 'ready' });
    const advanced = makeOrder({ id: 'uuid-1', token: '#0148', status: 'dispatched' });
    const out = dedupeOrders([stale, advanced]);
    expect(out).toHaveLength(1);
    expect(out[0].status).toBe('dispatched');
  });

  it('returns an empty list untouched', () => {
    expect(dedupeOrders([])).toEqual([]);
  });
});
