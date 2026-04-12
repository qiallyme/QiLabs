# QiHabitSync - Couple Habit Tracking Application

A mobile-friendly, single-file habit tracking application designed for couples to monitor health metrics, lifestyle habits, and wellness data together.

## Architecture

- **Backend:** Supabase (PostgreSQL database)
- **Frontend:** HTML/JS with Vue.js 3 + Tailwind CSS (via CDN)
- **Visualization:** Chart.js
- **Deployment:** Cloudflare Pages (single file deployment)

## Features

- **Dual User Support:** Track data for Partner A and Partner B separately
- **Health Metrics:** Blood pressure, heart rate, sleep hours
- **Lifestyle Tracking:** Water intake, exercise, alcohol, stimulants
- **Mood Tracking:** 1-5 scale rating system
- **Intimacy Logging:** Boolean tracking for intercourse
- **Medication Tracking:** Boolean flag for medications taken
- **Food Notes:** Free-text field for dietary notes
- **Data Visualization:** Charts for mood/energy trends and blood pressure over time
- **Mobile Optimized:** Touch-friendly interface with responsive design

## Setup Instructions

### Step 1: Supabase Database Setup

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new Project
3. Go to **SQL Editor** (left sidebar)
4. Run the SQL from `supabase_setup.sql` to create the `habit_logs` table
5. Go to **Project Settings > API**
6. Copy your **Project URL** and **anon/public Key**

### Step 2: Configure the Application

1. Open `index.html`
2. Find these lines near the top of the `<script>` section:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';
   ```
3. Replace `YOUR_SUPABASE_URL` with your Supabase Project URL
4. Replace `YOUR_SUPABASE_KEY` with your Supabase anon/public Key

### Step 3: Deploy to Cloudflare Pages

**Option A: Drag and Drop (Easiest)**

1. Create a folder on your desktop named `habit-tracker`
2. Place the `index.html` file inside that folder
3. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
4. Go to **Workers & Pages > Create Application > Pages > Upload Assets**
5. Drag and drop your `habit-tracker` folder into the upload area
6. Click **Deploy**

**Option B: Git Integration**

1. Push this project to a Git repository
2. In Cloudflare Pages, connect your repository
3. Set build command to: (none - static site)
4. Set output directory to: `/` (root)
5. Deploy

### Step 4: Mobile Access

1. Open the Cloudflare Pages URL on your phone
2. Add to home screen for quick access
3. Both partners can use the same URL and switch between "Partner A" and "Partner B" using the dropdown

## Security Considerations

**Current Setup:** The SQL policy allows public read/write access using the anon key. This is fine for:
- Private links shared only between the couple
- Development/testing

**For Production:** Consider implementing:
- Row Level Security (RLS) with user authentication
- Separate API keys per user
- Authentication via Supabase Auth

To implement secure RLS, you would:
1. Enable Supabase Auth
2. Create user accounts for each partner
3. Modify the RLS policy to restrict access based on authenticated user
4. Update the frontend to use authenticated Supabase client

## Future Enhancements

1. **Correlation Analysis:** Identify patterns (e.g., "Does BP spike after alcohol?")
2. **Cycle Tracking:** Menstrual cycle phase tracking for contextual insights
3. **Gamification:** Streak counters for habit goals
4. **Export:** CSV export for medical appointments
5. **Notifications:** Daily reminders to log data
6. **Partner View:** Option to view both partners' data side-by-side

## Data Export

Supabase provides built-in CSV export:
1. Go to Supabase Dashboard > Table Editor
2. Select `habit_logs` table
3. Click "Export" button
4. Download as CSV for medical appointments

## Troubleshooting

**Charts not displaying:**
- Ensure Chart.js CDN is loading (check browser console)
- Verify data is being fetched (check Network tab)
- Make sure canvas elements exist before rendering

**Data not saving:**
- Verify Supabase URL and Key are correct
- Check browser console for API errors
- Verify RLS policies allow insert operations

**Mobile display issues:**
- Ensure viewport meta tag is present
- Check that Tailwind CSS CDN is loading
- Test on actual device, not just browser dev tools

## License

This project is part of the QiOS ecosystem.
