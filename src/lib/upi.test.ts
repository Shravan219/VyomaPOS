import { describe, it, expect } from 'vitest';
import { buildUpiPayUrl, formatUpiAmount, TEMP_OUTLET_UPI_ID } from './upi';

describe('UPI helpers', () => {
  it('exposes the temporary outlet UPI ID', () => {
    expect(TEMP_OUTLET_UPI_ID).toBe('8788376667@postbank');
  });

  it('formats amounts to 2-decimal paise precision', () => {
    expect(formatUpiAmount(250)).toBe('250.00');
    expect(formatUpiAmount(99.9)).toBe('99.90');
    expect(formatUpiAmount(0)).toBe('0.00');
    expect(formatUpiAmount(-5)).toBe('0.00');
    expect(formatUpiAmount(NaN)).toBe('0.00');
  });

  it('builds a valid upi://pay link with exact amount', () => {
    const url = buildUpiPayUrl({
      pa: '8788376667@postbank',
      pn: 'Xtra Rooftop',
      amount: 462.5,
      note: 'Bill #1234',
    });
    expect(url.startsWith('upi://pay?')).toBe(true);
    expect(url).toContain('pa=8788376667%40postbank');
    expect(url).toContain('am=462.50');
    expect(url).toContain('cu=INR');
    expect(url).toContain('pn=Xtra%20Rooftop');
  });

  it('omits the note param when empty and encodes spaces as %20', () => {
    const url = buildUpiPayUrl({ pa: 'a@b', pn: 'AB CD', amount: 10 });
    expect(url).not.toContain('tn=');
    expect(url).toContain('pn=AB%20CD');
    expect(url).not.toContain('+');
  });
});
