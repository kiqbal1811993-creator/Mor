const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
// Load .env from server/ directory (works locally; on Vercel set vars in dashboard)
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'mor_super_secret_key_2026'; // Please ensure this is set in .env in production

// Vercel proxy support (required for rate-limiting to work properly)
app.set('trust proxy', 1);

// Security Middleware - Rate Limiter disabled (Vercel proxy IP issue)
// const loginLimiter = rateLimit({ ... });

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: true, // Allow all origins for the API to prevent CORS 500 errors
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serverless friendly MongoDB Connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing. Please set it in Vercel Environment Variables.');

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).then((mongoose) => {
      return mongoose;
    }).catch(err => {
      cached.promise = null;
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

// Simple ping endpoint to check if API is alive (without DB connection)
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', env: { hasMongo: !!process.env.MONGODB_URI }, dbState: mongoose.connection.readyState });
});

// Endpoint to test database connection and show exact error
app.get('/api/test-db', async (req, res) => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return res.status(500).json({ status: 'error', message: 'MONGODB_URI is empty' });
    }
    await mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
    res.json({ status: 'success', message: 'Connected to MongoDB successfully!' });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to connect to MongoDB', 
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code
    });
  }
});

// Middleware to ensure DB connection on every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    if (req.path === '/api/products') {
      return res.json([{ 
        id: 'db-error', 
        title: 'DB MIDDLEWARE ERROR: ' + error.message, 
        price: 0, 
        actualPrice: 0, 
        images: [''], 
        description: error.stack 
      }]);
    }
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Product Schema & Model
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  actualPrice: { type: Number, required: true, default: 1500 },
  images: { type: [String], required: true },
  video: { type: String, default: '' },
  description: { type: String, default: 'Experience the ultimate care for your hair with MOR Multi Recover Hair Oil. Formulated with a blend of premium natural oils, this lightweight, non-greasy formula penetrates deep into the roots to strengthen, nourish, and restore your hair\'s natural shine. Perfect for reducing hair fall, repairing split ends, and promoting healthy growth.' },
  image: { type: String } // For backwards compatibility
}, { timestamps: true });

productSchema.index({ createdAt: -1 });
const Product = mongoose.model('Product', productSchema);

// Message Schema & Model
const messageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  sender: { type: String, required: true, enum: ['customer', 'admin'] },
  text: { type: String, default: '' },
  product: {
    title: { type: String },
    price: { type: Number },
    image: { type: String }
  },
  read: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ sessionId: 1, createdAt: 1 });
messageSchema.index({ createdAt: -1 });
const Message = mongoose.model('Message', messageSchema);

// Order Schema & Model
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, default: '' },
    address: { type: String, required: true }
  },
  product: {
    id: { type: String },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String }
  },
  quantity: { type: Number, default: 1 },
  totalAmount: { type: Number, required: true },
  deliveryMethod: { type: String, default: 'Cash on Delivery' },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] }
}, { timestamps: true });

orderSchema.index({ createdAt: -1 });
const Order = mongoose.model('Order', orderSchema);

// Review Schema & Model
const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  text: { type: String, required: true },
  image: { type: String } // Base64 or URL
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

// Subscriber Schema & Model
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true }
}, { timestamps: true });

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// SubAdmin Schema & Model
const subAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  permissions: { type: [String], default: [] } // ['products','orders','chat','helpline']
}, { timestamps: true });
const SubAdmin = mongoose.model('SubAdmin', subAdminSchema);

// Nodemailer transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper to send new product emails to subscribers
const notifySubscribers = async (product) => {
  try {
    const subscribers = await Subscriber.find({});
    if (subscribers.length === 0) return;
    const emails = subscribers.map(s => s.email);
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
    await transporter.sendMail({
      from: `"MOR Natural Care" <${process.env.EMAIL_USER}>`,
      bcc: emails,
      subject: `🌿 New Product Added: ${product.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0a0f1a;color:#fff;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#4ade80,#22c55e);padding:24px;text-align:center">
            <h1 style="margin:0;font-size:24px;color:#000">New Product from MOR!</h1>
          </div>
          ${imageUrl ? `<div style="text-align:center;padding:20px"><img src="${imageUrl}" style="max-width:280px;border-radius:10px" alt="${product.title}"/></div>` : ''}
          <div style="padding:24px">
            <h2 style="color:#4ade80">${product.title}</h2>
            <p style="color:#a0a0a0">${product.description || ''}</p>
            <p style="font-size:22px;font-weight:bold;color:#fff">Rs. ${product.price}</p>
            <a href="https://morcare.pk/shop" style="display:inline-block;padding:12px 28px;background:#4ade80;color:#000;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">Shop Now</a>
          </div>
          <div style="padding:16px;text-align:center;color:#555;font-size:12px">You received this because you subscribed to MOR updates.</div>
        </div>
      `
    });
    console.log(`Newsletter sent to ${emails.length} subscriber(s).`);
  } catch (err) {
    console.error('Error sending newsletter:', err.message);
  }
};

// Super Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.SUPERADMIN_EMAIL && password === process.env.SUPERADMIN_PASS) {
    const token = jwt.sign({ role: 'superadmin' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: 'superadmin' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Sub-Admin Login
app.post('/api/sub-admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const subAdmin = await SubAdmin.findOne({ email: email.toLowerCase() });
    if (!subAdmin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Compare hashed password
    const isMatch = await bcrypt.compare(password, subAdmin.password);
    if (!isMatch) {
      // Temporary fallback for existing plain text passwords to not break the system for now
      // A migration script should ideally run to hash all existing passwords
      if (subAdmin.password === password) {
         // It's plain text, we could hash it and save here optionally
      } else {
         return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    const token = jwt.sign(
      { role: 'subadmin', subAdminId: subAdmin._id, permissions: subAdmin.permissions },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, role: 'subadmin', permissions: subAdmin.permissions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware: only superadmin
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Access denied. No token provided.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'superadmin') {
      req.admin = decoded;
      next();
    } else {
      res.status(403).json({ message: 'Unauthorized.' });
    }
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Middleware: superadmin OR subadmin (with optional permission check)
const verifyAnyAdmin = (permission) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Access denied.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'superadmin') { req.admin = decoded; return next(); }
    if (decoded.role === 'subadmin') {
      if (!permission || (decoded.permissions && decoded.permissions.includes(permission))) {
        req.admin = decoded;
        return next();
      }
      return res.status(403).json({ message: 'Permission denied.' });
    }
    res.status(403).json({ message: 'Unauthorized.' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Super admin: Create sub-admin
app.post('/api/super-admin/create-subadmin', verifyAdmin, async (req, res) => {
  const { email, password, permissions } = req.body;
  try {
    const existing = await SubAdmin.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Admin with this email already exists.' });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const subAdmin = new SubAdmin({ email: email.toLowerCase(), password: hashedPassword, permissions: permissions || [] });
    await subAdmin.save();
    res.json({ success: true, message: 'Sub-admin created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create admin: ' + err.message });
  }
});

// Super admin: List sub-admins
app.get('/api/super-admin/subadmins', verifyAdmin, async (req, res) => {
  try {
    const admins = await SubAdmin.find({}, '-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Super admin: Delete sub-admin
app.delete('/api/super-admin/subadmins/:id', verifyAdmin, async (req, res) => {
  try {
    await SubAdmin.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sub-admin: Verify session is still valid (checks if sub-admin still exists in DB)
app.get('/api/sub-admin/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ valid: false });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'subadmin') return res.status(403).json({ valid: false });
    const subAdmin = await SubAdmin.findById(decoded.subAdminId);
    if (!subAdmin) return res.status(401).json({ valid: false, reason: 'deleted' });
    res.json({ valid: true, permissions: subAdmin.permissions });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    // Use limit to avoid memory issues on Atlas M0 free tier
    const products = await Product.find().limit(100).lean();
    const formattedProducts = products.map(p => ({
      id: p._id.toString(),
      title: p.title,
      price: p.price,
      actualPrice: p.actualPrice,
      images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
      video: p.video || '',
      description: p.description
    }));
    res.json(formattedProducts);
  } catch (error) {
    res.json([{ 
      id: 'route-error', 
      title: 'PRODUCTS ROUTE ERROR: ' + error.message, 
      price: 0, 
      actualPrice: 0, 
      images: [''], 
      description: error.stack 
    }]);
  }
});

// Add a new product (Protected)
app.post('/api/products', verifyAnyAdmin('products'), async (req, res) => {
  try {
    const { title, price, actualPrice, images, video, description } = req.body;
    const newProduct = new Product({ title, price, actualPrice, images, video, description, image: images && images.length > 0 ? images[0] : '' });
    const savedProduct = await newProduct.save();
    const productData = {
      id: savedProduct._id.toString(),
      title: savedProduct.title,
      price: savedProduct.price,
      actualPrice: savedProduct.actualPrice,
      images: savedProduct.images,
      video: savedProduct.video,
      description: savedProduct.description
    };
    res.status(201).json(productData);
    // Notify subscribers (fire and forget)
    notifySubscribers(productData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Newsletter: Subscribe
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(200).json({ message: 'Already subscribed!' });
    await new Subscriber({ email }).save();
    res.status(201).json({ message: 'Subscribed successfully! You will be notified of new products.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a product (Protected)
app.put('/api/products/:id', verifyAnyAdmin('products'), async (req, res) => {
  try {
    const { title, price, actualPrice, images, video, description } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { title, price, actualPrice, images, video, description, image: images && images.length > 0 ? images[0] : '' },
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    
    res.json({
      id: updatedProduct._id.toString(),
      title: updatedProduct.title,
      price: updatedProduct.price,
      actualPrice: updatedProduct.actualPrice,
      images: updatedProduct.images,
      video: updatedProduct.video,
      description: updatedProduct.description
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a product (Protected)
app.delete('/api/products/:id', verifyAnyAdmin('products'), async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Review API Routes ---
app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { productId, name, rating, text, image } = req.body;
    const newReview = new Review({ productId, name, rating, text, image });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Chat API Routes ---

// Send a new message
app.post('/api/chat/message', async (req, res) => {
  try {
    const { sessionId, sender, text, product } = req.body;
    if (!sessionId || !sender) return res.status(400).json({ message: 'Missing required fields' });
    
    const newMessage = new Message({ sessionId, sender, text, product });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a specific session
app.get('/api/chat/messages/:sessionId', async (req, res) => {
  try {
    const messages = await Message.find({ sessionId: req.params.sessionId }).select('-product.image').limit(200).lean();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all unique chat sessions (Admin only)
app.get('/api/chat/sessions', verifyAnyAdmin(), async (req, res) => {
  try {
    // Group messages by sessionId and get the latest message for each session
    const sessions = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      { 
        $group: {
          _id: "$sessionId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: { 
            $sum: { 
              $cond: [ { $and: [ { $eq: ["$sender", "customer"] }, { $eq: ["$read", false] } ] }, 1, 0 ] 
            } 
          }
        }
      },
      { $sort: { "lastMessage.createdAt": -1 } }
    ]);
    
    res.json(sessions.map(s => ({
      sessionId: s._id,
      lastMessage: s.lastMessage.text || 'Product Shared',
      timestamp: s.lastMessage.createdAt,
      unreadCount: s.unreadCount
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark session messages as read (by admin)
app.put('/api/chat/sessions/:sessionId/read', verifyAnyAdmin(), async (req, res) => {
  try {
    await Message.updateMany(
      { sessionId: req.params.sessionId, sender: 'customer', read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a chat session (Admin only)
app.delete('/api/chat/sessions/:sessionId', verifyAnyAdmin(), async (req, res) => {
  try {
    await Message.deleteMany({ sessionId: req.params.sessionId });
    res.json({ success: true, message: 'Chat session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark admin messages as read (by customer)
app.put('/api/chat/sessions/:sessionId/read-customer', async (req, res) => {
  try {
    await Message.updateMany(
      { sessionId: req.params.sessionId, sender: 'admin', read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed Initial Product if database is empty (Utility)
app.post('/api/products/seed', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const defaultProduct = new Product({
        title: 'MOR Multi Recover ( Hair Oil )',
        price: 1300,
        image: '/public/WhatsApp_Image_2026-09-09_at_6.11.34_2K_20260910213024-removebg-preview.jpeg'
      });
      await defaultProduct.save();
      res.json({ message: 'Database seeded with default product.' });
    } else {
      res.json({ message: 'Database already has products.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Order API Routes ---

// Place a new order
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, product, quantity, totalAmount } = req.body;
    if (!customer || !product) return res.status(400).json({ message: 'Missing required fields' });

    const orderId = 'MOR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();

    const newOrder = new Order({ orderId, customer, product, quantity, totalAmount });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (Admin only)
app.get('/api/orders', verifyAnyAdmin('orders'), async (req, res) => {
  try {
    const orders = await Order.find().select('-product.image').limit(500).lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an order (Admin only)
app.delete('/api/orders/:id', verifyAnyAdmin('orders'), async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Track an order (Public)
app.get('/api/orders/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Return safe details to the customer
    res.json({
      orderId: order.orderId,
      status: order.status,
      createdAt: order.createdAt,
      product: order.product,
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      customer: { name: order.customer.name }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (Admin only)
app.put('/api/orders/:id/status', verifyAnyAdmin('orders'), async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;

// Global Error Handler to expose hidden 500 errors
app.use((err, req, res, next) => {
  console.error('Express Global Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Express caught an unhandled error',
    errorMessage: err.message,
    stack: err.stack
  });
});
