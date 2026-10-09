import { describe, it, expect } from 'vitest';
import { groupOrdersByCustomerAndTable } from '@/src/components/payments/PaymentsView';
import { Order } from '@/src/types';

describe('PaymentsView and groupOrdersByCustomerAndTable robustness', () => {
  it('should not throw "Cannot read properties of undefined (reading toLowerCase)" when item.name is undefined or missing', () => {
    const malformedOrders: Order[] = [
      {
        id: 'ord-1',
        token: '1001',
        table_id: '4',
        customer_name: 'Anay',
        customer_phone: '9876543210',
        status: 'waiting for payment',
        total: 250,
        created_at: new Date().toISOString(),
        items: [
          {
            id: 'item-1',
            price: 150,
            quantity: 1,
          } as any,
          {
            id: 'item-2',
            item_name: 'Cappuccino',
            price: 100,
            quantity: 1,
          } as any,
        ],
      },
      {
        id: 'ord-2',
        token: '1002',
        table_id: '4',
        customer_name: 'Anay',
        customer_phone: '9876543210',
        status: 'pending',
        total: 100,
        created_at: new Date().toISOString(),
        items: [
          {
            id: 'item-3',
            name: null as any,
            price: 100,
            quantity: 1,
          },
        ],
      },
    ];

    expect(() => {
      const grouped = groupOrdersByCustomerAndTable(malformedOrders);
      expect(grouped).toHaveLength(1);
      expect(grouped[0].order_ids).toHaveLength(2);
      expect(grouped[0].grand_total).toBe(350);
      expect(grouped[0].items.length).toBeGreaterThan(0);
      // Ensure all items have a valid string name
      grouped[0].items.forEach(it => {
        expect(typeof it.name).toBe('string');
        expect(it.name.length).toBeGreaterThan(0);
      });
    }).not.toThrow();
  });

  it('handles orders with stringified JSON items or null items without crashing', () => {
    const ordersWithRawItems = [
      {
        id: 'ord-3',
        token: '1003',
        table_id: 'takeaway',
        status: 'waiting for payment',
        total: 120,
        created_at: new Date().toISOString(),
        items: JSON.stringify([{ name: 'Cold Brew', quantity: 2, price: 60 }]),
      },
      {
        id: 'ord-4',
        token: 1004,
        items: null,
        status: 'pending',
        total: 0,
        created_at: new Date().toISOString(),
      },
    ] as unknown as Order[];

    expect(() => {
      const grouped = groupOrdersByCustomerAndTable(ordersWithRawItems);
      expect(grouped.length).toBeGreaterThanOrEqual(1);
    }).not.toThrow();
  });

  it('correctly aggregates matching orders with multiple items', () => {
    const orders: Order[] = [
      {
        id: 'ord-a',
        token: 'T-1',
        table_id: 'Table 5',
        customer_name: 'Rahul',
        customer_phone: '9999999999',
        status: 'preparing',
        total: 200,
        created_at: new Date().toISOString(),
        items: [
          { id: '1', name: 'Paneer Tikka', price: 200, quantity: 1 }
        ]
      },
      {
        id: 'ord-b',
        token: 'T-2',
        table_id: 'Table 5',
        customer_name: 'Rahul',
        customer_phone: '9999999999',
        status: 'ready',
        total: 400,
        created_at: new Date().toISOString(),
        items: [
          { id: '2', name: 'Paneer Tikka', price: 200, quantity: 1 },
          { id: '3', name: 'Butter Naan', price: 50, quantity: 4 }
        ]
      }
    ];

    const grouped = groupOrdersByCustomerAndTable(orders);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].tokens).toEqual(['T-1', 'T-2']);
    expect(grouped[0].grand_total).toBe(600);
    
    const tikka = grouped[0].items.find(it => it.name.toLowerCase().includes('paneer tikka'));
    expect(tikka).toBeDefined();
    expect(tikka?.quantity).toBe(2);

    const naan = grouped[0].items.find(it => it.name.toLowerCase().includes('butter naan'));
    expect(naan).toBeDefined();
    expect(naan?.quantity).toBe(4);
  });
});
