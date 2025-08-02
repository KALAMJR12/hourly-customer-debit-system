# Deployment Guide: GitHub + External Hosting

This guide walks you through deploying the Hourly Customer Debit System using GitHub and external hosting providers.

## Prerequisites

- Git installed on your local machine
- GitHub account
- Hosting provider account (Heroku, Railway, DigitalOcean, AWS, etc.)
- PostgreSQL database (can be from hosting provider or separate service)

## Step 1: Prepare Your Code for GitHub

### 1.1 Create .gitignore File
```bash
# Create .gitignore to exclude sensitive files
cat > .gitignore << EOF
node_modules/
.env
.env.local
.env.production
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
*.log
EOF
```

### 1.2 Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Hourly Customer Debit System"
```

## Step 2: Create GitHub Repository

### 2.1 On GitHub.com:
1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in top right corner
3. Select "New repository"
4. Repository name: `hourly-customer-debit-system`
5. Description: `A complete backend system for managing customer accounts with automated hourly balance deductions`
6. Set to **Public** (for challenge submission)
7. Don't initialize with README (you already have one)
8. Click "Create repository"

### 2.2 Push Your Code to GitHub:
```bash
# Add GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/hourly-customer-debit-system.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Choose Your Hosting Provider

### Option A: Railway (Recommended - Easy and Free Tier)

#### 3.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Click "Deploy from GitHub repo"
4. Select your `hourly-customer-debit-system` repository

#### 3.2 Configure Railway Deployment
1. Railway will automatically detect it's a Node.js app
2. Go to your project dashboard
3. Click on "Settings" tab
4. Under "Environment Variables", add:
   ```
   DATABASE_URL=your-postgresql-connection-string
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

#### 3.3 Add PostgreSQL Database
1. In Railway dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL instance
4. Copy the connection string from the PostgreSQL service
5. Update your `DATABASE_URL` environment variable

#### 3.4 Deploy
1. Railway automatically deploys on git push
2. Your app will be available at: `https://your-app-name.railway.app`

### Option B: Heroku

#### 3.1 Install Heroku CLI
```bash
# Install Heroku CLI (varies by OS)
# For macOS: brew tap heroku/brew && brew install heroku
# For Windows: Download from heroku.com/dev-center
```

#### 3.2 Login and Create App
```bash
heroku login
heroku create your-app-name
```

#### 3.3 Add PostgreSQL Database
```bash
heroku addons:create heroku-postgresql:essential-0
```

#### 3.4 Set Environment Variables
```bash
heroku config:set JWT_SECRET=your-super-secret-key-here
# DATABASE_URL is automatically set by the PostgreSQL addon
```

#### 3.5 Deploy
```bash
git push heroku main
```

### Option C: DigitalOcean App Platform

#### 3.1 Create DigitalOcean Account
1. Go to [digitalocean.com](https://digitalocean.com)
2. Sign up and verify account

#### 3.2 Create App
1. Go to "Apps" in the control panel
2. Click "Create App"
3. Connect your GitHub repository
4. Select `hourly-customer-debit-system`

#### 3.3 Configure App Settings
1. **Build Command**: `npm install`
2. **Run Command**: `npm start`
3. **Environment Variables**:
   ```
   DATABASE_URL=your-postgresql-connection-string
   JWT_SECRET=your-secret-key
   PORT=8080
   ```

#### 3.4 Add Database
1. Add a "Database" component
2. Choose PostgreSQL
3. Copy connection string to `DATABASE_URL`

## Step 4: Database Setup on External Hosting

### Option A: Use Hosting Provider's Database
Most hosting providers offer PostgreSQL as an addon:
- **Railway**: Built-in PostgreSQL service
- **Heroku**: `heroku-postgresql` addon
- **DigitalOcean**: Managed Database service

### Option B: External Database Service

#### Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for provisioning (2-3 minutes)
4. Go to Settings → Database
5. Copy "Connection string" (use Transaction pooler)
6. Replace `[YOUR-PASSWORD]` with your database password
7. Use this as your `DATABASE_URL`

#### Alternative: ElephantSQL
1. Go to [elephantsql.com](https://elephantsql.com)
2. Create free account
3. Create new instance (Tiny Turtle - Free)
4. Copy the connection string
5. Use as `DATABASE_URL`

## Step 5: Environment Variables Configuration

### Required Environment Variables:
```bash
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

### Setting Environment Variables by Platform:

#### Railway:
- Go to project → Variables tab
- Add each variable manually

#### Heroku:
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set DATABASE_URL=your-database-url
```

#### DigitalOcean:
- In App settings → Environment Variables section
- Add each variable

## Step 6: Verify Deployment

### 6.1 Check Application Status
1. Visit your deployed URL
2. Verify the web interface loads
3. Check browser console for errors
4. Look for "Server running on..." message in logs

### 6.2 Test API Endpoints
```bash
# Replace YOUR_DOMAIN with your actual domain
curl https://YOUR_DOMAIN.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 6.3 Verify Hourly Scheduler
1. Check application logs for scheduler messages:
   - "🕐 Starting hourly debit scheduler..."
   - "✅ Hourly debit scheduler started successfully"
2. Create test customers via the web interface
3. Wait for next hour cycle or check logs for processing

## Step 7: Production Considerations

### 7.1 Environment Security
- Use strong, unique JWT_SECRET (32+ characters)
- Ensure DATABASE_URL uses SSL connections
- Never commit `.env` files to Git

### 7.2 Database Backup
- Set up automated backups on your database provider
- Test backup restoration process

### 7.3 Monitoring
- Set up application monitoring (many hosts provide this)
- Monitor hourly scheduler execution
- Set up alerts for application errors

### 7.4 Scaling Considerations
- Most free tiers handle light usage well
- Monitor database connection limits
- Consider connection pooling for high traffic

## Step 8: Update GitHub Repository

### 8.1 Add Deployment Documentation
Update your README.md with live deployment link:

```markdown
## Live Demo
🚀 **Live Application**: https://your-app-name.railway.app

## API Base URL
```
https://your-app-name.railway.app/api
```
```

### 8.2 Push Final Updates
```bash
git add .
git commit -m "Add deployment configuration and live demo link"
git push origin main
```

## Common Issues and Solutions

### Issue: "Database connection failed"
**Solution**: Verify DATABASE_URL format and credentials

### Issue: "Port already in use"
**Solution**: Most hosting platforms set PORT automatically, ensure your app uses `process.env.PORT`

### Issue: "Scheduler not starting"
**Solution**: Check application logs and ensure server starts completely before scheduler initializes

### Issue: "Build failed"
**Solution**: Ensure package.json has correct start script: `"start": "node server.js"`

## Support and Troubleshooting

### Railway:
- Check "Deployments" tab for build logs
- Use "Logs" tab for runtime logs

### Heroku:
```bash
heroku logs --tail --app your-app-name
```

### DigitalOcean:
- Check "Runtime Logs" in app dashboard
- Use "Console" tab for direct access

Your application should now be successfully deployed and accessible via your chosen hosting platform's provided URL.