Rideshare Battle Boards

A single-page mobile-first PWA for tracking and comparing rideshare performance between Cody and Zai. Deployed on Cloudflare Pages with a Worker API backend and Supabase Postgres.

📁 Directory Structure

rideshare-battle-boards/
├── database.sql           # Database schema (Run in Supabase)
├── .env                   # Local secrets (Do not commit)
├── .gitignore             # Git exclusion rules
├── worker/
│   ├── src/index.js       # Cloudflare Worker API logic
│   └── wrangler.toml      # Worker configuration & vars
└── web/
    ├── index.html         # Main PWA interface
    ├── app.js             # Frontend logic & charts
    └── manifest.json      # PWA installation metadata


🚀 Quickstart

1. Supabase Setup

Create a new Supabase project.

Open the SQL Editor in your Supabase dashboard.

Copy the contents of database.sql and run it to create the tables and unique constraints.

2. Worker API Deployment

Navigate to the /worker directory.

Install Wrangler: npm install -g wrangler.

Set your Supabase Service Role Key as a secret:

npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY


Open wrangler.toml and update the SUPABASE_URL with your project URL.

Deploy the API:

npx wrangler deploy


Note your Worker URL (e.g., https://rideshare-api.yourname.workers.dev).

3. Web PWA Deployment

Open web/app.js.

Update the API constant at the top with your Worker URL, ensuring it ends with /api:

const API = "[https://rideshare-api.yourname.workers.dev/api](https://rideshare-api.yourname.workers.dev/api)";


Deploy the /web folder to Cloudflare Pages.

(Optional) In your Worker's wrangler.toml, update CORS_ALLOW_ORIGINS to match your Pages URL for better security.

🛠 Features

Two-Tier Logic: Switch between "Cody" (Full Access) and "Zai" (View Only) modes.

Auto-Sync: Submitting stats for a date that already exists will automatically update (upsert) the record.

Mobile First: Designed with Tailwind CSS for a native app feel on iOS and Android.

Offline Ready: Manifest configuration allows "Add to Home Screen" functionality.