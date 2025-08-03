const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

const DATABASE_URL = process.env.DATABASE_URL;

const isBuildMode = process.env.RAILWAY_ENVIRONMENT === undefined && !DATABASE_URL;

if (!DATABASE_URL && !isBuildMode) {
    console.error('❌ DATABASE_URL environment variable is required!');
    console.log('🔧 Set it in Railway → Variables tab using your Supabase DB connection string');
    process.exit(1);
}

if (isBuildMode) {
    console.log('⚙️ Build mode: DATABASE_URL not required');
    module.exports = { db: null, sql: () => Promise.resolve([]) };
} else {
    const sql = postgres(DATABASE_URL, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 60,
        ssl: 'require', // ✅ Required for Supabase
    });

    const db = drizzle(sql);

    const testConnection = async () => {
        try {
            await sql`SELECT 1`;
            console.log('✅ Database connection to Supabase successful');
        } catch (error) {
            console.error('❌ Failed to connect to Supabase:', error.message);
            process.exit(1);
        }
    };

    testConnection();

    module.exports = { db, sql };
}
