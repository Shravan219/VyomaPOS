import express from 'express';

const MOCK_DYNO_PORT = 4000;
const SUPABASE_WEBHOOK_URL = 'https://orashnrwlkdsgkfmmwtw.supabase.co/functions/v1/order-webhook';
const ZOMATO_RES_ID = '22826045';

const app = express();
app.use(express.json());

// Catch-all logger for any incoming call from your POS
const logIncomingCall = (req, res, next) => {
  console.log(`\n==================================================`);
  console.log(`[POS -> DYNO CALL RECEIVED] ${req.method} ${req.path}`);
  if (Object.keys(req.query).length > 0) {
    console.log(`Query Parameters:`, JSON.stringify(req.query, null, 2));
  }
  if (Object.keys(req.body).length > 0) {
    console.log(`Request Body:`, JSON.stringify(req.body, null, 2));
  }
  console.log(`==================================================`);
  next();
};

app.use(logIncomingCall);

// 1. Target Endpoint: Webhook Callback Receiver (matches TESTER_CALLBACK_URL)
app.post('/api/webhooks/receiver', (req, res) => {
  res.status(200).json({ success: true, message: 'POS update received by Mock Tester' });
});

// 2. Native Dyno Outbound Status Route
app.post('/api/v1/orders/status', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Status updated' });
});

// 3. Swiggy Accept & Ready Routes (Query Param Based)
app.post(['/api/v1/swiggy/orders/accept', '/api/v1/swiggy/orders/accept/:res_id'], (req, res) => {
  res.status(200).send('Order Accepted');
});

app.post(['/api/v1/swiggy/orders/ready', '/api/v1/swiggy/orders/ready/:res_id'], (req, res) => {
  res.status(200).send('Order Ready');
});

// 4. Item Stock Routes
app.post(['/api/v1/swiggy/items/instock', '/api/v1/swiggy/items/instock/:res_id'], (req, res) => {
  res.status(200).send('Item In Stock');
});

app.post(['/api/v1/swiggy/items/outofstock', '/api/v1/swiggy/items/outofstock/:res_id'], (req, res) => {
  res.status(200).send('Item Out of Stock');
});

app.listen(MOCK_DYNO_PORT, () => {
  console.log(`\n🟢 Dyno Mock Server running at http://localhost:${MOCK_DYNO_PORT}`);
  console.log(`Listening for all outbound calls from Vyoma POS...\n`);
  setTimeout(runInboundTests, 1500);
});

// Inbound Test Dispatcher to Supabase
async function runInboundTests() {
  const testOrderId = `VY-SW-${Math.floor(1000 + Math.random() * 9000)}`;

  console.log(`\n--------------------------------------------------`);
  console.log(`🧪 DISPATCHING: New Order (${testOrderId}) to Supabase...`);
  console.log(`--------------------------------------------------`);

  const newOrderPayload = {
    orders: [
      {
        orderId: testOrderId,
        restaurantId: ZOMATO_RES_ID,
        vendor: 'SWIGGY',
        status: 'NEW',
        customerDetails: {
          name: 'Shravan Bhokase',
          phone: '+91 99224 41812',
          email: 'shravan@example.com',
          address: 'Katraj, Pune',
          landmark: 'Katraj',
          city: 'Pune',
          pincode: '411046'
        },
        items: [
          {
            id: 'ITM-01',
            itemName: 'Paneer Butter Masala',
            category: 'Main Course',
            price: 320,
            quantity: 1,
            isVeg: true,
            specialNotes: '',
            itemTotal: 320,
            addons: []
          },
          {
            id: 'ITM-02',
            itemName: 'Butter Naan',
            category: 'Breads',
            price: 40,
            quantity: 3,
            isVeg: true,
            specialNotes: '',
            itemTotal: 120,
            addons: []
          }
        ],
        billSummary: {
          subtotal: 440,
          discount: 0,
          tax: 22,
          packagingFee: 0,
          deliveryFee: 0,
          tip: 0,
          grandTotal: 462
        },
        orderType: 'DELIVERY',
        paymentType: 'PREPAID',
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const res = await fetch(SUPABASE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrderPayload)
    });
    const data = await res.json();
    console.log(`✅ Supabase Response (${res.status}):`, data);
  } catch (err) {
    console.error(`❌ Ingestion Failed:`, err.message);
  }
}