import { describe, it, expect } from 'vitest';
import { calculateGst } from '../utils/gst';

describe('GST Calculation Engine', () => {
  it('calculates standard 5% GST on a single item with no discount', () => {
    const result = calculateGst({
      items: [{ price: 100, quantity: 1 }],
      gstRate: 5,
      applyGst: true,
    });

    expect(result.subtotal).toBe(100);
    expect(result.discountAmount).toBe(0);
    expect(result.taxableAmount).toBe(100);
    expect(result.gstRate).toBe(5);
    expect(result.gstAmount).toBe(5);
    expect(result.cgstRate).toBe(2.5);
    expect(result.cgstAmount).toBe(2.5);
    expect(result.sgstRate).toBe(2.5);
    expect(result.sgstAmount).toBe(2.5);
    expect(result.grandTotal).toBe(105);
  });

  it('calculates standard 5% GST on multiple items with default settings', () => {
    const result = calculateGst({
      items: [
        { price: 150, quantity: 2 }, // 300
        { price: 50, quantity: 1 },  // 50
      ],
    });

    expect(result.subtotal).toBe(350);
    expect(result.discountAmount).toBe(0);
    expect(result.taxableAmount).toBe(350);
    expect(result.gstRate).toBe(5);
    expect(result.gstAmount).toBe(17.5);
    expect(result.cgstAmount).toBe(8.75);
    expect(result.sgstAmount).toBe(8.75);
    expect(result.grandTotal).toBe(367.5);
  });

  it('applies a flat discount below subtotal correctly', () => {
    const result = calculateGst({
      items: [{ price: 200, quantity: 1 }],
      discountType: 'flat',
      discountValue: 50,
      gstRate: 5,
    });

    expect(result.subtotal).toBe(200);
    expect(result.discountAmount).toBe(50);
    expect(result.taxableAmount).toBe(150);
    expect(result.gstAmount).toBe(7.5);
    expect(result.cgstAmount).toBe(3.75);
    expect(result.sgstAmount).toBe(3.75);
    expect(result.grandTotal).toBe(157.5);
  });

  it('caps flat discount at subtotal when discount exceeds subtotal', () => {
    const result = calculateGst({
      items: [{ price: 200, quantity: 1 }],
      discountType: 'flat',
      discountValue: 300,
      gstRate: 5,
    });

    expect(result.subtotal).toBe(200);
    expect(result.discountAmount).toBe(200);
    expect(result.taxableAmount).toBe(0);
    expect(result.gstAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  it('applies a percentage discount (10%) correctly', () => {
    const result = calculateGst({
      items: [{ price: 500, quantity: 1 }],
      discountType: 'percent',
      discountValue: 10,
      gstRate: 5,
    });

    expect(result.subtotal).toBe(500);
    expect(result.discountAmount).toBe(50);
    expect(result.taxableAmount).toBe(450);
    expect(result.gstAmount).toBe(22.5);
    expect(result.cgstAmount).toBe(11.25);
    expect(result.sgstAmount).toBe(11.25);
    expect(result.grandTotal).toBe(472.5);
  });

  it('handles 100% percentage discount', () => {
    const result = calculateGst({
      items: [{ price: 500, quantity: 1 }],
      discountType: 'percent',
      discountValue: 100,
      gstRate: 5,
    });

    expect(result.subtotal).toBe(500);
    expect(result.discountAmount).toBe(500);
    expect(result.taxableAmount).toBe(0);
    expect(result.gstAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  it('caps percentage discount at 100% when input exceeds 100%', () => {
    const result = calculateGst({
      items: [{ price: 500, quantity: 1 }],
      discountType: 'percent',
      discountValue: 150,
      gstRate: 5,
    });

    expect(result.subtotal).toBe(500);
    expect(result.discountAmount).toBe(500);
    expect(result.taxableAmount).toBe(0);
    expect(result.gstAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  it('verifies 50/50 CGST and SGST split', () => {
    const result = calculateGst({
      items: [{ price: 100, quantity: 1 }],
      gstRate: 5,
      applyGst: true,
    });

    expect(result.cgstRate).toBe(2.5);
    expect(result.sgstRate).toBe(2.5);
    expect(result.cgstAmount).toBe(result.sgstAmount);
    expect(result.cgstAmount + result.sgstAmount).toBe(result.gstAmount);
  });

  it('handles decimal precision and rounding to 2 decimal places', () => {
    const result = calculateGst({
      items: [{ price: 33.33, quantity: 3 }], // 99.99
      gstRate: 5,
    });

    expect(result.subtotal).toBe(99.99);
    expect(result.taxableAmount).toBe(99.99);
    // 99.99 * 0.05 = 4.9995 -> rounded to 5.00
    expect(result.gstAmount).toBe(5);
    // 99.99 + 5.00 = 104.99
    expect(result.grandTotal).toBe(104.99);
  });

  it('disables GST calculation when applyGst is false', () => {
    const result = calculateGst({
      items: [{ price: 200, quantity: 1 }],
      applyGst: false,
      gstRate: 5,
    });

    expect(result.subtotal).toBe(200);
    expect(result.gstRate).toBe(0);
    expect(result.gstAmount).toBe(0);
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
    expect(result.grandTotal).toBe(200);
  });

  it('handles empty items array gracefully', () => {
    const result = calculateGst({
      items: [],
      gstRate: 5,
    });

    expect(result.subtotal).toBe(0);
    expect(result.discountAmount).toBe(0);
    expect(result.taxableAmount).toBe(0);
    expect(result.gstAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  it('defensively handles negative prices and quantities', () => {
    const result = calculateGst({
      items: [
        { price: -50, quantity: -2 },
        { price: 100, quantity: -1 },
      ],
      gstRate: 5,
    });

    // -50 becomes 0, quantity becomes 1 -> 0
    // 100 with quantity -1 becomes quantity 1 -> 100
    expect(result.subtotal).toBe(100);
    expect(result.grandTotal).toBe(105);
  });
});
