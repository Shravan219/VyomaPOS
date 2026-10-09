import { describe, it, expect } from 'vitest';
import { mapStatusToDyno } from '../lib/dispatch-status';
import { DYNO_STATUS_MAP } from '../lib/orderSync';
import { isAggregatorOrder, isActiveOrder } from '../types';
import type { Order } from '../types';

const baseOrder = (overrides: Partial<Order>): Order => ({
  id: 'ord-1',
  created_at: new Date().toISOString(),
  token: '1001',
  status: 'ready',
  total: 500,
  items: [],
  ...overrides,
});

describe('Order Status Mapping', () => {
  describe('mapStatusToDyno', () => {
    it('maps primary order statuses to Dyno mapped statuses', () => {
      expect(mapStatusToDyno('pending')).toBe('ACCEPTED');
      expect(mapStatusToDyno('preparing')).toBe('PREPARING');
      expect(mapStatusToDyno('ready')).toBe('READY');
      expect(mapStatusToDyno('completed')).toBe('DELIVERED');
      expect(mapStatusToDyno('cancelled')).toBe('CANCELLED');
    });

    it('maps status aliases correctly', () => {
      expect(mapStatusToDyno('accepted')).toBe('ACCEPTED');
      expect(mapStatusToDyno('waiting for payment')).toBe('READY');
      expect(mapStatusToDyno('waiting_for_payment')).toBe('READY');
      expect(mapStatusToDyno('in_kitchen')).toBe('PREPARING');
      expect(mapStatusToDyno('dispatched')).toBe('OUT_FOR_DELIVERY');
      expect(mapStatusToDyno('out_for_delivery')).toBe('OUT_FOR_DELIVERY');
      expect(mapStatusToDyno('delivered')).toBe('DELIVERED');
    });

    it('handles case-insensitive status inputs', () => {
      expect(mapStatusToDyno('PENDING')).toBe('ACCEPTED');
      expect(mapStatusToDyno('Preparing')).toBe('PREPARING');
      expect(mapStatusToDyno('READY')).toBe('READY');
      expect(mapStatusToDyno('COMPLETED')).toBe('DELIVERED');
      expect(mapStatusToDyno('Cancelled')).toBe('CANCELLED');
      expect(mapStatusToDyno('IN_KITCHEN')).toBe('PREPARING');
      expect(mapStatusToDyno('WAITING FOR PAYMENT')).toBe('READY');
    });

    it('handles leading and trailing whitespace', () => {
      expect(mapStatusToDyno('  ready  ')).toBe('READY');
      expect(mapStatusToDyno('\tpending\n')).toBe('ACCEPTED');
      expect(mapStatusToDyno('  preparing   ')).toBe('PREPARING');
    });

    it('falls back to ACCEPTED for unknown status strings', () => {
      expect(mapStatusToDyno('unknown_custom_status')).toBe('ACCEPTED');
      expect(mapStatusToDyno('failed_state')).toBe('ACCEPTED');
    });

    it('falls back safely to ACCEPTED for empty or falsy inputs', () => {
      expect(mapStatusToDyno('')).toBe('ACCEPTED');
      expect(mapStatusToDyno(null as any)).toBe('ACCEPTED');
      expect(mapStatusToDyno(undefined as any)).toBe('ACCEPTED');
    });
  });

  describe('DYNO_STATUS_MAP Dictionary', () => {
    it('contains exact constant mappings for the 5 core states', () => {
      expect(DYNO_STATUS_MAP.pending).toBe('ACCEPTED');
      expect(DYNO_STATUS_MAP.preparing).toBe('PREPARING');
      expect(DYNO_STATUS_MAP.ready).toBe('READY');
      expect(DYNO_STATUS_MAP.completed).toBe('DELIVERED');
      expect(DYNO_STATUS_MAP.cancelled).toBe('CANCELLED');
    });

    it('keeps Handover to Rider distinct from Delivered', () => {
      expect((DYNO_STATUS_MAP as Record<string, string>).dispatched).toBe('OUT_FOR_DELIVERY');
      expect(mapStatusToDyno('dispatched')).toBe('OUT_FOR_DELIVERY');
      expect(mapStatusToDyno('completed')).toBe('DELIVERED');
    });
  });

  describe('isAggregatorOrder lifecycle cap', () => {
    it('caps Swiggy / Zomato / Dyno platform orders', () => {
      expect(isAggregatorOrder(baseOrder({ aggregator_platform: 'swiggy' }))).toBe(true);
      expect(isAggregatorOrder(baseOrder({ aggregator_platform: 'zomato' }))).toBe(true);
      expect(isAggregatorOrder(baseOrder({ aggregator_platform: 'DYNO' }))).toBe(true);
    });

    it('caps aggregator / delivery order types even without a platform tag', () => {
      expect(isAggregatorOrder(baseOrder({ order_type: 'aggregator' }))).toBe(true);
      expect(isAggregatorOrder(baseOrder({ order_type: 'delivery' }))).toBe(true);
    });

    it('exempts dine-in, takeaway and direct orders (Mark Delivered stays)', () => {
      expect(isAggregatorOrder(baseOrder({ order_type: 'dine_in' }))).toBe(false);
      expect(isAggregatorOrder(baseOrder({ order_type: 'takeaway' }))).toBe(false);
      expect(isAggregatorOrder(baseOrder({}))).toBe(false);
    });
  });

  describe('isActiveOrder card membership', () => {
    it('removes handed-over aggregator cards from active views', () => {
      expect(
        isActiveOrder(baseOrder({ status: 'dispatched', aggregator_platform: 'swiggy' })),
      ).toBe(false);
      expect(
        isActiveOrder(baseOrder({ status: 'dispatched', order_type: 'aggregator' })),
      ).toBe(false);
    });

    it('keeps in-house dispatched cards visible for Mark Delivered', () => {
      expect(isActiveOrder(baseOrder({ status: 'dispatched', order_type: 'dine_in' }))).toBe(true);
      expect(isActiveOrder(baseOrder({ status: 'ready', aggregator_platform: 'zomato' }))).toBe(true);
    });

    it('removes completed / cancelled regardless of platform', () => {
      expect(isActiveOrder(baseOrder({ status: 'completed', order_type: 'dine_in' }))).toBe(false);
      expect(isActiveOrder(baseOrder({ status: 'cancelled', aggregator_platform: 'swiggy' }))).toBe(false);
    });
  });
});
