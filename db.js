// db.js (CommonJS version)
const postgres = require('postgres');
require('dotenv').config();

const db = postgres(process.env.DATABASE_URL, {
  ssl: 'require'
});

module.exports = db;
