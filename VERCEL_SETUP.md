# Vercel Production Setup Guide

## 🚨 Current Issue
The signup is returning "Internal server error" because Vercel KV (Redis database) is not configured in production.

## 🔒 Security-First Approach

Instead of disabling authentication protection entirely, we've implemented proper security measures:

### ✅ Security Measures Implemented:
- **Rate limiting**: 3 signup attempts per minute per IP
- **Input validation**: Email format, password strength, length limits
- **Request validation**: Content-Type, User-Agent checks
- **CORS handling**: Proper cross-origin request handling
- **Error handling**: No sensitive information leakage

## 🔧 Quick Fix Steps

### 1. Configure Vercel Authentication (Optional)

**If you want to keep Vercel authentication protection:**

1. **Go to your Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Configure Authentication Exclusions**
   - Go to **"Settings"** tab
   - Click on **"Security"** in the left sidebar
   - Find **"Authentication"** section
   - Configure to exclude these paths:
     - `/api/signup`
     - `/api/auth/*`
   - OR set custom rules to allow these endpoints

**If you prefer to disable Vercel authentication:**
- Disable "Require Authentication" for your project
- The API endpoints are now protected by our own security measures

### 2. Set up Vercel KV Database

1. **Go to your Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Create KV Database**
   - Click on **"Storage"** in the left sidebar
   - Click **"Create Database"**
   - Select **"KV"** (Redis)
   - Choose a name (e.g., `vibecoding-users`)
   - Select a region close to your users
   - Click **"Create"**

3. **Copy Connection Details**
   - After creation, click on your KV database
   - Go to **"Settings"** tab
   - Copy these values:
     - `KV_URL`
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

### 3. Configure Environment Variables

1. **In Vercel Dashboard**
   - Go to your project settings
   - Click **"Environment Variables"**
   - Add these variables:

```bash
# Required for authentication
NEXTAUTH_SECRET=your-strong-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Vercel KV Configuration
KV_URL=your-kv-url-from-step-3
KV_REST_API_URL=your-kv-rest-api-url-from-step-3
KV_REST_API_TOKEN=your-kv-rest-api-token-from-step-3
KV_REST_API_READ_ONLY_TOKEN=your-kv-read-only-token-from-step-3
```

2. **Generate a Strong Secret**
   ```bash
   # Option 1: Using OpenSSL
   openssl rand -base64 32
   
   # Option 2: Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 4. Redeploy Your Application

1. **Trigger a new deployment**
   - Push any change to your GitHub repository, OR
   - Go to Vercel Dashboard → Your Project → "Deployments" → "Redeploy"

2. **Verify the deployment**
   - Check that the build completes successfully
   - Test the signup functionality

## 🧪 Testing the Fix

1. **Try signing up** with a new email/password
2. **Check the response** - should be successful
3. **Try logging in** with the same credentials
4. **Verify data persistence** - user should remain logged in

## 🔍 Troubleshooting

### If you still get "Internal server error":

1. **Check Vercel Function Logs**
   - Go to Vercel Dashboard → Your Project → "Functions"
   - Click on the failed function
   - Check the logs for specific error messages

2. **Verify Environment Variables**
   - Ensure all KV variables are set correctly
   - Check that `NEXTAUTH_SECRET` is not the fallback value

3. **Test KV Connection**
   - The error should now be more specific about KV connection issues

### Common Issues:

- **"Vercel KV not configured"** → Set up KV database and environment variables
- **"Database connection failed"** → Check KV environment variables
- **"NEXTAUTH_SECRET must be set"** → Generate and set a strong secret
- **"401 Authentication Required"** → Configure Vercel authentication exclusions
- **"429 Too Many Requests"** → Rate limiting is working, wait and try again

## 🛡️ Security Features

### Rate Limiting
- **3 signup attempts per minute** per IP address
- **Automatic cleanup** of old rate limit data
- **Graceful degradation** if rate limiting fails

### Input Validation
- **Email format validation** with proper regex
- **Password strength requirements** (8+ chars, uppercase, lowercase, number)
- **Input length limits** (email: 254 chars, password: 128 chars)
- **Type checking** for all inputs

### Request Validation
- **Content-Type validation** (must be application/json)
- **User-Agent validation** (basic bot protection)
- **CORS handling** for cross-origin requests

## 📊 Monitoring

After setup, monitor:
- **KV database usage** in Vercel Dashboard
- **Function execution times** for auth operations
- **Error rates** in Vercel Analytics
- **Rate limiting effectiveness**

## 💰 Cost Considerations

- **Vercel KV**: Free tier includes 100MB storage and 100 requests/day
- **For production apps**: Consider upgrading to Pro plan for more capacity

---

**Need help?** Check the Vercel KV documentation: [vercel.com/docs/storage/vercel-kv](https://vercel.com/docs/storage/vercel-kv) 