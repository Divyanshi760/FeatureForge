const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes');

const app = express();

// Connect to MongoDB
connectDB();

// Restrict CORS to the configured frontend origin(s) in production.
// CORS_ORIGIN can be a comma-separated list; if unset, allow all origins.
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// API health check
app.get('/', (req, res) => {
  res.json({
    message: 'FeatureForge API & MongoDB Backend is running!',
    status: 'online',
    timestamp: new Date(),
  });
});

// Mount Dashboard API routes
app.use('/api', apiRoutes);

// Start server
const PORT = process.env.PORT || 5000;

const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});