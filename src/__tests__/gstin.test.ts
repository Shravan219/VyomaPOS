import { describe, it, expect } from 'vitest';
import { validateGSTIN, normalizeGSTIN, GSTIN_REGEX } from '../utils/gst';

describe('GSTIN Validation and Normalization', () => {
  it('validates 15-character format regex against valid demo GSTINs', () => {
    // Maharashtra demo GSTIN
    expect(validateGSTIN('27AABCS1429B1Z8')).toBe(true);
    // Karnataka demo GSTIN
    expect(validateGSTIN('29AAAAA0000A1Z5')).toBe(true);
    // Delhi demo GSTIN
    expect(validateGSTIN('07AAAAA0000A1Z5')).toBe(true);
    // Another valid Maharashtra GSTIN
    expect(validateGSTIN('27AAACG0561F1ZV')).toBe(true);
  });

  it('verifies the GSTIN_REGEX directly', () => {
    expect(GSTIN_REGEX.test('27AABCS1429B1Z8')).toBe(true);
    expect(GSTIN_REGEX.test('29AAAAA0000A1Z5')).toBe(true);
    expect(GSTIN_REGEX.test('INVALID_GSTIN')).toBe(false);
  });

  it('rejects GSTIN that is too short (14 chars)', () => {
    expect(validateGSTIN('27AABCS1429B1Z')).toBe(false);
  });

  it('rejects GSTIN that is too long (16 chars)', () => {
    expect(validateGSTIN('27AABCS1429B1Z89')).toBe(false);
  });

  it('rejects GSTIN when the 14th character is not Z', () => {
    expect(validateGSTIN('27AABCS1429B1A8')).toBe(false);
    expect(validateGSTIN('27AABCS1429B108')).toBe(false);
  });

  it('rejects GSTIN with invalid non-numeric state code', () => {
    expect(validateGSTIN('XXAABCS1429B1Z8')).toBe(false);
    expect(validateGSTIN('2AAABCS1429B1Z8')).toBe(false);
  });

  it('rejects GSTIN with invalid PAN structure', () => {
    // PAN first 5 characters must be alphabetic
    expect(validateGSTIN('27123451429B1Z8')).toBe(false);
  });

  it('rejects GSTIN containing special characters or hyphens', () => {
    expect(validateGSTIN('27-AABCS1429-B1Z')).toBe(false);
  });

  it('handles lowercase input correctly by auto-normalizing case in validateGSTIN', () => {
    expect(validateGSTIN('27aabcs1429b1z8')).toBe(true);
    expect(validateGSTIN('29aaaaa0000a1z5')).toBe(true);
  });

  it('rejects empty string, whitespace-only, null, and undefined values', () => {
    expect(validateGSTIN('')).toBe(false);
    expect(validateGSTIN('   ')).toBe(false);
    expect(validateGSTIN(null)).toBe(false);
    expect(validateGSTIN(undefined)).toBe(false);
  });

  it('normalizes dirty user input via normalizeGSTIN', () => {
    expect(normalizeGSTIN(' 27aabcs-1429b1z8 ')).toBe('27AABCS1429B1Z8');
    expect(normalizeGSTIN('27AABCS1429B1Z8_EXTRA')).toBe('27AABCS1429B1Z8');
    expect(normalizeGSTIN('')).toBe('');
    expect(normalizeGSTIN(null)).toBe('');
    expect(normalizeGSTIN(undefined)).toBe('');
  });
});
