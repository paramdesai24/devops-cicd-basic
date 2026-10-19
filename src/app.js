const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// In-memory catalog of products
const PRODUCTS = [
  {
    id: 1,
    name: 'AeroBeat Pro Wireless Headphones',
    category: 'Audio',
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.8,
    reviewsCount: 342,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: 'Active Noise Cancellation, 40-hour battery life, and spatial audio with studio-grade dynamic drivers.'
  },
  {
    id: 2,
    name: 'Chronos Smart Watch Ultra',
    category: 'Wearables',
    price: 279.99,
    originalPrice: 329.99,
    rating: 4.9,
    reviewsCount: 215,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    description: 'Titanium chassis, AMOLED always-on display, heart-rate ECG tracking, and 100m water resistance.'
  },
  {
    id: 3,
    name: 'KeyCraft RGB Mechanical Keyboard',
    category: 'Accessories',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.7,
    reviewsCount: 189,
    badge: 'Hot',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    description: 'Hot-swappable tactile switches, per-key RGB backlighting, aircraft aluminum frame, and wireless Bluetooth 5.2.'
  },
  {
    id: 4,
    name: 'Lumix Ergonomic Gaming Mouse',
    category: 'Accessories',
    price: 69.99,
    originalPrice: 89.99,
    rating: 4.6,
    reviewsCount: 98,
    badge: 'Sale',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    description: 'Ultra-lightweight 58g shell, 26,000 DPI optical sensor, PTFE glide feet, and optical microswitches.'
  },
  {
    id: 5,
    name: 'PulseBass Studio Monitor Speaker',
    category: 'Audio',
    price: 149.99,
    originalPrice: 179.99,
    rating: 4.7,
    reviewsCount: 124,
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    description: 'Room-filling acoustic clarity, Bluetooth & Optical input, customized DSP bass tuning.'
  },
  {
    id: 6,
    name: 'VisionX 4K HDR Web Camera',
    category: 'Accessories',
    price: 119.99,
    originalPrice: 139.99,
    rating: 4.5,
    reviewsCount: 76,
    badge: 'Featured',
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80',
    description: 'Sony STARVIS sensor, 4K at 60fps, dual noise-cancelling beamforming microphones, and privacy shutter.'
  }
];

// In-memory orders store
const ORDERS = [];

// ================= API ENDPOINTS =================

// GET all products or filter by category / search query
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let filtered = [...PRODUCTS];

  if (category && category.toLowerCase() !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  res.json({
    success: true,
    total: filtered.length,
    products: filtered
  });
});

// GET single product by ID
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = PRODUCTS.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, product });
});

// POST create an order
app.post('/api/orders', (req, res) => {
  const { customer, items, totalAmount } = req.body;

  if (!customer || !customer.name || !customer.email || !customer.address) {
    return res.status(400).json({ success: false, message: 'Missing customer details (name, email, address required)' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
  }

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  const newOrder = {
    orderId,
    customer,
    items,
    totalAmount: parseFloat(totalAmount) || 0,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  ORDERS.push(newOrder);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order: newOrder
  });
});

// Health check endpoint (for Cloud-Native Monitoring & CI/CD)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'ecommerce-spa-api'
  });
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    app: 'NovaShop Ecommerce SPA',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    productCount: PRODUCTS.length,
    ordersCount: ORDERS.length
  });
});

module.exports = app;
