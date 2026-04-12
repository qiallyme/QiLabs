-- =================================================
-- Supabase SQL generated from care-sheets.xlsx
-- Generated: 2026-04-10 07:49:16
-- Run this file in Supabase SQL Editor
-- ================================================

CREATE TABLE IF NOT EXISTS medications (
    id BIGSERIAL PRIMARY KEY,
    medication TEXT,
    strength TEXT,
    form TEXT,
    rx_number TEXT,
    prescriber TEXT,
    dosage_instructions TEXT,
    frequency TEXT,
    quantity_prescribed DATE,
    quantity_remaining INTEGER,
    expiration_date DATE,
    refills_allowed INTEGER,
    prescribed_date DATE,
    filled_date DATE,
    notes TEXT
);


INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Omeprazole', '40 mg', 'capsule', 'RX6872731', 'Michael L. Pinkston', 'one capsule by mouth', 'twice daily', 180, '~90', '2024-07-14 00:00:00', NULL, NULL, 'Bottle about half full', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Lisinopril-HCTZ', '20-25 mg', 'tablet', 'RX7016417', 'Chelsea Marlin', 'one tablet by mouth', 'once daily', 90, '~30', '2027-01-28 00:00:00', NULL, NULL, NULL, NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Prednisone', '5 mg', 'tablet', 'RX7020569', 'Dan Bardi', 'three tablets for 7 days then two tablets', 'once daily until changed', 100, '~20', '2027-02-23 00:00:00', '1x', '2026-03-01 00:00:00', NULL, NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Ibuprofen', '400 mg', 'tablet', 'RX7021882', 'Jung Kang Smith (John King Smith)', 'one tablet by mouth', 'as needed for pain every 8 hours', 58, '58 (full)', '2027-03-04 00:00:00', '5x', '2026-03-04 00:00:00', 'May refill 5 times by 2027-03-03', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Cyclobenzaprine', '5 mg', 'tablet', 'RX7003393', 'Chelsea Marlin', 'one tablet by mouth', 'at bedtime', 30, '~20', '2027-03-18 00:00:00', '2x', '2026-03-18 00:00:00', 'Refills by 2026-10-31', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Metoprolol ER', '100 mg', 'tablet', 'RX6995598', 'Chelsea Marlin', 'one tablet by mouth', 'once daily', 90, '~2', '2026-12-15 00:00:00', NULL, '2025-12-15 00:00:00', NULL, NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Gabapentin', '600 mg', 'tablet', 'RX7005388', 'Chelsea Marlin', 'one tablet by mouth', 'three times daily as needed', 90, '90 (assumed full)', '2026-11-14 00:00:00', NULL, '2025-11-14 00:00:00', 'No refills', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Gabapentin', '600 mg', 'tablet', 'RX7025651', 'Chelsea Marlin', 'one tablet by mouth', 'three times daily as needed', 90, '90 (assumed full)', '2027-03-26 00:00:00', '5x', '2026-03-26 00:00:00', NULL, NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Gabapentin', '600 mg', 'tablet', 'RX7020372', 'Chelsea Marlin', 'one tablet by mouth', 'three times daily as needed', 90, '90 (assumed full)', '2027-02-23 00:00:00', '2x', '2026-02-23 00:00:00', NULL, NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Theophylline ER', '300 mg', 'tablet', 'RX6964687', 'Dan Bardi', 'one tablet by mouth', 'once daily (1 hour before breakfast)', 90, '90 (assumed full)', '2026-11-13 00:00:00', NULL, '2025-11-13 00:00:00', 'No refills', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Atorvastatin', '20 mg', 'tablet', 'RX6941577', 'Chelsea Marlin', 'one tablet by mouth', 'once daily', 90, '90 (full)', '2026-06-26 00:00:00', NULL, '2025-06-26 00:00:00', NULL, NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Atorvastatin', '20 mg', 'tablet', 'RX7009936', 'Chelsea Marlin', 'one tablet by mouth', 'once daily', 90, 90, '2027-03-12 00:00:00', NULL, '2026-03-12 (renewed)', 'No refills (original 2025-12-15 also noted)', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Famotidine', '20 mg', 'tablet', 'RX7003345', 'Chelsea Marlin', 'one tablet by mouth', 'once daily', 90, 90, '2026-11-11 00:00:00', NULL, '2025-11-11 00:00:00', 'Duplicate mention with 2027-02-19 exp — using original', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Azithromycin', '250 mg', 'tablet', 'RX6996855', 'Dan Bardi', 'one tablet by mouth', 'Mon/Wed/Fri (long-term lung)', 36, '36 (assumed full)', '2027-03-20 00:00:00', NULL, '2026-03-20 00:00:00', 'No refills', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Buspirone HCl', '5 mg', 'tablet', 'RX2020617', 'S. POG', 'one tablet by mouth', 'three times daily as needed', 90, '90 (assumed)', '2024-07-21 00:00:00', '5x', '2023-07-22 00:00:00', 'Discard after 2024-07-21', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Albuterol inhalation solution', '0.083% 2.5 mg/3 mL', 'vial', 'RX7010100', 'Kaitlyn Miller (Kaitlin Miller)', 'one vial in nebulizer', 'every 4 hours as needed', 540, '540 (assumed full)', '2027-03-25 00:00:00', '2x', '2026-03-25 00:00:00', 'May refill 2 times by 2026-12-15', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Albuterol inhaler', '90 mcg (10890 base)', 'inhaler', NULL, NULL, 'one puff by mouth', 'every 6 hours as needed', NULL, '2 inhalers (confirmed)', NULL, NULL, NULL, 'From Feb 2026 med list', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Trelegy (fluticasone/umeclidinium/vilanterol)', '200-62.5-25 mcg', 'inhaler', NULL, NULL, 'one puff by mouth', 'once daily', NULL, '1 (assumed active)', NULL, NULL, NULL, 'From Feb 2026 med list', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Dupixent (dupilumab)', '300 mg', 'injection', 'RX7606900125', 'Dan Bardi (Vardi)', 'inject 300 mg', 'every 14 days', NULL, 'N/A (no qty given)', NULL, NULL, NULL, 'From Feb 2026 med list — last shot date unknown', NULL);

INSERT INTO medications (medication, strength, form, rx_number, prescriber, dosage_instructions, frequency, quantity_prescribed, quantity_remaining, expiration_date, refills_allowed, prescribed_date, filled_date, notes) VALUES ('Roflumilast', '500 mcg', 'tablet', NULL, NULL, 'one tablet by mouth', 'once daily', NULL, NULL, NULL, NULL, NULL, 'From Feb 2026 med list', NULL);

-- End of table medications

CREATE TABLE IF NOT EXISTS otc (
    id BIGSERIAL PRIMARY KEY,
    item TEXT,
    strength TEXT,
    form TEXT,
    quantity_remaining INTEGER,
    notes TEXT,
    unnamed:_5 TEXT
);


INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Aspirin low-dose (Equate)', '81 mg', 'enteric-coated tablets', '~150 (half of 300)', 'Daily regimen', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Vitamin D (cholecalciferol)', '5000 IU (10 mcg / 200 softgels total)', 'softgels', '~100 (half full)', 'Bone/immune', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Acetaminophen', '500 mg', 'tablets', 'few left', 'PRN pain', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Mylanta', 'multisymptom', 'liquid', '~half empty', 'Antacid', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Benadryl (diphenhydramine)', '25 mg', 'liquid (4 fl oz bubblegum)', '~half full', 'Allergy', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Benadryl generic (Equate)', '25 mg', 'tablets', NULL, 'Allergy relief', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Cetirizine', '10 mg', 'tablets', NULL, 'Allergy (first aid kit)', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Guaifenesin ER', '1200 mg', 'extended-release tablets', 14, 'Expectorant', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Phenylephrine HCl', 'nasal decongestant', 'tablets', 300, 'Nasal', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Nicotine lozenges', '2 mg', 'lozenges', 27, 'Cessation', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Nicotine patches', '21 mg', 'patches', '14 (full box) + 9 loose', 'Cessation', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Prednisolone', '0.01', 'ophthalmic/otic drops (5 mL)', '2 bottles (1 open', ' 1 sealed)', 'Dropper');

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Ofloxacin', '0.003', 'ophthalmic/otic solution (5 mL)', '1 bottle', 'Dropper (RX# 4370522026-04)', NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Ipratropium bromide nasal', '0.0006', 'nasal solution (15 mL)', 'nearly empty', NULL, NULL);

INSERT INTO otc (item, strength, form, quantity_remaining, notes, unnamed:_5) VALUES ('Saline nasal (NeilMed + generic)', NULL, 'solution', NULL, '2 bottles', NULL);

-- End of table otc

CREATE TABLE IF NOT EXISTS equipment (
    id BIGSERIAL PRIMARY KEY,
    item TEXT,
    type TEXT,
    subtype TEXT,
    quantity INTEGER,
    status TEXT,
    condition TEXT,
    location TEXT,
    notes TEXT,
    low_stock_threshold INTEGER,
    low_stock_alert BOOLEAN,
    alert_notes TEXT
);


INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Nebulizer', 'Machine', NULL, 2, 'active', 'working', 'Home', 'Both functioning', 1, 'False', 'Only alert if <1 working');

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Portable Nebulizer', 'Machine', NULL, 1, 'active', 'working', 'Vehicle', 'Plugs into truck', 1, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Home Oxygen Concentrator', 'Machine', NULL, 1, 'active', 'working', 'Home', 'Deaconess larger unit', 1, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Oxygen Tank', 'E-type (large)', NULL, 8, 'active', 'configured', 'Home', '4–5 ready with regulator+key+cannula', 2, 'False', 'Alert if <2 ready');

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Oxygen Tank', 'D-type (small)', NULL, 7, 'active', 'configured', 'Home', 'One already has regulator', 2, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Nasal Cannula', 'Accessory', 'standard', 7, 'active', 'good', 'Home/Travel', '3 main + 4 backup', 2, 'True', '⚠️ Only 7 total — low backup');

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Nasal Cannula', 'Accessory', '2-in-1', 1, 'active', 'good', 'Home', NULL, 1, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Tube Splitter / Joiner', 'Accessory', 'splitter', 2, 'active', 'good', 'Home', NULL, 1, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Oxygen Tubing', 'Accessory', 'short_clear', 7, 'active', 'good', 'Home', 'Backup', 3, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Oxygen Tubing', 'Accessory', 'medium_heavy_green (thick)', 1, 'active', 'good', 'Home', NULL, 1, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Oxygen Tubing', 'Accessory', 'long_10ft_green', 1, 'active', 'good', 'Home', NULL, 1, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Oxygen Tubing', 'Accessory', 'long_50ft_green', 1, 'active', 'good', 'Home', NULL, 1, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Oxygen Tubing', 'Accessory', 'standard', 1, 'discard', 'kinked (multiple)', 'Home', 'Dispose', 0, 'False', 'Quarantined');

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Nasal Cannula', 'Accessory', 'standard', 1, 'discard', 'contaminated (dirty)', 'Home', 'Dispose', 0, 'False', 'Quarantined');

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Nebulizer Tube', 'Accessory', 'standard', 1, 'discard', 'kinked', 'Home', 'Dispose', 0, 'False', 'Quarantined');

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Regulator Washers', 'Accessory', NULL, 2, 'active', 'good', 'Metal box', NULL, 1, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Oxygen Keys / Multi-tool', 'Accessory', NULL, 'multiple (incl. green + backups)', 'active', 'good', 'Small organizer / portable nebulizer', 'One in portable nebulizer', 2, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('CPAP Nose Pads', 'Accessory', NULL, 5, 'active', 'good', 'CPAP container', NULL, 2, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('CPAP Filters', 'Accessory', NULL, 9, 'active', 'good', 'One baggie', 'Reused baggies', 3, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('CPAP Cover', 'Accessory', NULL, 1, 'active', 'good', 'CPAP container', NULL, 1, 'False', NULL);

INSERT INTO equipment (item, type, subtype, quantity, status, condition, location, notes, low_stock_threshold, low_stock_alert, alert_notes) VALUES ('Flow Settings (note row)', NULL, NULL, 'Standard 2 L/min', ' max 3 L/min', NULL, NULL, NULL, NULL, NULL, 'False');

-- End of table equipment

CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    date DATE,
    provider TEXT,
    time TEXT,
    purpose TEXT,
    status TEXT,
    vitals_notes TEXT,
    weight INTEGER,
    bps TEXT,
    bpi TEXT,
    pulse INTEGER,
    o2 INTEGER,
    bmi INTEGER,
    care TEXT
);


INSERT INTO appointments (date, provider, time, purpose, status, vitals_notes, weight, bps, bpi, pulse, o2, bmi, care) VALUES ('2026-02-23 00:00:00', 'Dr. Bardi (Vardi)', NULL, 'Follow-up lung / prednisone taper', 'Completed', NULL, 180, 110, 76, 96, 99, '30.9', 'support needed');

INSERT INTO appointments (date, provider, time, purpose, status, vitals_notes, weight, bps, bpi, pulse, o2, bmi, care) VALUES ('2026-02-06 00:00:00', 'Unknown', NULL, 'Routine check', 'Completed', NULL, 179, 126, 80, 98, NULL, '30.73', NULL);

INSERT INTO appointments (date, provider, time, purpose, status, vitals_notes, weight, bps, bpi, pulse, o2, bmi, care) VALUES ('2026-03-03 00:00:00', 'Dr. Jung King Smith', '14:30:00', 'New patient visit', 'Completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO appointments (date, provider, time, purpose, status, vitals_notes, weight, bps, bpi, pulse, o2, bmi, care) VALUES ('2026-03-18 00:00:00', 'Dr. Bardi', '13:40:00', 'Follow-up (you attended)', 'Completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO appointments (date, provider, time, purpose, status, vitals_notes, weight, bps, bpi, pulse, o2, bmi, care) VALUES ('2026-05-13 00:00:00', 'Merrill Castle NP', '11:30:00', 'Office visit return', 'Upcoming', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO appointments (date, provider, time, purpose, status, vitals_notes, weight, bps, bpi, pulse, o2, bmi, care) VALUES ('2026-05-27 00:00:00', 'Dr. Bardi', '14:00:00', 'Office visit return', 'Upcoming', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO appointments (date, provider, time, purpose, status, vitals_notes, weight, bps, bpi, pulse, o2, bmi, care) VALUES ('2026-07-20 00:00:00', 'Chelsea Marlin', '14:30:00', 'Office visit return', 'Upcoming', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO appointments (date, provider, time, purpose, status, vitals_notes, weight, bps, bpi, pulse, o2, bmi, care) VALUES ('2025-06-01 00:00:00', 'GI Specialty Center (endoscopy)', NULL, 'GI procedure', 'Completed (confirm)', 'Reminder only', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- End of table appointments

CREATE TABLE IF NOT EXISTS vitals (
    id BIGSERIAL PRIMARY KEY,
    date DATE,
    type TEXT,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    pulse INTEGER,
    o2_sat_percent INTEGER,
    weight_lbs INTEGER,
    bmi INTEGER,
    height TEXT,
    notes TEXT
);


INSERT INTO vitals (date, type, systolic_bp, diastolic_bp, pulse, o2_sat_percent, weight_lbs, bmi, height, notes) VALUES ('2026-02-23 00:00:00', 'vitals', 110, 76, 96, 99, 180, '30.9', '5''4"', 'Severe lung disease noted — caregiver support needed');

INSERT INTO vitals (date, type, systolic_bp, diastolic_bp, pulse, o2_sat_percent, weight_lbs, bmi, height, notes) VALUES ('2026-02-06 00:00:00', 'vitals', 126, 80, 98, 98, 179, '30.73', '5''4"', 'Routine check');

-- End of table vitals

CREATE TABLE IF NOT EXISTS usage (
    id BIGSERIAL PRIMARY KEY,
    log_id TEXT,
    patient_id TEXT,
    medication_id TEXT,
    inventory_id TEXT,
    action TEXT,
    quantity_change INTEGER,
    reason TEXT,
    notes TEXT,
    created_at DATE
);


INSERT INTO usage (log_id, patient_id, medication_id, inventory_id, action, quantity_change, reason, notes, created_at) VALUES ('starter-001', 'Lisa-English', 'Metoprolol-ER', NULL, 'count_update', '-2', 'Daily use (approx)', '~2 tablets left as of 2026-04-10', '2026-04-10 08:00:00');

INSERT INTO usage (log_id, patient_id, medication_id, inventory_id, action, quantity_change, reason, notes, created_at) VALUES ('starter-002', 'Lisa-English', 'Prednisone-5mg', NULL, 'count_update', '-15', 'Taper: 3 tabs/day x 5 days (from transcript)', 'Started 2026-03-01; monitor taper', '2026-04-10 08:05:00');

INSERT INTO usage (log_id, patient_id, medication_id, inventory_id, action, quantity_change, reason, notes, created_at) VALUES ('starter-003', 'Lisa-English', 'Gabapentin-600mg-RX7005388', NULL, 'count_update', 0, 'Baseline full bottle', 'No change yet — PRN pain', '2026-04-10 08:10:00');

INSERT INTO usage (log_id, patient_id, medication_id, inventory_id, action, quantity_change, reason, notes, created_at) VALUES ('starter-004', 'Lisa-English', 'Albuterol-nebulizer', NULL, 'usage', '-1 vial', 'q4h PRN wheezing', 'Used during recent flare — log daily', '2026-04-10 08:15:00');

INSERT INTO usage (log_id, patient_id, medication_id, inventory_id, action, quantity_change, reason, notes, created_at) VALUES ('starter-005', 'Lisa-English', 'Oxygen-Tank-E', NULL, 'equipment_check', 0, '4–5 ready', 'Paired regulators/keys/cannulas — verified today', '2026-04-10 08:20:00');

INSERT INTO usage (log_id, patient_id, medication_id, inventory_id, action, quantity_change, reason, notes, created_at) VALUES ('starter-006', 'Lisa-English', 'Ibuprofen-400mg', NULL, 'count_update', '-1', 'PRN pain', 'One tablet used — monitor kidney risk with lisinopril', '2026-04-10 08:25:00');

INSERT INTO usage (log_id, patient_id, medication_id, inventory_id, action, quantity_change, reason, notes, created_at) VALUES ('starter-007', 'Lisa-English', 'Ankle-Pumps', NULL, 'care_task_complete', 20, 'Daily exercise', 'Circulation support — completed today', '2026-04-10 08:30:00');

INSERT INTO usage (log_id, patient_id, medication_id, inventory_id, action, quantity_change, reason, notes, created_at) VALUES ('starter-008', 'Lisa-English', 'Theophylline-ER', NULL, 'count_update', 0, 'Full bottle', '1 hr before breakfast — watch for azithromycin interaction', '2026-04-10 08:35:00');

INSERT INTO usage (log_id, patient_id, medication_id, inventory_id, action, quantity_change, reason, notes, created_at) VALUES ('starter-009', 'Lisa-English', 'Dupixent', NULL, 'injection_log', 0, 'q14 days — last unknown', 'Confirm exact last shot date for schedule', '2026-04-10 08:40:00');

INSERT INTO usage (log_id, patient_id, medication_id, inventory_id, action, quantity_change, reason, notes, created_at) VALUES ('starter-010', 'Lisa-English', 'Nasal-Cannula', NULL, 'inventory_check', '-1', '1 contaminated', 'Moved to discard — low stock alert active', '2026-04-10 08:45:00');

-- End of table usage

CREATE TABLE IF NOT EXISTS interactions (
    id BIGSERIAL PRIMARY KEY,
    med1 TEXT,
    med2 TEXT,
    severity TEXT,
    description TEXT,
    recommendation TEXT,
    source_notes TEXT
);


INSERT INTO interactions (med1, med2, severity, description, recommendation, source_notes) VALUES ('Lisinopril-HCTZ', 'Ibuprofen', 'Moderate-Major', 'Reduces BP control + increases risk of acute kidney injury (especially with HCTZ diuretic and in lung/elderly patients)', 'Avoid regular use; use acetaminophen instead for pain. Monitor kidney function (creatinine). Doctor may adjust dose.', 'Drugs.com / GoodRx / Patient.info — consistent major flag');

INSERT INTO interactions (med1, med2, severity, description, recommendation, source_notes) VALUES ('Ibuprofen', 'Low-Dose Aspirin', 'Moderate', 'Increased bleeding risk (GI bleed', ' bruising)', 'Use lowest effective ibuprofen dose; take with food. Watch for black stools. Standard NSAID + aspirin warning		');

INSERT INTO interactions (med1, med2, severity, description, recommendation, source_notes) VALUES ('Azithromycin', 'Theophylline', 'Moderate', 'Azithromycin may raise theophylline blood levels → nausea', ' tremors', ' irregular heartbeat  seizures	Monitor theophylline levels closely during azithromycin course. Doctor may lower theophylline dose.	Drugs.com interaction checker		');

INSERT INTO interactions (med1, med2, severity, description, recommendation, source_notes) VALUES ('Theophylline', 'Prednisone', 'Moderate', 'Additive risk of low potassium (hypokalemia); theophylline levels may fluctuate', 'Monitor potassium and theophylline blood levels. ECG if symptoms.', 'Drugs.com professional reference');

INSERT INTO interactions (med1, med2, severity, description, recommendation, source_notes) VALUES ('Gabapentin', 'Cyclobenzaprine', 'Moderate', 'Increased CNS depression (drowsiness', ' dizziness', ' confusion) — risky with COPD/oxygen use Avoid driving; use lowest doses. Doctor may space doses.	Standard sedative interaction		');

INSERT INTO interactions (med1, med2, severity, description, recommendation, source_notes) VALUES ('Omeprazole', 'Atorvastatin', 'Minor', 'Omeprazole may slightly increase atorvastatin levels', 'Usually safe; monitor for muscle pain.', 'Drugs.com omeprazole checker');

INSERT INTO interactions (med1, med2, severity, description, recommendation, source_notes) VALUES ('Dupixent (dupilumab)', 'Prednisone', 'None found', 'No known pharmacokinetic interaction', 'Safe to use together per labeling. Still monitor overall steroid effects.', 'Dupixent label / Drugs.com');

INSERT INTO interactions (med1, med2, severity, description, recommendation, source_notes) VALUES ('Ibuprofen', 'Prednisone', 'Moderate', 'Increased GI bleed / ulcer risk with steroid', 'Take with food or PPI (omeprazole helps). Short-term only.', 'Standard NSAID + steroid warning');

-- End of table interactions

CREATE TABLE IF NOT EXISTS holistic (
    id BIGSERIAL PRIMARY KEY,
    category TEXT,
    summary TEXT,
    interactions_with_meds TEXT,
    treatments_environmental TEXT,
    alerts_risks TEXT,
    action_items TEXT
);


INSERT INTO holistic (category, summary, interactions_with_meds, treatments_environmental, alerts_risks, action_items) VALUES ('Conditions', 'Severe obstructive lung disease (COPD/asthma overlap)', ' hypertension', ' hyperlipidemia', ' GERD', ' chronic pain/inflammation  possible type 2 inflammation (Dupixent)	 nicotine dependence (quitting)	Complex polypharmacy (13+ Rx + OTC)	Oxygen 2 L/min	 nebulizers	 ankle pumps daily	High risk of exacerbations	 kidney strain	 sedation	 hypokalemia	 dust-triggered flares	Review with pulmonologist quarterly		');

INSERT INTO holistic (category, summary, interactions_with_meds, treatments_environmental, alerts_risks, action_items) VALUES ('Medication Interactions Summary', 'See Drug Interactions tab for details. Highest risks: Lisinopril+Ibuprofen (kidneys)', ' Theophylline+Azithromycin (levels)', ' NSAIDs+steroids (GI/bleed)', 'None with Dupixent or oxygen directly', 'Nicotine patches/lozenges safe with current list Metoprolol nearly out — refill ASAP	Weekly inventory check + doctor review of PRN ibuprofen					');

INSERT INTO holistic (category, summary, interactions_with_meds, treatments_environmental, alerts_risks, action_items) VALUES ('Environmental & Lifestyle Factors', 'Dust exposure worsens breathing (transcript notes heavy dusting needed); oxygen use = no smoking/fire hazard nearby; nicotine cessation in progress', 'Nicotine aids have no major interactions with lung meds', 'Home cleaning critical; avoid pollutants; ankle pumps prevent clots during low mobility', 'Dust + lung disease = flare risk; oxygen + open flame = fire', 'Daily dust wipe on machines; no smoking near tanks; continue nicotine taper 					');

INSERT INTO holistic (category, summary, interactions_with_meds, treatments_environmental, alerts_risks, action_items) VALUES ('Respiratory Treatments', 'Albuterol rescue + Trelegy controller + nebulizer + ipratropium nasal + theophylline + azithromycin (M/W/F) + roflumilast', 'All compatible but monitor theophylline levels', 'Oxygen 2–3 L/min + nebulizer supplies', 'Low backup cannulas/tubing', 'Re-order tubing/cannulas when low_stock_alert = TRUE');

INSERT INTO holistic (category, summary, interactions_with_meds, treatments_environmental, alerts_risks, action_items) VALUES ('Holistic Strengths & Goals', 'Organized inventory + power of attorney in progress; family caregiver support noted; smoking cessation aids active', 'Improved med adherence reduces ER visits', 'Ankle pumps + cleaning = better circulation + fewer flares', 'Nicotine quitting improves oxygen effectiveness and lung function', 'Set phone reminders for low-stock + daily ankle pumps + next Dupixent shot (confirm date)');

-- End of table holistic

CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    date DATE,
    type TEXT,
    task_name TEXT,
    frequency TEXT,
    reps INTEGER,
    instructions TEXT,
    notes TEXT
);


INSERT INTO tasks (date, type, task_name, frequency, reps, instructions, notes) VALUES ('2026-04-10 00:00:00', 'care_task', 'Ankle Pumps', 'daily', 20, 'Lie on back, foot elevated on pillow, move foot up and down (dorsiflexion/plantarflexion) — 1 rep every 4 seconds', 'Circulation support — prevents clots. Do 1x daily.');

-- End of table tasks

CREATE TABLE IF NOT EXISTS regimens (
    id BIGSERIAL PRIMARY KEY,
    regimen_id TEXT,
    type TEXT,
    name TEXT,
    frequency TEXT,
    dosage_or_reps INTEGER,
    instructions TEXT,
    notes TEXT,
    low_stock_alert BOOLEAN,
    alert_notes TEXT
);


INSERT INTO regimens (regimen_id, type, name, frequency, dosage_or_reps, instructions, notes, low_stock_alert, alert_notes) VALUES ('R01', 'treatment', 'Oxygen Flow', 'continuous', '2 L/min (max 3 L/min)', 'Via nasal cannula or mask — keep at 2 L/min unless doctor says otherwise', 'Standard setting from transcript — never exceed 3 L/min without order', 'False', NULL);

INSERT INTO regimens (regimen_id, type, name, frequency, dosage_or_reps, instructions, notes, low_stock_alert, alert_notes) VALUES ('R02', 'treatment', 'Nebulizer Albuterol', 'q4h PRN', '1 vial', 'One vial in nebulizer every 4 hours as needed for wheezing/shortness of breath', 'Use with mouthpiece or mask — clean after each use', 'False', NULL);

INSERT INTO regimens (regimen_id, type, name, frequency, dosage_or_reps, instructions, notes, low_stock_alert, alert_notes) VALUES ('R03', 'treatment', 'Azithromycin Schedule', '3x/week', '1 tablet', 'Monday / Wednesday / Friday only — long-term lung prevention', 'Take with or without food', 'False', NULL);

INSERT INTO regimens (regimen_id, type, name, frequency, dosage_or_reps, instructions, notes, low_stock_alert, alert_notes) VALUES ('R04', 'exercise', 'Ankle Pumps', 'daily', '20 reps', 'Lie on back, foot elevated on pillow, point toes up then down (dorsiflexion/plantarflexion) — 1 rep every 4 seconds', 'Prevents blood clots + improves circulation while on oxygen', 'False', 'Add checkbox in app');

INSERT INTO regimens (regimen_id, type, name, frequency, dosage_or_reps, instructions, notes, low_stock_alert, alert_notes) VALUES ('R05', 'treatment', 'Theophylline Timing', 'daily', '1 tablet', 'Take 1 hour before breakfast — do not crush or chew', 'Helps open airways — watch for nausea if combined with azithromycin', 'False', NULL);

INSERT INTO regimens (regimen_id, type, name, frequency, dosage_or_reps, instructions, notes, low_stock_alert, alert_notes) VALUES ('R06', 'treatment', 'Dupixent Injection', 'q14 days', '300 mg', 'Subcutaneous injection — rotate sites (thigh, abdomen, upper arm)', 'Confirm exact last shot date to lock schedule', 'False', 'Needs reminder alert');

-- End of table regimens

CREATE TABLE IF NOT EXISTS symptom_reference (
    id BIGSERIAL PRIMARY KEY,
    symptom TEXT,
    normal_range TEXT,
    severity_level_(1_5) TEXT,
    is_emergency_(true=911) BOOLEAN,
    when_to_act TEXT,
    action_steps TEXT,
    notes TEXT
);


INSERT INTO symptom_reference (symptom, normal_range, severity_level_(1_5), is_emergency_(true=911), when_to_act, action_steps, notes) VALUES ('Shortness of breath at rest', 'Mild after walking', 3, 'False', 'If worse than usual or lasts >15 min', 'Sit up, use albuterol rescue (inhaler or nebulizer), increase O2 to 3 L/min if allowed, text Cody', 'Common with COPD — log in usage sheet');

INSERT INTO symptom_reference (symptom, normal_range, severity_level_(1_5), is_emergency_(true=911), when_to_act, action_steps, notes) VALUES ('Wheezing or chest tightness', 'None or very mild', 3, 'False', 'If not relieved after 2 albuterol doses', 'Use nebulizer, rest, check O2 sat. If <92% → call doctor', 'Monitor with pulse ox');

INSERT INTO symptom_reference (symptom, normal_range, severity_level_(1_5), is_emergency_(true=911), when_to_act, action_steps, notes) VALUES ('Blue lips or fingernails (cyanosis)', NULL, 5, 'True', 'Immediately', 'Call 911 — turn O2 up to max safe level while waiting', 'Real emergency — low oxygen to brain');

INSERT INTO symptom_reference (symptom, normal_range, severity_level_(1_5), is_emergency_(true=911), when_to_act, action_steps, notes) VALUES ('Confusion or sudden drowsiness', 'Alert and oriented', 4, 'True', 'If new or worsening', 'Call doctor or 911 — could be CO2 retention or low O2', 'Especially dangerous on oxygen');

INSERT INTO symptom_reference (symptom, normal_range, severity_level_(1_5), is_emergency_(true=911), when_to_act, action_steps, notes) VALUES ('Increased sputum (more than usual) or change in color', 'Clear or white', 2, 'False', 'If yellow/green or bloody and lasts >24 hrs', 'Call doctor — may need antibiotics (azithromycin)', 'Log in usage + note color');

INSERT INTO symptom_reference (symptom, normal_range, severity_level_(1_5), is_emergency_(true=911), when_to_act, action_steps, notes) VALUES ('Chest pain (new or crushing)', NULL, 5, 'True', 'Immediately', 'Call 911 — do not wait', 'Rule out heart attack (on lisinopril/metoprolol)');

INSERT INTO symptom_reference (symptom, normal_range, severity_level_(1_5), is_emergency_(true=911), when_to_act, action_steps, notes) VALUES ('Fever >100.4°F (38°C)', NULL, 3, 'False', 'If lasts >24 hrs or with chills', 'Call doctor — possible infection', 'Common trigger for lung flare');

INSERT INTO symptom_reference (symptom, normal_range, severity_level_(1_5), is_emergency_(true=911), when_to_act, action_steps, notes) VALUES ('Swelling in legs/ankles', 'Mild at end of day', 2, 'False', 'If sudden or one-sided', 'Elevate legs, do ankle pumps, call doctor — clot risk', 'Especially on steroids');

INSERT INTO symptom_reference (symptom, normal_range, severity_level_(1_5), is_emergency_(true=911), when_to_act, action_steps, notes) VALUES ('Heart rate >120 or irregular', '60-100 normal', 4, 'False', 'If >120 and dizzy', 'Check O2, rest, call doctor', 'Theophylline or prednisone can cause');

INSERT INTO symptom_reference (symptom, normal_range, severity_level_(1_5), is_emergency_(true=911), when_to_act, action_steps, notes) VALUES ('No improvement after rescue meds', 'Feels normal after albuterol', 4, 'False', 'After 3 doses in 1 hour with no relief', 'Call doctor or go to ER', 'Fake vs real: if O2 stays >92% and you can talk in full sentences = not emergency yet');

-- End of table symptom_reference

CREATE TABLE IF NOT EXISTS side_effects (
    id BIGSERIAL PRIMARY KEY,
    medication TEXT,
    common_side_effects TEXT,
    severity_level TEXT,
    watch_for TEXT,
    call_doctor_if TEXT,
    management_tips TEXT,
    notes TEXT,
    column1 TEXT,
    column2 TEXT,
    column3 TEXT,
    column4 TEXT
);


INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Omeprazole', 'headache', ' diarrhea', ' nausea', ' stomach pain', 'Mild', 'Constipation or gas that lasts >3 days', 'Severe stomach pain, black stools, vomiting blood', 'Take with food; stay hydrated; doctor may switch to famotidine if diarrhea is bad', 'Long-term use can lower magnesium — yearly blood test recommended', NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Lisinopril-HCTZ', 'dizziness', ' dry cough', ' fatigue', ' high potassium', 'Moderate', 'Persistent dry cough or light-headedness on standing', 'Swelling of face/lips/tongue (angioedema) or potassium >5.5', 'Rise slowly from sitting; avoid salt substitutes; monitor potassium bloodwork', 'Common with HCTZ — drink plenty of water', NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Prednisone', 'weight gain', ' mood swings', ' increased appetite', ' insomnia', ' high blood sugar', 'Moderate-Severe', 'Moon face, easy bruising, or feeling ''wired'' at night', 'Severe mood changes, vision problems, or signs of infection (fever >100.4°F)', 'Take in morning with food; taper exactly as prescribed; monitor blood sugar', 'Short courses OK; long-term needs bone density check');

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Ibuprofen', 'stomach upset', ' heartburn', ' dizziness', 'Mild-Moderate', 'Black stools or stomach pain', 'Vomiting blood or severe abdominal pain', 'Take with food or omeprazole; use lowest dose shortest time', 'Avoid with prednisone or lisinopril — kidney risk', NULL, NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Cyclobenzaprine', 'drowsiness', ' dry mouth', ' dizziness', 'Mild', 'Extreme sleepiness or confusion', 'Unable to stay awake or sudden weakness', 'Take at bedtime only; avoid driving', 'Enhances gabapentin sedation — watch together', NULL, NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Metoprolol ER', 'slow heart rate', ' fatigue', ' cold hands/feet', 'Mild-Moderate', 'Dizziness or heart rate <50', 'Fainting or wheezing that worsens', 'Take consistently; do not stop suddenly', 'Helps blood pressure but can mask low blood sugar', NULL, NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Gabapentin', 'drowsiness', ' dizziness', ' swelling in legs', ' weight gain', 'Moderate', 'Leg swelling or unsteadiness', 'Severe dizziness, suicidal thoughts, or breathing trouble', 'Take with food; rise slowly; report swelling', 'High doses with cyclobenzaprine = extra sedation', NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Theophylline ER', 'nausea', ' headache', ' fast heartbeat', ' tremors', 'Moderate', 'Racing heart or shakiness', 'Seizures, vomiting that won’t stop, or heart rate >120', 'Take exactly on empty stomach; avoid caffeine', 'Levels rise with azithromycin — blood test needed', NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Atorvastatin', 'muscle aches', ' headache', ' diarrhea', 'Mild', 'Unexplained muscle pain or dark urine', 'Severe muscle pain + fever (rhabdomyolysis)', 'Take in evening; report muscle pain immediately', 'Omeprazole can slightly raise levels — monitor', NULL, NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Famotidine', 'headache', ' dizziness', ' constipation', 'Mild', 'Constipation >3 days', 'Severe headache or confusion', 'Usually very well tolerated', 'Often used to protect stomach from other meds', NULL, NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Azithromycin', 'diarrhea', ' nausea', ' stomach pain', 'Mild', 'Loose stools >3 days', 'Severe diarrhea with fever or bloody stools (C. diff risk)', 'Take with food; finish full course', 'Can raise theophylline levels', NULL, NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Buspirone HCl', 'dizziness', ' headache', ' nausea', 'Mild', 'Dizziness that doesn’t go away', 'Fast heartbeat or fainting', 'Take consistently; avoid grapefruit juice', 'Good for anxiety — low sedation risk', NULL, NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Albuterol (inhaler & nebulizer)', 'shakiness', ' fast heartbeat', ' headache', 'Mild', 'Tremors or heart racing >30 min', 'Chest pain or trouble breathing after use', 'Rinse mouth after use; use as needed only', 'Rescue med — overuse means flare needs doctor', NULL, NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Trelegy (fluticasone/umeclidinium/vilanterol)', 'hoarse voice', ' dry mouth', ' thrush', ' headache', 'Mild', 'White patches in mouth or sore throat', 'Difficulty swallowing or worsening breathing', 'Rinse mouth after inhalation; use spacer', 'Daily controller — thrush risk from steroid part', NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Dupixent (dupilumab)', 'injection site reaction', ' eye inflammation', ' cold-like symptoms', 'Mild-Moderate', 'Redness/swelling at injection site >48 hrs', 'Severe eye pain, vision changes, or new joint pain', 'Rotate injection sites; use cold pack', 'Biologic — generally well tolerated but watch eyes', NULL, NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Roflumilast', 'diarrhea', ' nausea', ' weight loss', ' headache', 'Moderate', 'Diarrhea >3 days or unexplained weight loss', 'Severe depression or suicidal thoughts', 'Take with food; stay hydrated', 'Newer med — monitor mood and weight', NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Aspirin low-dose (81 mg)', 'stomach irritation', ' bleeding risk', 'Mild', 'Easy bruising or black stools', 'Vomiting blood or severe headache', 'Take with food; use enteric-coated', 'Daily heart protection — balance with ibuprofen risk', NULL, NULL, NULL);

INSERT INTO side_effects (medication, common_side_effects, severity_level, watch_for, call_doctor_if, management_tips, notes, column1, column2, column3, column4) VALUES ('Vitamin D (cholecalciferol)', 'none common at this dose', 'Mild', 'Nausea or constipation (rare)', 'High calcium symptoms (confusion, thirst)', 'Take with food containing fat', 'Safe daily supplement', NULL, NULL, NULL, NULL);

-- End of table side_effects

CREATE TABLE IF NOT EXISTS education_materials (
    id BIGSERIAL PRIMARY KEY,
    category TEXT,
    resource_type TEXT,
    title TEXT,
    description TEXT,
    key_takeaway TEXT,
    quick_action TEXT,
    notes TEXT
);


INSERT INTO education_materials (category, resource_type, title, description, key_takeaway, quick_action, notes) VALUES ('COPD Basics', 'Guide', 'Understanding Severe Lung Disease', 'Your condition (COPD/asthma overlap) means daily oxygen, controllers, and rescue meds. Flares can happen fast from dust or infection.', 'Never skip Trelegy, azithromycin (M/W/F), or 2 L/min oxygen', 'Review this sheet weekly with Cody', 'GOLD guidelines summary — print 1 page');

INSERT INTO education_materials (category, resource_type, title, description, key_takeaway, quick_action, notes) VALUES ('Oxygen Safety,Video/Text,Safe Oxygen Use at Home"', 'Oxygen is flammable. No smoking, candles, or lotions near tanks. Keep 5 ft from heat sources.', 'Always 2 L/min unless doctor changes it', 'Check tanks daily — 4–5 ready', 'Fire risk is real with oxygen', NULL, NULL);

INSERT INTO education_materials (category, resource_type, title, description, key_takeaway, quick_action, notes) VALUES ('Medication Adherence,Checklist,Taking 13+ Meds Safely"', 'Polypharmacy is common here. Use the side_effects + interactions sheets every refill.', 'Log every dose in the usage sheet', 'Set phone reminders for Theophylline (empty stomach) and Dupixent (every 14 days)', 'Reduces ER visits by 50%+', NULL, NULL);

INSERT INTO education_materials (category, resource_type, title, description, key_takeaway, quick_action, notes) VALUES ('Symptom Checker,Reference,Real Emergency vs Normal Flare"', 'Use the symptom_reference sheet. O2 <92%, blue lips, or no relief after 3 albuterol doses = 911.', 'Text Cody first for level 3 symptoms', 'Keep pulse ox by bed', 'Saved lives in COPD patients', NULL, NULL);

INSERT INTO education_materials (category, resource_type, title, description, key_takeaway, quick_action, notes) VALUES ('Exercise Routine,Video/Demo,Daily Ankle Pumps"', 'Simple 20-rep exercise prevents clots while on oxygen and steroids.', 'Do every day, even in bed', 'Add checkbox in app', 'Takes 80 seconds — huge benefit', NULL, NULL);

INSERT INTO education_materials (category, resource_type, title, description, key_takeaway, quick_action, notes) VALUES ('Nicotine Cessation,Guide,Quitting While on Oxygen"', 'Patches + lozenges are safe with your meds. Quitting improves oxygen use and lung function.', 'Use 21 mg patch + 2 mg lozenge PRN', 'Track in usage sheet', 'Lung function improves in weeks', NULL, NULL);

INSERT INTO education_materials (category, resource_type, title, description, key_takeaway, quick_action, notes) VALUES ('Power of Attorney & Care Plan,Legal,Your Legal Documents"', 'POA, living will, and HIPAA release are signed and filed.', 'Keep copies in app + nightstand', 'Review yearly with lawyer', 'Prevents hospital stress', NULL, NULL);

INSERT INTO education_materials (category, resource_type, title, description, key_takeaway, quick_action, notes) VALUES ('General COPD Education,Link,Free Patient Resources"', 'American Lung Association COPD toolkit + Deaconess patient portal', 'Download the 1-page action plan', 'Bookmark on phone', 'Updated 2026 materials', NULL, NULL);

-- End of table education_materials
