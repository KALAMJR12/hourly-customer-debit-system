# API Testing Examples

This document provides curl examples and Postman collection for testing the Hourly Customer Debit System API.

## Authentication Flow

### 1. Create Account
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "securepassword123"
  }'
```

**Expected Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid-here",
    "email": "testuser@example.com"
  },
  "token": "jwt-token-here"
}
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com", 
    "password": "securepassword123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid-here",
    "email": "testuser@example.com"
  }
}
```

## Customer Management

*Note: Replace `YOUR_JWT_TOKEN` with the token from login response*

### 3. Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "balance": 250.00,
    "hourly_debit_amount": 15.50
  }'
```

**Expected Response:**
```json
{
  "message": "Customer created successfully",
  "customer": {
    "id": "customer-uuid-here",
    "name": "John Doe",
    "balance": "250.00",
    "hourly_debit_amount": "15.50",
    "last_debited_at": null,
    "created_at": "2025-08-01T20:00:00.000Z"
  }
}
```

### 4. List All Customers
```bash
curl -X GET http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "customers": [
    {
      "id": "customer-uuid-here",
      "name": "John Doe", 
      "balance": "250.00",
      "hourly_debit_amount": "15.50",
      "last_debited_at": null,
      "created_at": "2025-08-01T20:00:00.000Z"
    }
  ]
}
```

### 5. Get Specific Customer
```bash
curl -X GET http://localhost:5000/api/customers/CUSTOMER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Update Customer
```bash
curl -X PUT http://localhost:5000/api/customers/CUSTOMER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Smith",
    "balance": 300.00,
    "hourly_debit_amount": 20.00
  }'
```

### 7. Delete Customer
```bash
curl -X DELETE http://localhost:5000/api/customers/CUSTOMER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Debit Processing

### 8. Trigger Manual Debit Processing
```bash
curl -X POST http://localhost:5000/api/debit-processor/trigger \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Hourly debit process completed",
  "timestamp": "2025-08-01T20:05:00.000Z",
  "total_customers": 1,
  "successful": 1,
  "failed": 0,
  "results": [
    {
      "customer_id": "customer-uuid-here",
      "customer_name": "John Doe",
      "status": "success",
      "amount": 15.50,
      "balance_before": 250.00,
      "balance_after": 234.50
    }
  ]
}
```

### 9. Get Processing Status
```bash
curl -X GET http://localhost:5000/api/debit-processor/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 10. Get Transaction Logs
```bash
curl -X GET http://localhost:5000/api/customers/logs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "logs": [
    {
      "id": "log-uuid-here",
      "customer_id": "customer-uuid-here",
      "customer_name": "John Doe",
      "status": "success",
      "amount": "15.50",
      "balance_before": "250.00", 
      "balance_after": "234.50",
      "error_message": null,
      "created_at": "2025-08-01T20:05:00.000Z"
    }
  ]
}
```

## Error Scenarios

### Insufficient Balance
When a customer doesn't have enough balance for the hourly debit:

```json
{
  "customer_id": "customer-uuid-here",
  "customer_name": "John Doe",
  "status": "failed",
  "amount": 15.50,
  "balance_before": 5.00,
  "balance_after": 5.00,
  "error_message": "Insufficient balance"
}
```

### Authentication Required
```json
{
  "error": "Access token required"
}
```

### Invalid Credentials
```json
{
  "error": "Invalid email or password"
}
```

## Postman Collection
You can import these endpoints into Postman:
1. Create a new collection called "Hourly Customer Debit System"
2. Add the base URL: `http://localhost:5000`
3. Set up environment variables:
   - `base_url`: `http://localhost:5000`
   - `jwt_token`: (set after login)
4. Add all the endpoints above with the appropriate headers

## Testing Workflow
1. Sign up or login to get JWT token
2. Create 2-3 customers with different balance amounts
3. Trigger manual debit processing to see immediate results
4. Check transaction logs to verify audit trail
5. Wait for automatic hourly processing (or restart server to trigger)
6. Verify balances have been updated correctly