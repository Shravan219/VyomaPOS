/**
 * Server-side PDF receipt generator.
 * Uses jsPDF (which works in Node.js) to produce a receipt PDF buffer
 * that can be sent directly as a WhatsApp document by the Baileys bot.
 */

import { jsPDF } from 'jspdf';
// NOTE: never statically import 'qrcode' here — build.js marks it external
// and the packaged EXE prunes node_modules, which crashes the main process
// at boot. The client generates the QR (it bundles qrcode for web) and sends
// it as `upi_qr`; the server only embeds the image. See src/lib/upi.ts.

export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

export interface ReceiptData {
  id: string;
  token?: string | number;
  customer_name?: string;
  customer_phone?: string;
  items: ReceiptItem[];
  subtotal?: number;
  tax_amount?: number;
  tax_rate?: number;
  discount?: number;
  total: number;
  payment_mode?: string;
  table_id?: string | number;
  created_at?: string;
  gstin?: string;
  /** Outlet UPI ID override — defaults to env UPI_ID, then the temporary ID. */
  upi_id?: string;
  /**
   * Pre-rendered UPI payment QR (PNG data URL) for the exact grand total,
   * generated client-side. Embedded when present; absent → block skipped.
   */
  upi_qr?: string;
}

/** Temporary outlet UPI ID (mirrors src/lib/upi.ts — replace with live VPA). */
const TEMP_OUTLET_UPI_ID = '8788376667@postbank';

function getServerUpiId(explicit?: string): string {
  const envId = (process.env.UPI_ID || '').trim();
  if (explicit && explicit.trim()) return explicit.trim();
  if (envId) return envId;
  return TEMP_OUTLET_UPI_ID;
}

/**
 * Generates a professional thermal-style PDF receipt on the server.
 * Returns the PDF as a Buffer ready to be sent via Baileys sendMessage.
 * Synchronous — the UPI QR is supplied pre-rendered by the client
 * (see `upi_qr`), so this function needs no async QR dependency.
 */
export function generateReceiptPdfBuffer(
  data: ReceiptData,
  restaurantName = 'XTRA ROOFTOP LOUNGE & CAFE'
): Buffer {
  const baseHeight = 110;
  const itemHeight = Math.max(data.items.length * 6.5, 20);
  // +52mm reserved for the UPI payment QR block (rendered when total > 0).
  const upiBlockHeight = Number(data.total) > 0 ? 52 : 0;
  const totalHeight = Math.max(160, baseHeight + itemHeight + upiBlockHeight);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, totalHeight]
  });

  const pageWidth = 80;
  let y = 10;

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text(restaurantName, pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('OFFICIAL TAX INVOICE', pageWidth / 2, y, { align: 'center' });

  if (data.gstin) {
    y += 3.5;
    doc.text(`GSTIN: ${data.gstin}`, pageWidth / 2, y, { align: 'center' });
  }

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(6, y, pageWidth - 6, y);

  // ── Order Details ────────────────────────────────────────────────────────
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  const tokenStr = data.token ? `#${data.token}` : `#${data.id.slice(-4)}`;
  const tableStr = data.table_id
    ? `Table ${String(data.table_id).replace(/^table\s*/i, '')}`
    : 'Counter';
  const dateStr = data.created_at
    ? new Date(data.created_at).toLocaleString('en-IN', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    : new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

  doc.text(`Token: ${tokenStr} (${tableStr})`, 6, y);
  y += 4;
  doc.text(`Date: ${dateStr}`, 6, y);
  y += 4;
  const cust =
    data.customer_name && data.customer_name.toLowerCase() !== 'guest'
      ? data.customer_name
      : 'Guest Customer';
  doc.text(`Customer: ${cust}`, 6, y);
  if (data.customer_phone) {
    y += 4;
    doc.text(`Phone: ${data.customer_phone}`, 6, y);
  }

  y += 4;
  doc.line(6, y, pageWidth - 6, y);

  // ── Items Header ─────────────────────────────────────────────────────────
  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 30, 30);
  doc.text('ITEM', 6, y);
  doc.text('QTY', 44, y, { align: 'center' });
  doc.text('PRICE', 58, y, { align: 'right' });
  doc.text('TOTAL', pageWidth - 6, y, { align: 'right' });

  y += 2.5;
  doc.line(6, y, pageWidth - 6, y);

  // ── Items List ────────────────────────────────────────────────────────────
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  data.items.forEach((it) => {
    const cleanName = it.name.length > 20 ? it.name.substring(0, 19) + '…' : it.name;
    const lineTotal = (it.price * it.quantity).toFixed(2);

    doc.text(cleanName, 6, y);
    doc.text(String(it.quantity), 44, y, { align: 'center' });
    doc.text(it.price.toFixed(2), 58, y, { align: 'right' });
    doc.text(lineTotal, pageWidth - 6, y, { align: 'right' });
    y += 4.5;
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  y += 1;
  doc.line(6, y, pageWidth - 6, y);
  y += 4.5;

  const subtotalVal =
    data.subtotal ?? data.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const discountVal = data.discount ?? 0;
  const taxableVal = Math.max(0, subtotalVal - discountVal);
  let taxVal = data.tax_amount ?? 0;
  if (!(taxVal > 0)) {
    taxVal = Math.max(0, data.total - taxableVal);
    taxVal = Math.round(taxVal * 100) / 100;
  }
  const taxRateVal = (() => {
    const stored = Number(data.tax_rate);
    if (stored > 0) return stored;
    if (taxVal > 0 && taxableVal > 0) return Math.round((taxVal / taxableVal) * 1000) / 10;
    return 0;
  })();
  const grandTotal = data.total;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  doc.text('Subtotal:', 40, y);
  doc.text(`Rs. ${subtotalVal.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });
  y += 4;

  if (discountVal > 0) {
    doc.text('Discount:', 40, y);
    doc.text(`-Rs. ${discountVal.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });
    y += 4;
  }

  doc.text(`GST (${taxRateVal}%):`, 40, y);
  doc.text(`Rs. ${taxVal.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });
  y += 4;

  doc.setLineWidth(0.3);
  doc.line(6, y, pageWidth - 6, y);
  y += 5;

  // ── Grand Total ───────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);
  doc.text('GRAND TOTAL:', 6, y);
  doc.text(`Rs. ${grandTotal.toFixed(2)}`, pageWidth - 6, y, { align: 'right' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const payMode = (data.payment_mode || 'UPI').toUpperCase();
  doc.setTextColor(16, 120, 60);
  doc.text(`Payment Status: PAID via ${payMode}`, 6, y);

  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(6, y, pageWidth - 6, y);

  // ── UPI Payment QR (exact grand total, any UPI app) ───────────────────────
  // Client-supplied PNG data URL — no QR library needed server-side.
  if (Number(data.total) > 0 && data.upi_qr && data.upi_qr.startsWith('data:image')) {
    try {
      const upiId = getServerUpiId(data.upi_id);
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(20, 20, 20);
      doc.text('SCAN TO PAY VIA UPI', pageWidth / 2, y, { align: 'center' });
      y += 3;
      const qrSize = 32;
      doc.addImage(data.upi_qr as string, 'PNG', pageWidth / 2 - qrSize / 2, y, qrSize, qrSize);
      y += qrSize + 3.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`Pay Rs. ${Number(data.total).toFixed(2)}`, pageWidth / 2, y, { align: 'center' });
      y += 3.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(110, 110, 110);
      doc.text(`to ${upiId}`, pageWidth / 2, y, { align: 'center' });
      y += 2;
      doc.setDrawColor(220, 220, 220);
      doc.line(6, y, pageWidth - 6, y);
    } catch (qrErr: any) {
      console.warn('[Receipt PDF] UPI QR skipped:', qrErr?.message || qrErr);
    }
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  y += 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('Thank you for dining with us!', pageWidth / 2, y, { align: 'center' });
  y += 3.5;
  doc.text('Please visit again ✦ Powered by Vyoma POS', pageWidth / 2, y, { align: 'center' });

  // Return as Node.js Buffer
  const uint8Array = doc.output('arraybuffer');
  return Buffer.from(uint8Array);
}
