-- SQL script to insert bill data from data.csv into the bills table
-- Run this in Supabase SQL Editor

-- First, optionally clear existing data (uncomment if needed):
-- DELETE FROM bills;

-- Insert bills from CSV data
-- period_start = BillingDate - PeriodDays + 1 (inclusive date range)
-- period_end = BillingDate
-- billed_kwh = TotalKWh
-- billed_amount = AmountDue
-- notes = Combined Notes with context (BudgetPlanStatus, ExtensionEvent, etc.)

INSERT INTO bills (period_start, period_end, billed_kwh, billed_amount, estimated_kwh, estimated_amount, notes) VALUES
('2022-09-29', '2022-10-27', 1583, 271.00, NULL, NULL, 'Budget billing in effect | Budget: Budget'),
('2022-10-29', '2022-11-28', 2198, 316.00, NULL, NULL, 'Budget payment changed | Budget: Budget'),
('2022-11-29', '2022-12-28', 2442, 316.00, NULL, NULL, 'Budget: Budget'),
('2022-12-29', '2023-01-27', 3651, 316.00, NULL, NULL, 'Budget: Budget'),
('2023-01-28', '2023-02-24', 3539, 316.00, NULL, NULL, 'Includes small fuel adjustment credit | Budget: Budget'),
('2023-02-25', '2023-03-28', 2454, 316.00, NULL, NULL, 'Budget: Budget'),
('2023-03-28', '2023-04-26', 1854, 621.59, NULL, NULL, 'Budget plan settlement; new budget next bill | Budget: Budget-SettleUp'),
('2023-04-27', '2023-05-26', 1590, 348.00, NULL, NULL, 'Budget: Budget'),
('2023-05-27', '2023-06-28', 2132, 716.00, NULL, NULL, 'Returned payment plus 20 fee | ReturnedPayment: Yes'),
('2023-06-29', '2023-07-27', 2491, 759.75, NULL, NULL, 'Budget plan canceled; returned payment plus 20 fee | Budget: Budget-Canceled | ReturnedPayment: Yes'),
('2023-07-28', '2023-08-29', 2666, 657.87, NULL, NULL, 'Returned payment plus 20 fee | ReturnedPayment: Yes'),
('2023-08-30', '2023-09-27', 2227, 951.91, NULL, NULL, 'Non-pay disconnect with 22 disconnect and 64 reconnect fee | Disconnect: Disconnect'),
('2023-09-28', '2023-10-25', 1792, 602.46, NULL, NULL, 'Non-payment disconnections suspended due to system upgrade | Disconnect: Disconnect-Suspended | SystemIssue: Yes'),
('2023-10-28', '2023-11-30', 2180, 330.00, NULL, NULL, 'New account number assigned due to system upgrade | SystemIssue: Yes'),
('2023-12-01', '2023-12-29', 2685, 330.00, NULL, NULL, ''),
('2023-12-30', '2024-01-31', 2894, 660.00, NULL, NULL, 'Budget amount increased | Budget: Budget'),
('2024-01-29', '2024-03-05', 4003, 990.00, NULL, NULL, 'Billing issues; late fees waived and no disconnections | Budget: Budget | SystemIssue: Yes'),
('2024-03-01', '2024-03-28', 2890, 1024.60, NULL, NULL, 'System upgrade issues ongoing | Budget: Budget | SystemIssue: Yes'),
('2024-03-31', '2024-04-30', 2542, 1354.60, NULL, NULL, 'Budget: Budget'),
('2024-04-30', '2024-05-31', 2672, 1684.60, NULL, NULL, 'Rate adjustment approved effective mid May | Budget: Budget'),
('2024-06-01', '2024-06-28', 2554, 2014.60, NULL, NULL, 'Budget: Budget'),
('2024-07-01', '2024-07-29', 2691, 2344.60, NULL, NULL, 'Budget: Budget'),
('2024-07-28', '2024-08-28', 2835, 2674.60, NULL, NULL, 'Limited customer systems operations noted | Budget: Budget | SystemIssue: Yes'),
('2024-08-31', '2024-09-30', 2471, 3004.60, NULL, NULL, 'Remote disconnections scheduled to begin November 2024 | Budget: Budget'),
('2024-09-29', '2024-10-31', 2802, 3758.33, NULL, NULL, 'Budget plan settlement; new budget 365 | Budget: Budget-SettleUp'),
('2024-11-01', '2024-11-27', 2832, 4017.03, NULL, NULL, 'Budget: Budget'),
('2024-11-30', '2024-12-31', 3520, 4647.11, NULL, NULL, 'Budget: Budget'),
('2024-12-30', '2025-01-31', 5666, 5441.37, NULL, NULL, 'Includes late payment charge 17.88 | Budget: Budget | LateFee: 17.88'),
('2025-01-30', '2025-03-03', 3848, 6077.23, NULL, NULL, 'Includes late payment charge 21.98 | Budget: Budget | LateFee: 21.98'),
('2025-03-04', '2025-03-31', 2960, 6531.51, NULL, NULL, 'Includes late payment charge 17.42 and disconnect notice | Budget: Budget | Disconnect: Disconnect-Notice | LateFee: 17.42'),
('2025-03-30', '2025-04-30', 2371, 1445.20, NULL, NULL, 'Payment extension granted; total extension 6270 | Budget: Budget | Extension: Created'),
('2025-05-01', '2025-05-30', 2760, 7050.31, NULL, NULL, 'Extension canceled; about 5225 added back; includes late payment charge 11.43 | Budget: Budget | Extension: Canceled | LateFee: 11.43'),
('2025-06-02', '2025-06-30', 2996, 7478.76, NULL, NULL, 'Includes late payment charge 10.55 and immediate disconnect notice | Budget: Budget | Disconnect: Disconnect-Notice | LateFee: 10.55'),
('2025-06-29', '2025-07-31', 3109, 7184.23, NULL, NULL, 'Includes returned payment 1570 plus 20 fee and late payment charge 11.93 | Budget: Budget | ReturnedPayment: Yes | LateFee: 11.93'),
('2025-08-01', '2025-08-29', 2767, 7577.41, NULL, NULL, 'Includes late payment charge 16.24 | Budget: Budget | LateFee: 16.24');
