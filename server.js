const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./api/auth.js');
const customerRoutes = require('./api/customers.js');
const debitProcessorRoutes = require('./api/debit-processor.js');
const scheduler = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/debit-processor', debitProcessorRoutes);

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log('✅ Environment variables required:');
  console.log('- DATABASE_URL');
  console.log('- JWT_SECRET (optional)');

  // Start debit scheduler
  setTimeout(() => {
    scheduler.start();
  }, 2000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nSIGINT detected. Shutting down...');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nSIGTERM detected. Shutting down...');
  scheduler.stop();
  process.exit(0);
});
