import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import habitRoutes from './routes/habits.js';
import logRoutes from './routes/logs.js';
import analyticsRoutes from './routes/analytics.js';
import settingsRoutes from './routes/settings.js';
import syncRoutes from './routes/sync.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HabitAlgo API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      habits: '/api/v1/habits',
      logs: '/api/v1/logs',
      analytics: '/api/v1/analytics',
      settings: '/api/v1/settings',
      sync: '/api/v1/sync'
    },
    documentation: 'Visit /health for API status'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'HabitAlgo API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/habits`, habitRoutes);
app.use(`${API_PREFIX}/logs`, logRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/settings`, settingsRoutes);
app.use(`${API_PREFIX}/sync`, syncRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}${API_PREFIX}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});
