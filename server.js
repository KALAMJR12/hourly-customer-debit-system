const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');
const db = require('./db');

//const pool = new Pool({
  //connectionString: process.env.DATABASE_URL,
  //ssl: {
    //rejectUnauthorized: false // Needed for Supabase and Railway
  }
});

const authRoutes = require('./api/auth.js');
const customerRoutes = require('./api/customers.js');
const debitProcessorRoutes = require('./api/debit-processor.js');
const scheduler = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/debit-processor', debitProcessorRoutes);

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('Environment variables needed:');
    console.log('- DATABASE_URL: Your Supabase PostgreSQL connection string');
    console.log('- JWT_SECRET: Secret key for JWT tokens (optional, will generate if not provided)');
    
    // Start the hourly debit scheduler
    setTimeout(() => {
        scheduler.start();
    }, 2000); // Wait 2 seconds for DB connection to be established
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Graceful shutdown...');
    scheduler.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Graceful shutdown...');
    scheduler.stop();
    process.exit(0);
});
