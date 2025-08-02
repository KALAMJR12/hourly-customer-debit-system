# Hourly Customer Debit System

A complete backend system for managing customer accounts with automated hourly balance deductions. Built with Node.js/Express and PostgreSQL, featuring real-time debit processing and comprehensive audit logging.

## ✅ Challenge Requirements Met

- **User Authentication**: Email/password signup and login with JWT tokens
- **Customer Management**: CRUD operations for customer records with initial balance and hourly debit amounts
- **Automated Hourly Debit Processing**: Scheduled job that runs every hour to deduct amounts from customer balances
- **Database Schema**: Complete implementation with users, customers, and debit_logs tables
- **Audit Trail**: Full logging of all debit transactions with success/failure tracking
- **API Endpoints**: RESTful API for all customer operations
- **Real-time Dashboard**: Live updates with customer statistics and recent transaction logs

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with connection pooling
- **Authentication**: Custom JWT-based authentication system
- **ORM**: postgres-js for direct SQL queries
- **Frontend**: Vanilla JavaScript with Bootstrap 5
- **Scheduled Jobs**: Custom Node.js scheduler (runs every hour)
- **Security**: User-based data isolation and input validation

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd hourly-customer-debit-system
npm install
```

### 2. Database Setup

The system uses PostgreSQL. You can use either:

**Option A: Replit PostgreSQL (Recommended for development)**
- The database is automatically provisioned when running on Replit
- All environment variables are set automatically

**Option B: Supabase (Production)**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your database connection string
3. Set the `DATABASE_URL` environment variable

### 3. Environment Configuration

Create a `.env` file (optional - defaults work for Replit):

```env
# Database connection (auto-set on Replit)
DATABASE_URL=your-postgresql-connection-string

# JWT secret (optional - auto-generates if not provided)
JWT_SECRET=your-secret-key

# Port (optional - defaults to 5000)
PORT=5000
```

### 4. Database Schema Setup

The database tables are created automatically on first run:
- `users` - User authentication
- `customers` - Customer records with balances
- `debit_logs` - Transaction audit trail

### 5. Start the Application

```bash
npm start
```

The server starts on port 5000 with:
- ✅ Database connection test
- ✅ Automatic hourly debit scheduler
- ✅ Web interface at http://localhost:5000

## System Architecture & Approach

### Database Schema

```sql
-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table with balance tracking
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    hourly_debit_amount DECIMAL(12, 2) NOT NULL,
    last_debited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trail for all debit transactions
CREATE TABLE debit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
    amount DECIMAL(12, 2) NOT NULL,
    balance_before DECIMAL(12, 2),
    balance_after DECIMAL(12, 2),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Hourly Debit Processing

The core requirement is implemented in `api/debit-processor.js` and `scheduler.js`:

- **Automatic Processing**: Runs every hour via Node.js scheduler
- **Smart Logic**: Only debits customers with sufficient balance 
- **Audit Logging**: Records all transactions (success/failed) with detailed information
- **Error Handling**: Individual customer processing prevents system-wide failures
- **Manual Trigger**: Testing endpoint available at `POST /api/debit-processor/trigger`

### Key Features

1. **User Isolation**: Each user only sees their own customers (enforced at API level)
2. **Real-time Updates**: Dashboard refreshes every 30 seconds
3. **Input Validation**: Prevents negative balances and invalid debit amounts
4. **Transaction Logging**: Complete audit trail with timestamps and error messages
5. **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/me` - Get current user info

### Customer Management  
- `GET /api/customers` - List all customers for authenticated user
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get specific customer
- `PUT /api/customers/:id` - Update customer details
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/logs` - Get recent debit logs

### Debit Processing
- `POST /api/debit-processor/trigger` - Manually trigger hourly debit process
- `GET /api/debit-processor/status` - Get processing statistics

## API Usage Examples

### 1. User Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 2. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 3. Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "John Doe", "balance": 100.00, "hourly_debit_amount": 5.00}'
```

### 4. Trigger Hourly Debit
```bash
curl -X POST http://localhost:5000/api/debit-processor/trigger \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Customer List
```bash
curl -X GET http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment Options

### Option 1: Replit Deployment (Recommended)
1. Your app is ready to deploy on Replit
2. Click the "Deploy" button in your Replit project
3. The PostgreSQL database is already configured
4. No additional setup required

### Option 2: Traditional Hosting
1. Set up PostgreSQL database on your hosting provider
2. Set `DATABASE_URL` environment variable
3. Deploy the Node.js application
4. Ensure the hourly scheduler continues running

## File Structure

```
├── api/
│   ├── auth.js              # Authentication endpoints
│   ├── customers.js         # Customer CRUD operations  
│   └── debit-processor.js   # Hourly debit processing logic
├── config/
│   └── database.js          # Database connection setup
├── database/
│   ├── schema.sql           # Database table definitions
│   └── rls-policies.sql     # Row-level security policies
├── supabase/functions/      # Original Supabase Edge Function (unused)
├── scheduler.js             # Hourly debit scheduler
├── server.js               # Main Express server
├── index.html              # Frontend web interface
├── app.js                  # Frontend JavaScript
└── styles.css              # Frontend styling
```

## Testing the System

1. **Sign up** for a new account via the web interface
2. **Add customers** with different balance amounts and hourly debit rates
3. **Watch automatic processing** - the system runs debits on startup and every hour
4. **Use "Trigger Debit" button** to manually test the debit processing
5. **View transaction logs** in the "Recent Debit Logs" section
6. **Monitor balances** as they decrease with each hourly cycle

The system successfully demonstrates all core challenge requirements with a complete, production-ready implementation.
