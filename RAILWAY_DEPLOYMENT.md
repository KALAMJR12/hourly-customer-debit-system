# Railway Deployment Guide

Complete step-by-step instructions for deploying your Hourly Customer Debit System to Railway.

## Step 1: Prepare Code for GitHub (5 minutes)

### 1.1 Create .gitignore
```bash
# In your Replit terminal, create .gitignore
cat > .gitignore << 'EOF'
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

### 1.2 Initialize Git and Commit
```bash
# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Hourly Customer Debit System"
```

## Step 2: Create GitHub Repository (3 minutes)

### 2.1 On GitHub.com:
1. Go to [github.com](https://github.com) and sign in
2. Click the green "New" button or "+" icon → "New repository"
3. Repository settings:
   - **Repository name**: `hourly-customer-debit-system`
   - **Description**: `Complete backend system for automated hourly customer debits`
   - **Visibility**: Public (for challenge submission)
   - **Do NOT** initialize with README, .gitignore, or license (you already have these)
4. Click "Create repository"

### 2.2 Push Code to GitHub
```bash
# Add GitHub as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/hourly-customer-debit-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Railway (10 minutes)

### 3.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub account
4. Complete account setup

### 3.2 Deploy Your App
1. On Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `hourly-customer-debit-system` repository
4. Click "Deploy Now"

Railway will automatically:
- Detect it's a Node.js application
- Run `npm install`
- Start with `npm start` command

### 3.3 Add PostgreSQL Database
1. In your Railway project dashboard, click "New Service"
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway creates a PostgreSQL instance automatically
5. Wait for deployment (usually 1-2 minutes)

### 3.4 Configure Environment Variables
1. Click on your main service (the Node.js app, not the database)
2. Go to "Variables" tab
3. Add these variables:

**JWT_SECRET**
```
your-super-secure-jwt-secret-key-change-this-in-production-min-32-chars
```

**DATABASE_URL** (get this from PostgreSQL service)
1. Click on the PostgreSQL service in your project
2. Go to "Connect" tab
3. Copy the "Database URL" (starts with `postgresql://`)
4. Go back to your app service → Variables tab
5. Add `DATABASE_URL` with the copied value

**PORT** (optional, Railway sets this automatically)
```
5000
```

## Step 4: Verify Deployment (5 minutes)

### 4.1 Check Application Status
1. In your app service, go to "Deployments" tab
2. Wait for deployment to show "SUCCESS"
3. Click on the deployment to see logs
4. Look for these success messages:
   ```
   Server running on http://0.0.0.0:5000
   ✅ Database connection successful
   🕐 Starting hourly debit scheduler...
   ✅ Hourly debit scheduler started successfully
   ```

### 4.2 Get Your App URL
1. In your app service, go to "Settings" tab
2. Under "Domains", you'll see your app URL like:
   `https://hourly-customer-debit-system-production.up.railway.app`
3. Click the link to test your application

### 4.3 Test the Application
1. Open your Railway app URL
2. Sign up for a new account
3. Add a test customer
4. Click "Trigger Debit" to test manual processing
5. Check that everything works correctly

## Step 5: Monitor and Verify (3 minutes)

### 5.1 Check Logs
1. Go to your app service in Railway
2. Click "Logs" tab
3. Verify you see hourly debit processing logs
4. Should show successful customer processing

### 5.2 Database Verification
1. Click on PostgreSQL service
2. Go to "Data" tab
3. You should see tables: `users`, `customers`, `debit_logs`
4. Check that data is being created properly

## Step 6: Update Documentation (2 minutes)

### 6.1 Add Live Demo Link to README
Update your README.md with the Railway URL:

```bash
# Edit README.md and add this after the title
echo "
🚀 **Live Demo**: https://your-app-name.up.railway.app

" >> README.md

# Commit and push changes
git add README.md
git commit -m "Add live demo link"
git push origin main
```

## Railway Specific Benefits

### Free Tier Includes:
- **$5 monthly credit** (usually covers small apps completely)
- **Automatic HTTPS** for your domain
- **Automatic deployments** on git push
- **Built-in PostgreSQL** database
- **Easy environment variable management**
- **Real-time logs and monitoring**

### Automatic Features:
- **Zero-downtime deployments**
- **Automatic restarts** if app crashes
- **Health monitoring** 
- **Custom domains** (if needed later)

## Troubleshooting Common Issues

### Issue: Build Failed
**Solution**: Check "Deployments" tab for error details. Usually npm install issues.

### Issue: Database Connection Error
**Solution**: Verify DATABASE_URL is correctly copied from PostgreSQL service.

### Issue: App Not Starting
**Solution**: Ensure package.json has correct start script: `"start": "node server.js"`

### Issue: Scheduler Not Running
**Solution**: Check logs for scheduler startup messages. May need to wait 2-3 minutes after deployment.

## Your Final Checklist

- ✅ Code pushed to GitHub repository
- ✅ Railway project created and deployed
- ✅ PostgreSQL database added and connected
- ✅ Environment variables configured
- ✅ Application accessible via Railway URL
- ✅ Hourly scheduler running successfully
- ✅ All features working (auth, customers, debits)
- ✅ Live demo link added to README

## Next Steps

1. **Share your GitHub repository** link for challenge submission
2. **Include your Railway live demo URL** in submission
3. **Monitor the application** to ensure hourly processing continues working
4. **Scale up if needed** - Railway makes it easy to upgrade resources

Your application is now live and fully functional on Railway with automated hourly debit processing!