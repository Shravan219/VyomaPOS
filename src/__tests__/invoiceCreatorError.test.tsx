import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import * as sonner from 'sonner';

// Enable React act environment for headless testing
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock motion/react so happy-dom animations don't throw AbortError on unmount
vi.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag: string) => {
        return React.forwardRef((props: any, ref: any) => {
          const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
          return React.createElement(tag, { ...rest, ref });
        });
      },
    }
  ),
  AnimatePresence: ({ children }: any) => children,
}));

// Mock sonner toast
vi.mock('sonner', () => {
  const toastMock: any = vi.fn();
  toastMock.error = vi.fn();
  toastMock.success = vi.fn();
  toastMock.info = vi.fn();
  toastMock.warning = vi.fn();
  return { toast: toastMock };
});

// Mock InvoiceReceiptModal to inspect isOpen prop
let lastModalProps: any = null;
vi.mock('../components/invoices/InvoiceReceiptModal', () => ({
  InvoiceReceiptModal: (props: any) => {
    lastModalProps = props;
    return <div data-testid="receipt-modal" data-is-open={String(props.isOpen)} />;
  },
}));

// Mock apiConfig
vi.mock('@/src/lib/apiConfig', () => ({
  resolveApiUrl: (url: string) => `http://localhost:3000${url}`,
}));

import { InvoiceCreator } from '../components/invoices/InvoiceCreator';

describe('InvoiceCreator Error Handling & Execution Halting', () => {
  let container: HTMLDivElement;
  let root: any;
  let onOrderCreatedSpy: any;

  const mockMenuItems = [
    {
      id: 'menu_1',
      name: 'Paneer Butter Masala',
      price: 250,
      category: 'Main Course',
      is_available: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    lastModalProps = null;
    onOrderCreatedSpy = vi.fn();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  // Helper to mount component, click quick-tap menu item, and click "Issue & Save Invoice"
  async function submitInvoice() {
    await act(async () => {
      root.render(
        <InvoiceCreator
          menuItems={mockMenuItems as any}
          onOrderCreated={onOrderCreatedSpy}
        />
      );
    });

    // Find and click the quick tap button for 'Paneer Butter Masala'
    const quickTapBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Paneer Butter Masala')
    ) as HTMLButtonElement;
    expect(quickTapBtn).toBeDefined();

    await act(async () => {
      quickTapBtn.click();
    });

    // Find the submit button
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Issue & Save Invoice')
    ) as HTMLButtonElement;

    expect(submitBtn).toBeDefined();

    await act(async () => {
      submitBtn.click();
    });

    // Wait a tick for async handlers and promises to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
  }

  it('halts execution on HTTP 500 error: triggers toast.error and NEVER triggers toast.success, modal, or onOrderCreated', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve(JSON.stringify({ success: false, error: 'Database connection failed' })),
    } as any);

    await submitInvoice();

    expect(fetchSpy).toHaveBeenCalled();
    expect(sonner.toast.error).toHaveBeenCalledWith(
      'Invoice Creation Failed',
      expect.objectContaining({
        description: expect.stringMatching(/Database connection failed|Server responded with status 500/),
      })
    );
    expect(sonner.toast.success).not.toHaveBeenCalled();
    expect(lastModalProps?.isOpen).toBeFalsy();
    expect(onOrderCreatedSpy).not.toHaveBeenCalled();
  });

  it('halts execution on HTTP 200 with data.success === false: triggers toast.error and NEVER triggers toast.success, modal, or onOrderCreated', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ success: false, message: 'Invalid payment record' })),
    } as any);

    await submitInvoice();

    expect(fetchSpy).toHaveBeenCalled();
    expect(sonner.toast.error).toHaveBeenCalledWith(
      'Invoice Creation Failed',
      expect.objectContaining({
        description: 'Invalid payment record',
      })
    );
    expect(sonner.toast.success).not.toHaveBeenCalled();
    expect(lastModalProps?.isOpen).toBeFalsy();
    expect(onOrderCreatedSpy).not.toHaveBeenCalled();
  });

  it('halts execution on HTTP 200 with data.success === "0": triggers toast.error and NEVER triggers toast.success, modal, or onOrderCreated', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ success: '0', status: 'error', message: 'Dyno push rejected' })),
    } as any);

    await submitInvoice();

    expect(fetchSpy).toHaveBeenCalled();
    expect(sonner.toast.error).toHaveBeenCalledWith(
      'Invoice Creation Failed',
      expect.objectContaining({
        description: 'Dyno push rejected',
      })
    );
    expect(sonner.toast.success).not.toHaveBeenCalled();
    expect(lastModalProps?.isOpen).toBeFalsy();
    expect(onOrderCreatedSpy).not.toHaveBeenCalled();
  });

  it('halts execution on fetch network exception: catches error, shows toast.error, and never shows modal or onOrderCreated', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network disconnected'));

    await submitInvoice();

    expect(fetchSpy).toHaveBeenCalled();
    expect(sonner.toast.error).toHaveBeenCalledWith(
      'Invoice Creation Failed',
      expect.objectContaining({
        description: 'Network disconnected',
      })
    );
    expect(sonner.toast.success).not.toHaveBeenCalled();
    expect(lastModalProps?.isOpen).toBeFalsy();
    expect(onOrderCreatedSpy).not.toHaveBeenCalled();
  });

  it('halts execution on HTTP 502 with non-JSON HTML response and does not trigger modal or onOrderCreated', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 502,
      text: () => Promise.resolve('<html>502 Bad Gateway</html>'),
    } as any);

    await submitInvoice();

    expect(fetchSpy).toHaveBeenCalled();
    expect(sonner.toast.error).toHaveBeenCalledWith(
      'Invoice Creation Failed',
      expect.objectContaining({
        description: expect.stringMatching(/502 Bad Gateway|Server responded with status 502/),
      })
    );
    expect(sonner.toast.success).not.toHaveBeenCalled();
    expect(lastModalProps?.isOpen).toBeFalsy();
    expect(onOrderCreatedSpy).not.toHaveBeenCalled();
  });

  it('properly triggers success toast, opens receipt modal, and emits onOrderCreated on successful HTTP 200 response with success: "1"', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ success: '1', message: 'Order saved successfully' })),
    } as any);

    await submitInvoice();

    expect(fetchSpy).toHaveBeenCalled();
    expect(sonner.toast.error).not.toHaveBeenCalled();
    expect(sonner.toast.success).toHaveBeenCalledWith(
      expect.stringMatching(/Invoice #.* created & saved to database!/),
      expect.any(Object)
    );
    expect(lastModalProps?.isOpen).toBe(true);
    expect(onOrderCreatedSpy).toHaveBeenCalled();
  });
});
