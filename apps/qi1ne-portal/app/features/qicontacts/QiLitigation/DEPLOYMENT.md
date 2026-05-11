# Deployment Guide

## 🚀 Serverless Deployment with Supabase + Cloudflare Pages

This guide will help you deploy your litigation management system using a modern serverless architecture.

### Architecture Overview

- **Frontend**: React app hosted on **Cloudflare Pages** (static site)
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for documents)
- **API**: Supabase Edge Functions (serverless)

> **Note:** You can also use **Railway** or **Vercel** if you prefer, but Cloudflare Pages is recommended for its performance and generous free tier for static sites.

## Step 1: Set up Supabase

1. **Create a Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and create project

2. **Set up the database**:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the SQL to create all tables and policies

3. **Configure Authentication**:
   - Go to Authentication > Settings
   - Enable email authentication
   - Set up your site URL (will be your Cloudflare URL)
   - Configure email templates if needed

4. **Get your credentials**:
   - Go to Settings > API
   - Copy your Project URL and anon/public key
   - Save these for the next step

## Step 2: Prepare for Cloudflare Config

Since this is a Single Page Application (SPA) using client-side routing, we need to tell Cloudflare to redirect all requests to `index.html`.

1. **Create a `_redirects` file**:
   - Create a new file named `_redirects` inside your `public/` folder.
   - Add the following line to it:

     ```text
     /* /index.html 200
     ```

## Step 3: Deploy to Cloudflare Pages

1. **Connect GitHub to Cloudflare**:
   - Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Pages**.
   - Click **Connect to Git**.
   - Select your repository: `litigation-management-system`.

2. **Configure the deployment**:
   - **Project Name**: `litigation-management-system`
   - **Production Branch**: `main`
   - **Framework Preset**: `Create React App`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `build`

3. **Set Environment Variables**:
   Under **Environment variables (advanced)**, add:

   ```text
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   REACT_APP_ENVIRONMENT=production
   ```

4. **Deploy**:
   - Click **Save and Deploy**.
   - Cloudflare will build and deploy your app.
   - You'll get a URL like `https://litigation-management-system.pages.dev`.

## Step 4: Configure Supabase for Production

1. **Update Site URL**:
   - Go back to Supabase > Authentication > Settings
   - Set Site URL to your Cloudflare Pages URL
   - Add your Cloudflare URL to Redirect URLs (e.g., `https://litigation-management-system.pages.dev/**`)

2. **Set up Row Level Security**:
   - The schema already includes RLS policies
   - Test that users can only see their own data

## Step 5: Create Demo Users (Optional)

If you want to create real Supabase users instead of using demo accounts:

1. Go to Supabase > Authentication > Users
2. Create users with these emails:
   - `admin@lawfirm.com`
   - `attorney@lawfirm.com`
   - `paralegal@lawfirm.com`

3. After creating users, insert their profiles:

```sql
INSERT INTO profiles (id, email, first_name, last_name, role, law_firm_id, law_firm_name)
VALUES 
  ('user-id-from-auth', 'admin@lawfirm.com', 'Robert', 'Blake', 'admin', '550e8400-e29b-41d4-a716-446655440000', 'Blake & Associates');
```

## Step 6: Test Your Deployment

1. Visit your Cloudflare Pages URL
2. Try logging in with demo accounts:
   - `master@unfy.com` / `EMunfy2025`
   - `admin@lawfirm.com` / `admin123`
3. Test creating cases, tasks, and calendar events
4. Verify data persists in Supabase

## 🔧 Advanced Configuration

### Custom Domain

1. In Cloudflare Pages dashboard, go to **Custom Domains**.
2. Add your custom domain (Cloudflare manages SSL automatically).
3. Update Supabase Site URL to match.

### Email Configuration

1. In Supabase > Authentication > Settings
2. Configure SMTP settings for production emails
3. Customize email templates

### File Storage

1. Enable Supabase Storage
2. Create buckets for document uploads
3. Set up storage policies

## 📊 Monitoring & Analytics

### Supabase Dashboard

- Monitor database performance
- View real-time user activity
- Check API usage

### Cloudflare Dashboard

- Monitor deployment status
- View build logs
- Web Analytics (built-in)

## 🔒 Security Checklist

- ✅ Row Level Security enabled
- ✅ Environment variables secured
- ✅ HTTPS enforced
- ✅ Authentication required
- ✅ Role-based access control

## 💰 Cost Estimation

### Supabase (Free tier includes)

- 500MB database
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users

### Cloudflare Pages (Free tier includes)

- Unlimited sites
- Unlimited bandwidth
- Global CDN
- 500 builds per month

**Total monthly cost**: $0 for most small-to-medium use cases.

## 🚀 Going Live

1. Update DNS to point to your Cloudflare URL (if using custom domain)
2. Test all functionality in production
3. Set up monitoring and backups
4. Train users on the new system

Your litigation management system is now live on the edge! 🎉
