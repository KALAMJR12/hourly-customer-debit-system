# Complete Railway Deployment Checklist

## What You Need to Do

### Step 1: Download Your Project from Replit (5 minutes)

1. **In your Replit project:**
   - Click the three dots menu (⋮) in the file panel
   - Select "Download as zip"
   - Save the zip file to your computer
   - Extract the zip file to a folder

### Step 2: Clean Up Files (2 minutes)

1. **Delete these files/folders from your extracted project:**
   - `.replit` file
   - `replit.nix` file  
   - `node_modules/` folder (if present)
   - Any `.env` files

2. **Keep these important files:**
   - `server.js`
   - `package.json`
   - `api/` folder (with auth.js, customers.js, debit-processor.js)
   - `config/` folder (with database.js)
   - `database/` folder (with schema.sql, rls-policies.sql)
   - `scheduler.js`
   - `index.html`
   - `app.js`
   - `styles.css`
   - `README.md`
   - `API_EXAMPLES.md`
   - `RAILWAY_DEPLOYMENT.md`
   - `.gitignore`

### Step 3: Create GitHub Repository (5 minutes)

1. **Go to GitHub.com and sign in**
2. **Click "New" repository button**
3. **Repository settings:**
   - Name: `hourly-customer-debit-system`
   - Description: `Complete backend system for automated hourly customer debits`
   - Set to Public
   - Do NOT initialize with README, .gitignore, or license
4. **Click "Create repository"**

### Step 4: Upload Files to GitHub (3 minutes)

1. **On your new repository page, click "uploading an existing file"**
2. **Drag and drop all your project files** (or use "choose your files")
3. **Make sure to upload:**
   - All .js files
   - All .html, .css, .md files
   - The api/, config/, database/ folders with their contents
   - package.json and .gitignore
4. **Commit message:** "Initial commit: Hourly Customer Debit System"
5. **Click "Commit changes"**

### Step 5: Deploy to Railway (10 minutes)

1. **Go to railway.app and sign up with GitHub**
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your `hourly-customer-debit-system` repository**
5. **Click "Deploy Now"**

**Railway will automatically:**
- Detect Node.js application
- Run `npm install`
- Start with `npm start`

### Step 6: Add PostgreSQL Database (2 minutes)

1. **In Railway project dashboard, click "New Service"**
2. **Select "Database" → "PostgreSQL"**
3. **Wait for database to deploy (1-2 minutes)**

### Step 7: Configure Environment Variables (3 minutes)

1. **Click on your app service (not the database)**
2. **Go to "Variables" tab**
3. **Add these variables:**

**JWT_SECRET:**
```
your-super-secure-jwt-secret-key-change-this-in-production-min-32-chars
```

**DATABASE_URL:**
- Click on PostgreSQL service
- Go to "Connect" tab  
- Copy "Database URL"
- Go back to app service → Variables
- Add DATABASE_URL with copied value

### Step 8: Verify Deployment (5 minutes)

1. **Check "Deployments" tab for SUCCESS status**
2. **Look for these messages in logs:**
   ```
   Server running on http://0.0.0.0:5000
   ✅ Database connection successful
   🕐 Starting hourly debit scheduler...
   ✅ Hourly debit scheduler started successfully
   ```
3. **Get your app URL from Settings → Domains**
4. **Test your application:**
   - Sign up for account
   - Add test customer
   - Click "Trigger Debit" button
   - Verify everything works

## Your Files Are Ready

✅ All necessary files are prepared in your Replit project
✅ .gitignore created to exclude unnecessary files
✅ Complete documentation provided
✅ App is fully functional and tested

## What's Working

✅ User authentication (signup/login)
✅ Customer management (CRUD operations)
✅ Hourly debit processing (automated scheduler)
✅ Database schema (auto-created tables)
✅ Transaction logging (audit trail)
✅ Web interface (responsive design)

## Support

If you encounter any issues during deployment:
1. Check Railway logs for error messages
2. Verify environment variables are set correctly
3. Ensure DATABASE_URL is copied exactly from PostgreSQL service
4. Wait 2-3 minutes after deployment for scheduler to start

Your application will be live at: `https://your-app-name.up.railway.app`