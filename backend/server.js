const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
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

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});