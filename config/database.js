const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

// Check if we're in build mode (Railway build process)
const isBuildMode = process.env.RAILWAY_ENVIRONMENT === undefined && !DATABASE_URL;

if (!DATABASE_URL && !isBuildMode) {
    console.error('DATABASE_URL environment variable is required!');
    console.log('Please set your PostgreSQL database URL:');
    console.log('1. Go to your Railway PostgreSQL service');
    console.log('2. Click "Connect" tab');
    console.log('3. Copy the "Database URL"');
    console.log('4. Set it as DATABASE_URL environment variable in your app service');
    process.exit(1);
}

if (isBuildMode) {
    // During build, export stub functions
    console.log('Build mode: DATABASE_URL not required during build');
    module.exports = { 
        db: null, 
        sql: () => Promise.resolve([]) 
    };
} else {
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
        console.log('2. Your PostgreSQL service is running');
        console.log('3. The database connection string is correct');
        process.exit(1);
    }
};

// Test connection on startup
testConnection();

module.exports = { db, sql };
}
