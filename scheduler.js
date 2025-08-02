const { processHourlyDebits } = require('./api/debit-processor');

// Simple scheduler for hourly debit processing
class DebitScheduler {
    constructor() {
        this.intervalId = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) {
            console.log('Scheduler is already running');
            return;
        }

        console.log('🕐 Starting hourly debit scheduler...');
        
        // Run immediately on start (for testing)
        this.runDebitProcess();
        
        // Then run every hour (3600000 ms)
        this.intervalId = setInterval(() => {
            this.runDebitProcess();
        }, 3600000); // 1 hour = 3600000 milliseconds
        
        this.isRunning = true;
        console.log('✅ Hourly debit scheduler started successfully');
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('⏹️ Hourly debit scheduler stopped');
    }

    async runDebitProcess() {
        try {
            console.log(`\n🔄 Running scheduled debit process at ${new Date().toISOString()}`);
            const result = await processHourlyDebits();
            console.log(`✅ Scheduled debit process completed: ${result.successful} successful, ${result.failed} failed\n`);
        } catch (error) {
            console.error('❌ Error in scheduled debit process:', error);
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            nextRun: this.isRunning ? new Date(Date.now() + 3600000).toISOString() : null
        };
    }
}

// Create and export scheduler instance
const scheduler = new DebitScheduler();

module.exports = scheduler;