-- 1. Create the Daily Drives Table
-- Stores the core performance metrics per day.
CREATE TABLE drives_daily (
    id BIGSERIAL PRIMARY KEY,
    drive_date DATE NOT NULL,
    driver TEXT NOT NULL CHECK (driver IN ('Zai', 'Cody')),
    online_hours NUMERIC DEFAULT 0,
    driving_hours NUMERIC DEFAULT 0,
    rides_completed INT DEFAULT 0,
    rides_rejected INT DEFAULT 0,
    earnings NUMERIC DEFAULT 0,
    tips NUMERIC DEFAULT 0,
    gas_cost NUMERIC DEFAULT 0,
    other_costs NUMERIC DEFAULT 0,
    rating_stars NUMERIC DEFAULT 5,
    safety_issue BOOLEAN DEFAULT FALSE,
    challenge_progress TEXT,
    tier_points INT DEFAULT 0,
    perk_value NUMERIC DEFAULT 0,
    hours_in_last_24 NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- The "Snap & Steer" constraint: Prevents duplicate entries per driver/day
    UNIQUE(drive_date, driver)
);

-- 2. Create the Challenges Table
-- Tracks specific ride goals for bonus progress.
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    driver TEXT NOT NULL CHECK (driver IN ('Zai', 'Cody')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    required_rides INT NOT NULL,
    label TEXT NOT NULL
);

-- 3. Create the Tier Periods Table
-- Tracks monthly points and loyalty perks.
CREATE TABLE tier_periods (
    id SERIAL PRIMARY KEY,
    driver TEXT NOT NULL CHECK (driver IN ('Zai', 'Cody')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    points_total INT DEFAULT 0,
    perk_value NUMERIC DEFAULT 0
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE drives_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_periods ENABLE ROW LEVEL SECURITY;

-- 5. Performance Indices
CREATE INDEX idx_drives_date_driver ON drives_daily(drive_date, driver);