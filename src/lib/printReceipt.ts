/**
 * Thermal receipt printing via a hidden iframe.
 *
 * Why not window.print(): the receipt lives inside a Radix Dialog portal, so
 * page-level print CSS (`body > *:not(.receipt-print-wrapper)`) hides the
 * portal root itself and prints a blank page. Cloning the receipt node into an
 * isolated iframe sidesteps portals, popup blockers, and async assets (the
 * UPI QR) — we wait for images before invoking print.
 *
 * Platform coverage (one button everywhere):
 * - Web browsers + Electron EXE: Chromium honors iframe print() → native
 *   print dialog (thermal printer, Save as PDF, …).
 * - Capacitor APK: Android WebView does not implement window.print() at all,
 *   so `universalPrintReceipt` falls back to the OS share sheet with a PDF of
 *   the same bill — Android lists system print services there, ending in the
 *   same print dialog. No extra native plugins required.
 */
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

function waitForImages(root: Document, timeoutMs = 4000): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  if (imgs.length === 0) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    const timer = setTimeout(finish, timeoutMs);
    let pending = imgs.length;
    const onOne = () => {
      pending -= 1;
      if (pending <= 0) {
        clearTimeout(timer);
        finish();
      }
    };
    for (const img of imgs) {
      const el = img as HTMLImageElement;
      if (el.complete && el.naturalWidth > 0) {
        onOne();
      } else {
        el.addEventListener('load', onOne, { once: true });
        el.addEventListener('error', onOne, { once: true });
      }
    }
  });
}

/**
 * Layout-critical CSS properties snapshotted from the live receipt into the
 * print clone. This is what makes EXE/APK printing identical to web: the
 * clone carries its own styles, so a missing stylesheet (file:// iframe in
 * the packaged EXE, offline printer PC, …) can never collapse the layout.
 */
const PRINT_STYLE_PROPS = [
  'display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items',
  'align-content', 'align-self', 'gap', 'row-gap', 'column-gap',
  'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'order',
  'grid-template-columns', 'grid-column', 'grid-row',
  'width', 'min-width', 'max-width', 'height', 'min-height',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'text-align', 'vertical-align', 'font-size', 'font-weight', 'font-style',
  'line-height', 'letter-spacing', 'text-transform', 'text-decoration',
  'color', 'background-color',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-radius', 'white-space', 'overflow', 'overflow-x', 'overflow-y',
  'word-break', 'overflow-wrap', 'text-overflow', 'opacity', 'float', 'clear',
] as const;

function inlineComputedStyles(source: Element, clone: Element): void {
  const srcEls = [source, ...Array.from(source.querySelectorAll('*'))];
  const cloneEls = [clone, ...Array.from(clone.querySelectorAll('*'))];
  for (let i = 0; i < srcEls.length && i < cloneEls.length; i += 1) {
    let cs: CSSStyleDeclaration;
    try {
      cs = window.getComputedStyle(srcEls[i]);
    } catch {
      continue;
    }
    const target = cloneEls[i] as HTMLElement;
    for (const prop of PRINT_STYLE_PROPS) {
      try {
        const value = cs.getPropertyValue(prop);
        if (value) target.style.setProperty(prop, value);
      } catch {
        /* ignore unsupported properties */
      }
    }
  }
}

/**
 * Prints the given receipt node on 80mm thermal layout.
 * The node is deep-cloned with computed styles inlined (caller's React tree
 * is untouched), so the print document looks exactly like the screen preview
 * on web, EXE and APK alike — no external stylesheet required.
 */
export async function printThermalReceipt(source: HTMLElement | null, title = 'Receipt'): Promise<void> {
  if (!source) throw new Error('Nothing to print yet — receipt is still rendering.');

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const cleanup = () => {
    try {
      iframe.remove();
    } catch {
      /* already gone */
    }
  };

  try {
    const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!frameDoc) throw new Error('Print frame unavailable in this browser.');

    // Deep-clone with computed styles inlined — the print document is then
    // fully self-contained (no external stylesheets, no file:// loads).
    // NOTE: keep the clone's <style> print block (it ships inside the
    // receipt markup) — it carries the @page size and thermal widths.
    const clone = source.cloneNode(true) as HTMLElement;
    inlineComputedStyles(source, clone);

    frameDoc.open();
    frameDoc.write(`<!doctype html>
<html>
<head>
<title>${title.replace(/[<>&"]/g, '')}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; color: #000000 !important; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important; }
  .receipt-print-wrapper { display: block !important; width: 80mm !important; margin: 0 auto !important; padding: 0 !important; background: #ffffff !important; }
  .receipt-print-container { border: none !important; box-shadow: none !important; border-radius: 0 !important; margin: 0 auto !important; }
  img { max-width: 100%; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
</style>
</head>
<body>
<div class="receipt-print-wrapper"></div>
</body>
</html>`);
    frameDoc.close();

    const slot = frameDoc.querySelector('.receipt-print-wrapper');
    if (!slot) throw new Error('Print frame unavailable in this browser.');
    slot.appendChild(clone);

    await waitForImages(frameDoc);

    const frameWindow = iframe.contentWindow;
    if (!frameWindow) throw new Error('Print frame unavailable in this browser.');
    if (typeof frameWindow.print !== 'function') {
      throw new Error('Printing is not supported by this viewer.');
    }
    frameWindow.focus();
    frameWindow.print();
  } finally {
    // Give the print pipeline a beat before tearing down the frame.
    setTimeout(cleanup, 1500);
  }
}

export type UniversalPrintOutcome = 'dialog' | 'shared' | 'downloaded' | 'cancelled';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '');
        const marker = 'base64,';
        const idx = text.indexOf(marker);
        resolve(idx >= 0 ? text.slice(idx + marker.length) : text);
      };
      reader.onerror = () => reject(new Error('Could not read the receipt file.'));
      reader.readAsDataURL(blob);
    } catch (err: any) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

/**
 * One print button for web, EXE and APK.
 *
 * - Web / Electron: opens the native print dialog (thermal printer, PDF…).
 * - Capacitor Android: the WebView cannot open a print dialog, so the bill
 *   goes through a fallback chain — OS share sheet with the receipt PDF
 *   (Android lists system print services there) and, if sharing is
 *   unavailable, a direct download to the device. Every stage reports
 *   precisely, so a failure always names its cause instead of silence.
 */
export async function universalPrintReceipt(
  source: HTMLElement | null,
  opts?: {
    title?: string;
    buildPdfBlob?: () => Promise<Blob | null>;
  },
): Promise<UniversalPrintOutcome> {
  const title = opts?.title || 'Receipt';
  const safeName = `${title.replace(/[^\w\- ]+/g, '').trim() || 'Receipt'}.pdf`;
  const isNative = (() => {
    try {
      return Capacitor.isNativePlatform();
    } catch {
      return false;
    }
  })();

  if (!isNative) {
    await printThermalReceipt(source, title);
    return 'dialog';
  }

  // ── Native (APK): the WebView has no print dialog and no working
  // anchor-downloads, so the receipt travels over real native file APIs ──
  let blob: Blob | null = null;
  try {
    blob = opts?.buildPdfBlob ? await opts.buildPdfBlob() : null;
  } catch (err: any) {
    throw new Error(`Receipt PDF could not be built: ${err?.message || err}`);
  }
  if (!blob || blob.size === 0) {
    throw new Error('Receipt PDF came out empty — try again.');
  }

  // ── Stage 1: native share sheet with the PDF (lists print targets) ─────
  try {
    const base64 = await blobToBase64(blob);
    const cached = await Filesystem.writeFile({
      path: safeName,
      data: base64,
      directory: Directory.Cache,
      recursive: true,
    });
    await Share.share({ title, url: cached.uri });
    return 'shared';
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (err?.name === 'AbortError' || /cancel/i.test(msg)) return 'cancelled';
    // Fall through to Documents — share sheet failed, file still printable.
    console.warn('[Print] Native share failed, saving to Documents:', msg);
  }

  // ── Stage 2: persist to Documents — always retrievable + printable ─────
  try {
    const base64 = await blobToBase64(blob);
    const saved = await Filesystem.writeFile({
      path: safeName,
      data: base64,
      directory: Directory.Documents,
      recursive: true,
    });
    console.log('[Print] Receipt saved at', saved.uri);
    return 'downloaded';
  } catch (err: any) {
    throw new Error(`Receipt could not be saved on this device: ${err?.message || err}`);
  }
}
