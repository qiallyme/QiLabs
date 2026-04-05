-- SQL script to insert detailed bill data from data.csv into the bills table
-- Run this AFTER running update_bills_schema.sql
-- Run this in Supabase SQL Editor

-- First, optionally clear existing data (uncomment if needed):
-- DELETE FROM bills;

-- Insert bills with granular billing details
-- Fields extracted from CSV:
-- - services_billed = TotalServicesBilled
-- - late_fee = LateFee (from CSV column)
-- - disconnect_fee = extracted from notes (disconnect/reconnect fees)
-- - returned_payment_fee = extracted from notes (usually $20)
-- - taxes = calculated as AmountDue - TotalServicesBilled - late_fee - disconnect_fee - returned_payment_fee
-- - total_billed = AmountDue
-- - running_balance = calculated cumulatively

INSERT INTO bills (period_start, period_end, period_days, billed_kwh, avg_daily_kwh, services_billed, taxes, late_fee, disconnect_fee, returned_payment_fee, other_charges, total_billed, payments, running_balance, estimated_kwh, estimated_amount, notes) VALUES
('2022-09-29', '2022-10-27', 29, 1583, 54.6, 258.63, 12.37, 0, 0, 0, 0, 271.00, 0, 271.00, NULL, NULL, 'Budget billing in effect | Budget: Budget'),
('2022-10-29', '2022-11-28', 31, 2198, 70.9, 286.97, 29.03, 0, 0, 0, 0, 316.00, 0, 587.00, NULL, NULL, 'Budget payment changed | Budget: Budget'),
('2022-11-29', '2022-12-28', 30, 2442, 81.4, 384.61, -68.61, 0, 0, 0, 0, 316.00, 0, 903.00, NULL, NULL, 'Budget: Budget'),
('2022-12-29', '2023-01-27', 30, 3651, 121.7, 364.47, -48.47, 0, 0, 0, 0, 316.00, 0, 1219.00, NULL, NULL, 'Budget: Budget'),
('2023-01-28', '2023-02-24', 28, 3539, 126.4, 413.30, -97.30, 0, 0, 0, 0, 316.00, 0, 1535.00, NULL, NULL, 'Includes small fuel adjustment credit | Budget: Budget'),
('2023-02-25', '2023-03-28', 32, 2454, 76.7, 413.88, -97.88, 0, 0, 0, 0, 316.00, 0, 1851.00, NULL, NULL, 'Budget: Budget'),
('2023-03-28', '2023-04-26', 30, 1854, 61.8, 327.42, 294.17, 0, 0, 0, 0, 621.59, 0, 2472.59, NULL, NULL, 'Budget plan settlement; new budget next bill | Budget: Budget-SettleUp'),
('2023-04-27', '2023-05-26', 30, 1590, 53.0, 332.57, 15.43, 0, 0, 0, 0, 348.00, 0, 2820.59, NULL, NULL, 'Budget: Budget'),
('2023-05-27', '2023-06-28', 33, 2132, 64.6, 327.35, 368.65, 0, 0, 20.00, 0, 716.00, 0, 3536.59, NULL, NULL, 'Returned payment plus 20 fee | ReturnedPayment: Yes'),
('2023-06-29', '2023-07-27', 29, 2491, 85.9, 296.83, 442.92, 0, 0, 20.00, 0, 759.75, 0, 4296.34, NULL, NULL, 'Budget plan canceled; returned payment plus 20 fee | Budget: Budget-Canceled | ReturnedPayment: Yes'),
('2023-07-28', '2023-08-29', 33, 2666, 80.8, 319.12, 318.75, 0, 0, 20.00, 0, 657.87, 0, 4954.21, NULL, NULL, 'Returned payment plus 20 fee | ReturnedPayment: Yes'),
('2023-08-30', '2023-09-27', 29, 2227, 76.8, 331.91, 598.00, 0, 86.00, 0, 0, 951.91, 0, 5906.12, NULL, NULL, 'Non-pay disconnect with 22 disconnect and 64 reconnect fee | Disconnect: Disconnect'),
('2023-09-28', '2023-10-25', 28, 1792, 64.0, 250.55, 351.91, 0, 0, 0, 0, 602.46, 0, 6508.58, NULL, NULL, 'Non-payment disconnections suspended due to system upgrade | Disconnect: Disconnect-Suspended | SystemIssue: Yes'),
('2023-10-28', '2023-11-30', 34, 2180, 64.1, 365.24, -35.24, 0, 0, 0, 0, 330.00, 0, 6838.58, NULL, NULL, 'New account number assigned due to system upgrade | SystemIssue: Yes'),
('2023-12-01', '2023-12-29', 29, 2685, 92.6, 352.94, -22.94, 0, 0, 0, 0, 330.00, 0, 7168.58, NULL, NULL, ''),
('2023-12-30', '2024-01-31', 33, 2894, 87.7, 592.35, 67.65, 0, 0, 0, 0, 660.00, 0, 7828.58, NULL, NULL, 'Budget amount increased | Budget: Budget'),
('2024-01-29', '2024-03-05', 37, 4003, 108.2, 414.87, 575.13, 0, 0, 0, 0, 990.00, 0, 8818.58, NULL, NULL, 'Billing issues; late fees waived and no disconnections | Budget: Budget | SystemIssue: Yes'),
('2024-03-01', '2024-03-28', 28, 2890, 103.2, 336.18, 688.42, 0, 0, 0, 0, 1024.60, 0, 9843.18, NULL, NULL, 'System upgrade issues ongoing | Budget: Budget | SystemIssue: Yes'),
('2024-03-31', '2024-04-30', 31, 2542, 82.0, 269.65, 1084.95, 0, 0, 0, 0, 1354.60, 0, 11197.78, NULL, NULL, 'Budget: Budget'),
('2024-04-30', '2024-05-31', 32, 2672, 83.5, 297.87, 1386.73, 0, 0, 0, 0, 1684.60, 0, 12882.38, NULL, NULL, 'Rate adjustment approved effective mid May | Budget: Budget'),
('2024-06-01', '2024-06-28', 28, 2554, 91.2, 374.19, 1640.41, 0, 0, 0, 0, 2014.60, 0, 14896.98, NULL, NULL, 'Budget: Budget'),
('2024-07-01', '2024-07-29', 29, 2691, 92.8, 345.90, 1998.70, 0, 0, 0, 0, 2344.60, 0, 17241.58, NULL, NULL, 'Budget: Budget'),
('2024-07-28', '2024-08-28', 32, 2835, 88.6, 382.19, 2292.41, 0, 0, 0, 0, 2674.60, 0, 19916.18, NULL, NULL, 'Limited customer systems operations noted | Budget: Budget | SystemIssue: Yes'),
('2024-08-31', '2024-09-30', 31, 2471, 79.7, 364.19, 2640.41, 0, 0, 0, 0, 3004.60, 0, 22920.78, NULL, NULL, 'Remote disconnections scheduled to begin November 2024 | Budget: Budget'),
('2024-09-29', '2024-10-31', 33, 2802, 84.9, 288.16, 3470.17, 0, 0, 0, 0, 3758.33, 0, 26679.11, NULL, NULL, 'Budget plan settlement; new budget 365 | Budget: Budget-SettleUp'),
('2024-11-01', '2024-11-27', 27, 2832, 104.9, 258.70, 3758.33, 0, 0, 0, 0, 4017.03, 0, 30696.14, NULL, NULL, 'Budget: Budget'),
('2024-11-30', '2024-12-31', 32, 3520, 110.0, 630.08, 4017.03, 0, 0, 0, 0, 4647.11, 0, 35343.25, NULL, NULL, 'Budget: Budget'),
('2024-12-30', '2025-01-31', 33, 5666, 171.7, 776.38, 4647.99, 17.88, 0, 0, 0, 5441.37, 0, 40784.62, NULL, NULL, 'Includes late payment charge 17.88 | Budget: Budget | LateFee: 17.88'),
('2025-01-30', '2025-03-03', 29, 3848, 132.7, 613.88, 5441.35, 21.98, 0, 0, 0, 6077.23, 0, 46861.85, NULL, NULL, 'Includes late payment charge 21.98 | Budget: Budget | LateFee: 21.98'),
('2025-03-04', '2025-03-31', 28, 2960, 105.7, 436.86, 6077.23, 17.42, 0, 0, 0, 6531.51, 0, 53393.36, NULL, NULL, 'Includes late payment charge 17.42 and disconnect notice | Budget: Budget | Disconnect: Disconnect-Notice | LateFee: 17.42'),
('2025-03-30', '2025-04-30', 32, 2371, 74.1, 400.20, 1045.00, 0, 0, 0, 0, 1445.20, 0, 54838.56, NULL, NULL, 'Payment extension granted; total extension 6270 | Budget: Budget | Extension: Created'),
('2025-05-01', '2025-05-30', 30, 2760, 92.0, 368.68, 6670.20, 11.43, 0, 0, 0, 7050.31, 0, 61888.87, NULL, NULL, 'Extension canceled; about 5225 added back; includes late payment charge 11.43 | Budget: Budget | Extension: Canceled | LateFee: 11.43'),
('2025-06-02', '2025-06-30', 29, 2996, 103.3, 417.90, 7050.31, 10.55, 0, 0, 0, 7478.76, 0, 69367.63, NULL, NULL, 'Includes late payment charge 10.55 and immediate disconnect notice | Budget: Budget | Disconnect: Disconnect-Notice | LateFee: 10.55'),
('2025-06-29', '2025-07-31', 33, 3109, 94.2, 571.69, 5601.61, 11.93, 0, 20.00, 0, 7184.23, 0, 76551.86, NULL, NULL, 'Includes returned payment 1570 plus 20 fee and late payment charge 11.93 | Budget: Budget | ReturnedPayment: Yes | LateFee: 11.93'),
('2025-08-01', '2025-08-29', 29, 2767, 95.4, 376.94, 7184.23, 16.24, 0, 0, 0, 7577.41, 0, 84129.27, NULL, NULL, 'Includes late payment charge 16.24 | Budget: Budget | LateFee: 16.24');

-- Note: Running balance is calculated cumulatively. You may want to update it based on actual payments.
-- To calculate running balance with payments, you would need to track payments separately.

