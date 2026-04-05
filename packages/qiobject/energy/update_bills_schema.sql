-- SQL script to update the bills table with granular billing columns
-- Run this in Supabase SQL Editor BEFORE inserting data

-- Add new columns to the bills table
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS services_billed NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS taxes NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS late_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS disconnect_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS returned_payment_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_charges NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_billed NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS payments NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS running_balance NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_daily_kwh NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS period_days INTEGER;

-- Update existing billed_amount to total_billed if it exists
UPDATE bills SET total_billed = billed_amount WHERE total_billed IS NULL AND billed_amount IS NOT NULL;

-- Note: After running this, you'll need to update your data with the new insert_bills.sql
-- that includes all the granular fields

