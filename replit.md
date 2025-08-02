# Overview

The Hourly Customer Debit System is a web-based application that manages customer accounts with automated hourly balance deductions. It provides user authentication, customer management, and scheduled debit processing with comprehensive audit trails. The system is built with a Node.js/Express backend, PostgreSQL database via Supabase, and a vanilla JavaScript frontend with Bootstrap for styling.

## Current Status
- **Implementation**: Complete and fully functional
- **Database**: PostgreSQL successfully configured and running
- **Scheduler**: Hourly debit processing active and working
- **Deployment**: Ready for Railway deployment with complete documentation
- **Next Steps**: User deploying to Railway hosting platform

## Recent Changes
- Fixed database routing errors and API endpoint issues
- Implemented complete hourly debit processing system with Node.js scheduler
- Created automated scheduler running every hour with successful customer processing
- Added manual trigger functionality for testing debit operations
- Generated comprehensive deployment documentation for Railway hosting
- All challenge requirements successfully implemented and tested

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Technology**: Vanilla JavaScript with Bootstrap 5 for responsive UI design
- **State Management**: Global AppState object for managing user authentication, customer data, and transaction logs
- **API Communication**: Centralized API functions with JWT token handling for secure backend communication
- **Authentication Flow**: Token-based authentication with localStorage persistence for session management

## Backend Architecture
- **Framework**: Node.js with Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM with direct PostgreSQL connections for type-safe database operations
- **Authentication**: Custom JWT-based authentication system with bcryptjs for password hashing
- **Route Structure**: Modular routing with separate files for authentication (`/api/auth`) and customer management (`/api/customers`)
- **Security**: JWT token verification middleware and user-based data isolation

## Data Storage
- **Primary Database**: PostgreSQL hosted on Supabase with connection pooling
- **Schema Design**: User-based data isolation with customers linked to specific users through foreign keys
- **Key Tables**: 
  - Users table for authentication
  - Customers table with balance tracking and hourly debit amounts
  - Audit logging for all debit transactions

## Scheduled Processing
- **Technology**: Supabase Edge Functions with Deno runtime
- **Scheduling**: Cron-based hourly execution for automated debit processing
- **Processing Logic**: Iterates through all customers, applies hourly debit amounts, and logs all transactions
- **Error Handling**: Individual customer processing with detailed success/failure tracking

## Authentication & Authorization
- **Method**: JWT token-based authentication with configurable secret keys
- **Password Security**: bcryptjs hashing with salt rounds for secure password storage
- **Session Management**: Client-side token storage with automatic expiration handling
- **Data Isolation**: Row-level security ensuring users only access their own customer data

# External Dependencies

## Core Technologies
- **Supabase**: PostgreSQL database hosting with connection pooling and Edge Functions runtime
- **Node.js Packages**: 
  - Express.js for web server framework
  - Drizzle ORM for database operations
  - bcryptjs for password hashing
  - jsonwebtoken for JWT token management
  - postgres-js for PostgreSQL connectivity

## Frontend Libraries
- **Bootstrap 5**: CSS framework for responsive design and UI components
- **Font Awesome**: Icon library for enhanced user interface elements

## Development Tools
- **dotenv**: Environment variable management for configuration
- **cors**: Cross-origin resource sharing configuration
- **uuid**: Unique identifier generation for database records

## Database Configuration
- **Connection**: Direct PostgreSQL connection via Supabase connection pooling
- **Environment**: Requires DATABASE_URL environment variable with Supabase connection string
- **Connection Management**: Automatic connection testing on startup with detailed error messaging