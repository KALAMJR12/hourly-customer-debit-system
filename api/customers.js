const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all customers for the authenticated user
router.get('/', async (req, res) => {
    try {
        const customers = await sql`
            SELECT id, name, balance, hourly_debit_amount, last_debited_at, created_at
            FROM customers 
            WHERE user_id = ${req.user.id}
            ORDER BY created_at DESC
        `;

        res.json({ customers });

    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// Get debit logs for all customers of the authenticated user
router.get('/logs', async (req, res) => {
    try {
        const logs = await sql`
            SELECT dl.id, dl.customer_id, dl.status, dl.amount, dl.balance_before, dl.balance_after, dl.error_message, dl.created_at, c.name as customer_name
            FROM debit_logs dl
            JOIN customers c ON dl.customer_id = c.id
            WHERE c.user_id = ${req.user.id}
            ORDER BY dl.created_at DESC
            LIMIT 50
        `;

        res.json({ logs });

    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Failed to fetch debit logs' });
    }
});

// Create a new customer
router.post('/', async (req, res) => {
    try {
        const { name, balance, hourly_debit_amount } = req.body;

        // Validate input
        if (!name || balance === undefined || hourly_debit_amount === undefined) {
            return res.status(400).json({ 
                error: 'Name, balance, and hourly_debit_amount are required' 
            });
        }

        if (balance < 0 || hourly_debit_amount <= 0) {
            return res.status(400).json({ 
                error: 'Balance must be non-negative and hourly debit amount must be positive' 
            });
        }

        // Create customer
        const customerId = uuidv4();
        const customer = await sql`
            INSERT INTO customers (id, user_id, name, balance, hourly_debit_amount, created_at)
            VALUES (${customerId}, ${req.user.id}, ${name}, ${balance}, ${hourly_debit_amount}, NOW())
            RETURNING id, name, balance, hourly_debit_amount, last_debited_at, created_at
        `;

        res.status(201).json({
            message: 'Customer created successfully',
            customer: customer[0]
        });

    } catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

// Get a specific customer
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const customers = await sql`
            SELECT id, name, balance, hourly_debit_amount, last_debited_at, created_at
            FROM customers 
            WHERE id = ${id} AND user_id = ${req.user.id}
        `;

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({ customer: customers[0] });

    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

// Update a customer
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, balance, hourly_debit_amount } = req.body;

        // Check if customer exists and belongs to user
        const existingCustomers = await sql`
            SELECT id FROM customers WHERE id = ${id} AND user_id = ${req.user.id}
        `;

        if (existingCustomers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Validate input
        if (balance !== undefined && balance < 0) {
            return res.status(400).json({ error: 'Balance must be non-negative' });
        }

        if (hourly_debit_amount !== undefined && hourly_debit_amount <= 0) {
            return res.status(400).json({ error: 'Hourly debit amount must be positive' });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        
        if (name !== undefined) {
            updates.push('name = $' + (values.length + 1));
            values.push(name);
        }
        if (balance !== undefined) {
            updates.push('balance = $' + (values.length + 1));
            values.push(balance);
        }
        if (hourly_debit_amount !== undefined) {
            updates.push('hourly_debit_amount = $' + (values.length + 1));
            values.push(hourly_debit_amount);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Add WHERE clause values
        values.push(id, req.user.id);

        const customer = await sql`
            UPDATE customers 
            SET ${sql.unsafe(updates.join(', '))}
            WHERE id = ${id} AND user_id = ${req.user.id}
            RETURNING id, name, balance, hourly_debit_amount, last_debited_at, created_at
        `;

        res.json({
            message: 'Customer updated successfully',
            customer: customer[0]
        });

    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete customer (this will also delete related debit logs due to CASCADE)
        const deletedCustomers = await sql`
            DELETE FROM customers 
            WHERE id = ${id} AND user_id = ${req.user.id}
            RETURNING id, name
        `;

        if (deletedCustomers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({
            message: 'Customer deleted successfully',
            customer: deletedCustomers[0]
        });

    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

// Get debit logs for a specific customer
router.get('/:id/logs', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if customer belongs to user
        const customers = await sql`
            SELECT id FROM customers WHERE id = ${id} AND user_id = ${req.user.id}
        `;

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const logs = await sql`
            SELECT id, customer_id, status, amount, created_at
            FROM debit_logs 
            WHERE customer_id = ${id}
            ORDER BY created_at DESC
            LIMIT 100
        `;

        res.json({ logs });

    } catch (error) {
        console.error('Get customer logs error:', error);
        res.status(500).json({ error: 'Failed to fetch customer logs' });
    }
});

// Manual debit endpoint (for testing)
router.post('/:id/debit', async (req, res) => {
    try {
        const { id } = req.params;

        // Get customer
        const customers = await sql`
            SELECT id, name, balance, hourly_debit_amount
            FROM customers 
            WHERE id = ${id} AND user_id = ${req.user.id}
        `;

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const customer = customers[0];
        const debitAmount = parseFloat(customer.hourly_debit_amount);
        const currentBalance = parseFloat(customer.balance);

        let status = 'success';
        let newBalance = currentBalance;

        if (currentBalance >= debitAmount) {
            // Sufficient balance - perform debit
            newBalance = currentBalance - debitAmount;
            
            await sql`
                UPDATE customers 
                SET balance = ${newBalance}, last_debited_at = NOW()
                WHERE id = ${id}
            `;
        } else {
            // Insufficient balance
            status = 'failed';
        }

        // Log the transaction
        const logId = uuidv4();
        await sql`
            INSERT INTO debit_logs (id, customer_id, status, amount, created_at)
            VALUES (${logId}, ${id}, ${status}, ${debitAmount}, NOW())
        `;

        res.json({
            message: `Debit ${status}`,
            customer_id: id,
            amount: debitAmount,
            status,
            new_balance: newBalance,
            previous_balance: currentBalance
        });

    } catch (error) {
        console.error('Manual debit error:', error);
        res.status(500).json({ error: 'Failed to process debit' });
    }
});

module.exports = router;
