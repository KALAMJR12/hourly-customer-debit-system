// db.js
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const db = postgres(process.env.DATABASE_URL, {
  ssl: 'require'
});

export default db;
