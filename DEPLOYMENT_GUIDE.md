# 🚀 Portfolio Deployment Guide
## Netlify (Frontend) + Railway (Backend)

This guide will help you deploy your portfolio website using Netlify for the React frontend and Railway for the Node.js backend.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **Railway Account** - Sign up at [railway.app](https://railway.app)

---

## 🚂 Step 1: Deploy Backend to Railway

### 1.1 Prepare Your Repository
Make sure your code is pushed to GitHub with the latest changes.

### 1.2 Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `portfolio-builder` repository
5. Railway will auto-detect it's a Node.js project

### 1.3 Configure Environment Variables
In Railway dashboard, go to **Variables** tab and add:

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-netlify-app.netlify.app
OWNER_SECRET_KEY=your-strong-secret-key-here
GITHUB_URL=https://github.com/blanchardsw
LINKEDIN_URL=https://www.linkedin.com/in/stephenblanchard2/
```

### 1.4 Set Root Directory
In Railway dashboard:
1. Go to **Settings** tab
2. Set **Root Directory** to: `portfolio-backend`
3. Set **Start Command** to: `npm start`
4. Set **Build Command** to: `npm run build`

### 1.5 Get Your Railway URL
After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

**Save this URL - you'll need it for the frontend!**

---

## 🌐 Step 2: Deploy Frontend to Netlify

### 2.1 Build Your Frontend
1. Open terminal in `portfolio-frontend` directory
2. Run: `npm run build`
3. This creates a `build` folder with your production files

### 2.2 Deploy to Netlify
**Option A: Drag & Drop (Quick)**
1. Go to [netlify.com](https://netlify.com) and sign in
2. Drag the `build` folder to the deploy area
3. Your site will be deployed instantly!

**Option B: Git Integration (Recommended)**
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"New site from Git"**
3. Choose **GitHub** and select your repository
4. Set **Base directory** to: `portfolio-frontend`
5. Set **Build command** to: `npm run build`
6. Set **Publish directory** to: `build`

### 2.3 Configure Environment Variables
In Netlify dashboard, go to **Site settings** > **Environment variables** and add:

```bash
REACT_APP_API_URL=https://your-railway-app.railway.app
GENERATE_SOURCEMAP=false
CI=false
```

**Replace `your-railway-app.railway.app` with your actual Railway URL!**

### 2.4 Update Railway CORS
Go back to Railway and update the `FRONTEND_URL` environment variable:
```bash
FRONTEND_URL=https://your-netlify-app.netlify.app
```

---

## ✅ Step 3: Test Your Deployment

### 3.1 Test Public Access
1. Visit your Netlify URL
2. Verify your portfolio loads correctly
3. Check that all sections display properly

### 3.2 Test Owner Access
1. Visit: `https://your-netlify-app.netlify.app?key=your-secret-key`
2. Verify the floating upload button appears
3. Test uploading a resume file

### 3.3 Test API Connectivity
1. Open browser developer tools (F12)
2. Check Network tab for any API errors
3. Verify data loads from Railway backend

---

## 🔧 Troubleshooting

### Common Issues:

**Frontend shows "No portfolio data found"**
- Check that Railway backend is running
- Verify CORS settings in Railway
- Check environment variables in both platforms

**Upload button doesn't appear with secret key**
- Verify `REACT_APP_API_URL` in Netlify
- Check Railway auth endpoint is working
- Confirm secret key matches in Railway env vars

**API calls failing**
- Check Network tab in browser dev tools
- Verify Railway URL is correct in Netlify env vars
- Ensure Railway backend is deployed and running

---

## 🎯 Final Steps

### 1. Custom Domain (Optional)
- In Netlify: **Domain settings** > **Add custom domain**
- Update Railway `FRONTEND_URL` to your custom domain

### 2. SSL Certificate
- Netlify provides free SSL automatically
- Railway provides free SSL automatically

### 3. Monitoring
- Railway provides logs and metrics
- Netlify provides deploy logs and analytics

---

## 📱 Your Live Portfolio URLs

After deployment, you'll have:

**Public Portfolio:** `https://your-netlify-app.netlify.app`
**Owner Access:** `https://your-netlify-app.netlify.app?key=your-secret-key`
**Backend API:** `https://your-railway-app.railway.app`

---

## 🔐 Security Notes

1. **Change your secret key** from the default in production
2. **Keep environment variables secure** - never commit them to Git
3. **Use HTTPS only** - both platforms provide this automatically
4. **Monitor access logs** in Railway dashboard

---

## 🎉 Congratulations!

Your portfolio is now live and accessible to the world! You can:
- Share the public URL with employers and clients
- Update your resume anytime using the owner access
- Monitor performance and usage through the platform dashboards

Need help? Check the platform documentation:
- [Netlify Docs](https://docs.netlify.com/)
- [Railway Docs](https://docs.railway.app/)
