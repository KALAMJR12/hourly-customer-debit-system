const express = require('express');
const { sql } = require('../config/database');

const router = express.Router();

// Process hourly debits for all customers
const processHourlyDebits = async () => {
    const results = [];
    let successCount = 0;
    let failCount = 0;

    try {
        console.log('Starting hourly debit process...');
        
        // Get all customers that need to be debited
        const customers = await sql`
            SELECT id, user_id, name, balance, hourly_debit_amount, last_debited_at
            FROM customers
            WHERE balance > 0
        `;

        console.log(`Processing ${customers.length} customers for hourly debits`);

        // Process each customer
        for (const customer of customers) {
            try {
                const balanceBefore = parseFloat(customer.balance);
                const debitAmount = parseFloat(customer.hourly_debit_amount);

                if (balanceBefore >= debitAmount) {
                    // Sufficient balance - process debit
                    const newBalance = balanceBefore - debitAmount;

                    // Update customer balance and last_debited_at
                    await sql`
                        UPDATE customers 
                        SET balance = ${newBalance}, last_debited_at = NOW()
                        WHERE id = ${customer.id}
                    `;

                    // Log successful transaction
                    await sql`
                        INSERT INTO debit_logs (customer_id, status, amount, balance_before, balance_after, created_at)
                        VALUES (${customer.id}, 'success', ${debitAmount}, ${balanceBefore}, ${newBalance}, NOW())
                    `;

                    console.log(`✅ Debited $${debitAmount} from ${customer.name} (ID: ${customer.id})`);
                    successCount++;

                    results.push({
                        customer_id: customer.id,
                        customer_name: customer.name,
                        status: 'success',
                        amount: debitAmount,
                        balance_before: balanceBefore,
                        balance_after: newBalance
                    });

                } else {
                    // Insufficient balance - log failed transaction
                    await sql`
                        INSERT INTO debit_logs (customer_id, status, amount, balance_before, balance_after, error_message, created_at)
                        VALUES (${customer.id}, 'failed', ${debitAmount}, ${balanceBefore}, ${balanceBefore}, 'Insufficient balance', NOW())
                    `;

                    console.log(`❌ Insufficient balance for ${customer.name} (ID: ${customer.id}). Balance: $${balanceBefore}, Required: $${debitAmount}`);
                    failCount++;

                    results.push({
                        customer_id: customer.id,
                        customer_name: customer.name,
                        status: 'failed',
                        amount: debitAmount,
                        balance_before: balanceBefore,
                        balance_after: balanceBefore,
                        error_message: 'Insufficient balance'
                    });
                }

            } catch (error) {
                console.error(`Error processing customer ${customer.id}:`, error);
                failCount++;

                // Log failed transaction
                await sql`
                    INSERT INTO debit_logs (customer_id, status, amount, balance_before, balance_after, error_message, created_at)
                    VALUES (${customer.id}, 'failed', ${parseFloat(customer.hourly_debit_amount)}, ${parseFloat(customer.balance)}, ${parseFloat(customer.balance)}, ${`Processing error: ${error.message}`}, NOW())
                `;

                results.push({
                    customer_id: customer.id,
                    customer_name: customer.name,
                    status: 'failed',
                    amount: parseFloat(customer.hourly_debit_amount),
                    balance_before: parseFloat(customer.balance),
                    balance_after: parseFloat(customer.balance),
                    error_message: `Processing error: ${error.message}`
                });
            }
        }

        const summary = {
            message: 'Hourly debit process completed',
            timestamp: new Date().toISOString(),
            total_customers: customers.length,
            successful: successCount,
            failed: failCount,
            results: results
        };

        console.log('Hourly debit process completed:', summary);
        return summary;

    } catch (error) {
        console.error('Error in hourly debit process:', error);
        throw error;
    }
};

// Manual trigger endpoint for testing
router.post('/trigger', async (req, res) => {
    try {
        const result = await processHourlyDebits();
        res.json(result);
    } catch (error) {
        console.error('Manual debit trigger error:', error);
        res.status(500).json({ error: 'Failed to process hourly debits' });
    }
});

// Get processing status
router.get('/status', async (req, res) => {
    try {
        // Get recent logs summary
        const recentLogs = await sql`
            SELECT 
                COUNT(*) as total_transactions,
                COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
                MAX(created_at) as last_processed
            FROM debit_logs
            WHERE created_at >= NOW() - INTERVAL '24 hours'
        `;

        const summary = recentLogs[0] || {
            total_transactions: 0,
            successful: 0,
            failed: 0,
            last_processed: null
        };

        res.json({
            message: 'Debit processor status',
            last_24_hours: summary,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

module.exports = router;
module.exports.processHourlyDebits = processHourlyDebits;