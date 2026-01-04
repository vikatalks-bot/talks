# Railway Deployment Fix Guide

## Common Issues and Solutions

### 1. Check Railway Logs
In Railway dashboard:
- Go to your service
- Click on "Deployments" tab
- Click on the failed deployment
- Check the "Logs" tab to see the exact error

### 2. Most Common Issues

#### Issue: Missing MONGODB_URI
**Solution:**
1. Go to Railway → Your Service → Variables
2. Add: `MONGODB_URI` with your MongoDB Atlas connection string
3. Format: `mongodb+srv://username:password@cluster.mongodb.net/vikasite?retryWrites=true&w=majority`

#### Issue: Port Configuration
**Solution:**
Railway automatically sets PORT. Make sure your code uses:
```javascript
const PORT = process.env.PORT || 3000;
```

#### Issue: Missing Dependencies
**Solution:**
All dependencies are in package.json. Railway should install them automatically.

### 3. Environment Variables Checklist

Make sure these are set in Railway:
- `MONGODB_URI` - MongoDB connection string (REQUIRED)
- `JWT_SECRET` - Random secret key (REQUIRED)
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `PAYPAL_CLIENT_ID` - Your PayPal client ID
- `PAYPAL_CLIENT_SECRET` - Your PayPal secret
- `PAYPAL_MODE` - `sandbox` or `live`
- `NODE_ENV` - `production`
- `PORT` - Railway sets this automatically

### 4. Testing Locally Before Deploy

```bash
# Test if server starts
npm start

# Check for syntax errors
node server/server.js
```

### 5. Common Error Messages

**"Cannot find module"**
- Missing dependency in package.json
- Run `npm install` locally to verify

**"MongoDB connection failed"**
- Check MONGODB_URI is set correctly
- Verify MongoDB Atlas IP whitelist includes Railway IPs (or use 0.0.0.0/0)

**"Port already in use"**
- Railway handles this automatically
- Don't hardcode port numbers

**"EADDRINUSE"**
- Railway manages ports
- Use `process.env.PORT`

### 6. Quick Fix Steps

1. **Check Logs** - See exact error in Railway
2. **Verify Environment Variables** - All required vars are set
3. **Test Health Endpoint** - Visit `/health` to see if server is running
4. **Check Database Connection** - Verify MONGODB_URI is correct
5. **Restart Deployment** - Click "Restart Deployment" in Railway

### 7. Health Check

After deployment, test:
- `https://your-app.railway.app/health` - Should return `{"status":"ok"}`

If health check works but other routes fail, it's likely a database or environment variable issue.

