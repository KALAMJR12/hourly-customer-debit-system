const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required!');
    console.log('Please set your Supabase database URL:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Click "Connect" button');
    console.log('3. Copy the URI from "Connection string" -> "Transaction pooler"');
    console.log('4. Replace [YOUR-PASSWORD] with your database password');
    console.log('5. Set it as DATABASE_URL environment variable');
    process.exit(1);
}

// Create PostgreSQL connection
const sql = postgres(DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 60,
});

// Create Drizzle instance
const db = drizzle(sql);

// Test connection
const testConnection = async () => {
    try {
        await sql`SELECT 1`;
        console.log('✅ Database connection successful');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('Please check your DATABASE_URL and ensure:');
        console.log('1. The URL is correct');
        console.log('2. Your Supabase project is running');
        console.log('3. The database password is correct');
        process.exit(1);
    }
};

// Test connection on startup
testConnection();

module.exports = { db, sql };
