-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE debit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only see and modify their own record
CREATE POLICY "Users can view their own record" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own record" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Note: For this implementation, we're using custom auth, so these policies 
-- might need adjustment if using Supabase Auth directly

-- Customers table policies
-- Users can only access customers they own
CREATE POLICY "Users can view their own customers" ON customers
    FOR SELECT USING (user_id IN (
        SELECT id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert their own customers" ON customers
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their own customers" ON customers
    FOR UPDATE USING (user_id IN (
        SELECT id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete their own customers" ON customers
    FOR DELETE USING (user_id IN (
        SELECT id FROM users WHERE id = auth.uid()
    ));

-- Debit logs table policies
-- Users can only access logs for their customers
CREATE POLICY "Users can view logs for their customers" ON debit_logs
    FOR SELECT USING (customer_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
    ));

CREATE POLICY "System can insert debit logs" ON debit_logs
    FOR INSERT WITH CHECK (true);

-- Alternative policies for custom auth implementation
-- If using custom JWT auth instead of Supabase Auth, you might want to disable RLS
-- and rely on application-level security, or create different policies

-- Function to get current user from JWT (if using custom auth)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
    -- This would need to be implemented based on your auth system
    -- For now, returning NULL to disable RLS enforcement
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- If you want to use application-level security instead of RLS:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE debit_logs DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create role for the application
-- CREATE ROLE app_user;
-- GRANT USAGE ON SCHEMA public TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
