require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const authRoutes = require('./routes/auth.routes');
const vendorRoutes = require('./routes/vendor.routes');
const adminRoutes = require('./routes/admin.routes');
const orderRoutes = require('./routes/order.routes');
const publicRoutes = require('./routes/public.routes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://multivendor-git-main-arjunmeenaofc-2566s-projects.vercel.app',
    'https://multivendor-lv92.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/vendor', vendorRoutes);
app.use('/admin', adminRoutes);
app.use('/orders', orderRoutes);
app.use('/public', publicRoutes); // For product listing

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Multi-Vendor Marketplace API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
