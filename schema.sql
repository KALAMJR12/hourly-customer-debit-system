-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    hourly_debit_amount DECIMAL(12, 2) NOT NULL,
    last_debited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_hourly_debit CHECK (hourly_debit_amount > 0),
    CONSTRAINT non_negative_balance CHECK (balance >= 0)
);

-- Create debit_logs table for audit trail
CREATE TABLE IF NOT EXISTS debit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
    amount DECIMAL(12, 2) NOT NULL,
    balance_before DECIMAL(12, 2),
    balance_after DECIMAL(12, 2),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_last_debited_at ON customers(last_debited_at);
CREATE INDEX IF NOT EXISTS idx_debit_logs_customer_id ON debit_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_debit_logs_created_at ON debit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_debit_logs_status ON debit_logs(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for customer statistics
CREATE OR REPLACE VIEW customer_stats AS
SELECT 
    c.id,
    c.name,
    c.balance,
    c.hourly_debit_amount,
    c.last_debited_at,
    c.created_at,
    COALESCE(SUM(CASE WHEN dl.status = 'success' THEN dl.amount ELSE 0 END), 0) as total_debited,
    COUNT(dl.id) as total_transactions,
    COUNT(CASE WHEN dl.status = 'success' THEN 1 END) as successful_transactions,
    COUNT(CASE WHEN dl.status = 'failed' THEN 1 END) as failed_transactions
FROM customers c
LEFT JOIN debit_logs dl ON c.id = dl.customer_id
GROUP BY c.id, c.name, c.balance, c.hourly_debit_amount, c.last_debited_at, c.created_at;

-- Sample data insertion (for testing - remove in production)
-- Note: This is commented out as per guidelines to not include sample data
/*
INSERT INTO users (id, email, password_hash) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewoBvskjqnZf2.z2');

INSERT INTO customers (id, user_id, name, balance, hourly_debit_amount) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'John Doe', 100.00, 5.00),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Jane Smith', 50.00, 2.50);
*/
