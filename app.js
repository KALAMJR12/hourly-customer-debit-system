// Global state management
const AppState = {
    user: null,
    customers: [],
    logs: [],
    token: localStorage.getItem('authToken') || null
};

// API configuration
const API_BASE = window.location.origin;

// Utility functions
const showAlert = (message, type = 'info') => {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'danger' ? 'exclamation' : 'info'}-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforeend', alertHTML);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            alert.remove();
        }
    }, 5000);
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
};

// API functions
const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE}/api${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(AppState.token && { 'Authorization': `Bearer ${AppState.token}` })
        },
        ...options
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

// Authentication functions
const login = async (email, password) => {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: { email, password }
        });

        AppState.token = data.token;
        AppState.user = data.user;
        localStorage.setItem('authToken', data.token);
        
        showAlert('Login successful!', 'success');
        showAppSection();
        loadCustomers();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
};

const signup = async (email, password) => {
    try {
        const data = await apiCall('/auth/signup', {
            method: 'POST',
            body: { email, password }
        });

        showAlert('Account created successfully! Please login.', 'success');
        
        // Switch to login tab
        document.getElementById('loginTab').click();
        document.getElementById('loginEmail').value = email;
    } catch (error) {
        showAlert(error.message, 'danger');
    }
};

const logout = () => {
    AppState.token = null;
    AppState.user = null;
    AppState.customers = [];
    AppState.logs = [];
    localStorage.removeItem('authToken');
    
    showAuthSection();
    showAlert('Logged out successfully', 'info');
};

// Customer management functions
const loadCustomers = async () => {
    try {
        const data = await apiCall('/customers');
        AppState.customers = data.customers || [];
        renderCustomers();
        updateStats();
        loadRecentLogs();
    } catch (error) {
        showAlert('Failed to load customers: ' + error.message, 'danger');
        renderCustomers();
    }
};

const addCustomer = async (name, initialBalance, hourlyDebitAmount) => {
    try {
        const data = await apiCall('/customers', {
            method: 'POST',
            body: {
                name,
                balance: initialBalance,
                hourly_debit_amount: hourlyDebitAmount
            }
        });

        AppState.customers.push(data.customer);
        renderCustomers();
        updateStats();
        
        showAlert('Customer added successfully!', 'success');
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
        modal.hide();
        document.getElementById('addCustomerForm').reset();
    } catch (error) {
        showAlert('Failed to add customer: ' + error.message, 'danger');
    }
};

const deleteCustomer = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
        return;
    }

    try {
        await apiCall(`/customers/${customerId}`, {
            method: 'DELETE'
        });

        AppState.customers = AppState.customers.filter(c => c.id !== customerId);
        renderCustomers();
        updateStats();
        
        showAlert('Customer deleted successfully!', 'success');
    } catch (error) {
        showAlert('Failed to delete customer: ' + error.message, 'danger');
    }
};

const loadRecentLogs = async () => {
    try {
        const data = await apiCall('/customers/logs');
        AppState.logs = data.logs || [];
        renderRecentLogs();
    } catch (error) {
        console.error('Failed to load logs:', error);
        renderRecentLogs();
    }
};

// Rendering functions
const showAuthSection = () => {
    document.getElementById('authSection').classList.remove('d-none');
    document.getElementById('appSection').classList.add('d-none');
    document.getElementById('logoutBtn').classList.add('d-none');
};

const showAppSection = () => {
    document.getElementById('authSection').classList.add('d-none');
    document.getElementById('appSection').classList.remove('d-none');
    document.getElementById('logoutBtn').classList.remove('d-none');
};

const renderCustomers = () => {
    const container = document.getElementById('customersTable');
    
    if (AppState.customers.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-users fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No customers yet</h5>
                <p class="text-muted">Add your first customer to get started</p>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addCustomerModal">
                    <i class="fas fa-plus me-1"></i>
                    Add Customer
                </button>
            </div>
        `;
        return;
    }

    const customersHTML = AppState.customers.map(customer => {
        const balance = parseFloat(customer.balance);
        const balanceClass = balance <= 0 ? 'balance-negative' : 
                           balance < customer.hourly_debit_amount ? 'balance-low' : 'balance-positive';
        
        return `
            <div class="customer-row">
                <div class="row align-items-center">
                    <div class="col-md-4">
                        <h6 class="mb-1">${customer.name}</h6>
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>
                            ${customer.last_debited_at ? 
                              `Last debited: ${formatDateTime(customer.last_debited_at)}` : 
                              'Never debited'}
                        </small>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <div class="${balanceClass}">
                                ${formatCurrency(balance)}
                            </div>
                            <small class="text-muted">Current Balance</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <div class="text-warning fw-bold">
                                ${formatCurrency(customer.hourly_debit_amount)}
                            </div>
                            <small class="text-muted">Hourly Debit</small>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="text-end">
                            <button class="btn btn-danger btn-sm" onclick="deleteCustomer('${customer.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = customersHTML;
};

const updateStats = () => {
    const totalCustomers = AppState.customers.length;
    const totalBalance = AppState.customers.reduce((sum, customer) => sum + parseFloat(customer.balance), 0);
    const totalHourlyDebits = AppState.customers.reduce((sum, customer) => sum + parseFloat(customer.hourly_debit_amount), 0);

    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
    document.getElementById('totalHourlyDebits').textContent = formatCurrency(totalHourlyDebits);
};

const renderRecentLogs = () => {
    const container = document.getElementById('recentLogs');
    
    if (AppState.logs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-3">
                <small class="text-muted">No recent logs</small>
            </div>
        `;
        return;
    }

    const logsHTML = AppState.logs.slice(0, 10).map(log => {
        const customer = AppState.customers.find(c => c.id === log.customer_id);
        const customerName = customer ? customer.name : 'Unknown Customer';
        
        return `
            <div class="log-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="fw-bold">${customerName}</div>
                        <small class="text-muted">${formatDateTime(log.created_at)}</small>
                    </div>
                    <div class="text-end">
                        <div class="log-${log.status}">
                            <i class="fas fa-${log.status === 'success' ? 'check' : 'times'}-circle me-1"></i>
                            ${formatCurrency(log.amount)}
                        </div>
                        <small class="text-muted">${log.status}</small>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = logsHTML;
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (AppState.token) {
        showAppSection();
        loadCustomers();
    } else {
        showAuthSection();
    }

    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        login(email, password);
    });

    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'danger');
            return;
        }

        signup(email, password);
    });

    // Add customer form
    document.getElementById('addCustomerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('customerName').value;
        const initialBalance = parseFloat(document.getElementById('initialBalance').value);
        const hourlyDebitAmount = parseFloat(document.getElementById('hourlyDebitAmount').value);
        
        addCustomer(name, initialBalance, hourlyDebitAmount);
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Auto-refresh data every 30 seconds
    setInterval(() => {
        if (AppState.token && !document.getElementById('appSection').classList.contains('d-none')) {
            loadCustomers();
        }
    }, 30000);
});

// Trigger hourly debit processing
const triggerHourlyDebit = async () => {
    try {
        showAlert('Processing hourly debits...', 'info');
        
        const data = await apiCall('/debit-processor/trigger', {
            method: 'POST'
        });
        
        showAlert(`Debit processing completed! Successful: ${data.successful}, Failed: ${data.failed}`, 'success');
        
        // Refresh data
        loadCustomers();
        loadRecentLogs();
        
    } catch (error) {
        showAlert('Failed to process hourly debits: ' + error.message, 'danger');
    }
};

// Global functions for inline event handlers
window.deleteCustomer = deleteCustomer;
window.triggerHourlyDebit = triggerHourlyDebit;
