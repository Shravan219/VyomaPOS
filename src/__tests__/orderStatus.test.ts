import { describe, it, expect } from 'vitest';
import { mapStatusToDyno } from '../lib/dispatch-status';
import { DYNO_STATUS_MAP } from '../lib/orderSync';

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
      expect(mapStatusToDyno('dispatched')).toBe('DISPATCHED');
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
  });
});
