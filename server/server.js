require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');

// Models for cron cleanup
const Cart = require('./models/Cart');
const Product = require('./models/Product');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to Database
connectDB();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder for uploaded images and audio voice notes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NativeRise API', timestamp: new Date() });
});

// Mount Versioned API Routes (/api/v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/disputes', disputeRoutes);
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.originalUrl}` }
  });
});

// Centralized error handler
app.use(errorHandler);

// Background Cron Job: Stock-Lock Release (§7.2)
// Runs every 1 minute to release expired cart stock reservations
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const cartsWithExpiredItems = await Cart.find({
      'items.reservedUntil': { $lt: now }
    });

    for (const cart of cartsWithExpiredItems) {
      let modified = false;
      const remainingItems = [];

      for (const item of cart.items) {
        if (item.reservedUntil && item.reservedUntil < now) {
          // Release reserved stock on product
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { reservedStock: -item.quantity }
          });
          modified = true;
        } else {
          remainingItems.push(item);
        }
      }

      if (modified) {
        cart.items = remainingItems;
        await cart.save();
      }
    }
  } catch (err) {
    console.error('[Cron] Stock-lock release error:', err.message);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[NativeRise Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
