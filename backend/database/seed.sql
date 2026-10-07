-- ===================================================================
-- CampusFix Seed Data
-- ===================================================================

USE campusfix;

-- Password for demo accounts is: password123 (or admin123 for admin)
-- Hash generated using bcrypt salt rounds 10
-- password123: $2a$10$2DJs.2Iwjl8arFKAuepGLuLledkjsIQOIIbOrr66iLIbLKVdphLW2
-- admin123:    $2a$10$HV6nEbIGGj7Y1ySWaro3UevO/WyGmqFYmvaeSAaGTsVh1Q0Lvibq6

-- 1. Insert Departments
INSERT INTO departments (id, name, head_name, total_staff, avg_resolution_hours, sla_compliance) VALUES
(1, 'Electrical Maintenance', 'Robert Martinez', 8, 3.20, '97%'),
(2, 'Civil & Plumbing', 'Walter White', 6, 4.10, '94%'),
(3, 'HVAC Operations', 'Gus Fring', 5, 2.80, '98%'),
(4, 'Campus IT & Networks', 'Grace Hopper', 7, 1.90, '99%'),
(5, 'Campus Facilities', 'Arthur Dent', 12, 5.40, '92%')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Locations
INSERT INTO locations (id, name, building, floor, room_number) VALUES
(1, 'Room 118', 'Academic Block A', '1st Floor', '118'),
(2, 'Room 304', 'Academic Block A', '3rd Floor', '304'),
(3, '2nd Floor Washroom, Block A', 'Academic Block A', '2nd Floor', 'W-201'),
(4, 'Lab 110', 'Science & Engineering Complex', '1st Floor', '110'),
(5, 'Library Wing C', 'Central Library', '2nd Floor', 'C-205'),
(6, 'Main Campus Grounds', 'Central Campus', 'Ground Floor', 'G-01')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insert Users (Demo accounts for STUDENT, TECHNICIAN, ADMIN)
INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
(1, 'Test12345', 'test12345@gmail.com', '$2a$10$2DJs.2Iwjl8arFKAuepGLuLledkjsIQOIIbOrr66iLIbLKVdphLW2', 'STUDENT', '+1-555-0100'),
(2, 'Aarav Sharma', 'aarav.s@campus.edu', '$2a$10$2DJs.2Iwjl8arFKAuepGLuLledkjsIQOIIbOrr66iLIbLKVdphLW2', 'STUDENT', '+1-555-0101'),
(3, 'Priya Patel', 'priya.p@campus.edu', '$2a$10$2DJs.2Iwjl8arFKAuepGLuLledkjsIQOIIbOrr66iLIbLKVdphLW2', 'STUDENT', '+1-555-0102'),
(4, 'Marcus Vance', 'marcus.vance@campus.edu', '$2a$10$2DJs.2Iwjl8arFKAuepGLuLledkjsIQOIIbOrr66iLIbLKVdphLW2', 'TECHNICIAN', '+1-555-0201'),
(5, 'Elena Rostova', 'elena.r@campus.edu', '$2a$10$2DJs.2Iwjl8arFKAuepGLuLledkjsIQOIIbOrr66iLIbLKVdphLW2', 'TECHNICIAN', '+1-555-0202'),
(6, 'David Chen', 'david.c@campus.edu', '$2a$10$2DJs.2Iwjl8arFKAuepGLuLledkjsIQOIIbOrr66iLIbLKVdphLW2', 'TECHNICIAN', '+1-555-0203'),
(7, 'Sarah Jenkins', 'sarah.j@campus.edu', '$2a$10$2DJs.2Iwjl8arFKAuepGLuLledkjsIQOIIbOrr66iLIbLKVdphLW2', 'TECHNICIAN', '+1-555-0204'),
(8, 'Admin Staff', 'admin@campus.edu', '$2a$10$HV6nEbIGGj7Y1ySWaro3UevO/WyGmqFYmvaeSAaGTsVh1Q0Lvibq6', 'ADMIN', '+1-555-0300')
ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role=VALUES(role), name=VALUES(name), phone=VALUES(phone);

-- 4. Insert Technicians
INSERT INTO technicians (id, user_id, name, email, department_id, specialty, active_tickets, resolved_month, rating, is_available) VALUES
(1, 4, 'Marcus Vance', 'marcus.vance@campus.edu', 1, 'AV & High Voltage', 2, 48, 4.90, 1),
(2, 5, 'Elena Rostova', 'elena.r@campus.edu', 2, 'Hydraulics & Drainage', 3, 42, 4.80, 1),
(3, 6, 'David Chen', 'david.c@campus.edu', 3, 'Chillers & Compressors', 1, 39, 4.70, 1),
(4, 7, 'Sarah Jenkins', 'sarah.j@campus.edu', 4, 'Aruba APs & Fiber Optic', 2, 55, 4.95, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Insert Assets
INSERT INTO assets (id, asset_tag, name, category, location_id, department_id, failures_30d, status, recommendation) VALUES
(1, 'P-304', 'Optoma Projector P-304', 'AV Equipment', 2, 1, 7, 'Chronic Issue', 'Preventive maintenance / replacement review'),
(2, 'HVAC-02', 'Carrier Central Chiller #2', 'Cooling', 4, 3, 1, 'Normal', 'Routine filter cleaning scheduled'),
(3, 'WP-01', 'Grundfos Hydro Booster Pump', 'Plumbing', 3, 2, 0, 'Normal', 'Inspected last week'),
(4, 'NET-SW-01', 'Cisco Core Switch 9300', 'Networking', 5, 4, 0, 'Normal', 'Firmware up to date')
ON DUPLICATE KEY UPDATE asset_tag=VALUES(asset_tag);

-- 6. Insert SLA Rules
INSERT INTO sla_rules (id, priority, resolution_time_hours, response_time_minutes) VALUES
(1, 'CRITICAL', 1, 15),
(2, 'HIGH', 4, 30),
(3, 'MEDIUM', 12, 60),
(4, 'LOW', 24, 120)
ON DUPLICATE KEY UPDATE priority=VALUES(priority);

-- 7. Insert Tickets
INSERT INTO tickets (id, ticket_code, title, description, category, location_name, location_id, department_id, priority, status, reporter_id, reporter_name, reporter_email, assigned_tech_id, assigned_tech_name, asset_id, asset_tag, sla_hours, sla_deadline, is_chronic, created_at, resolved_at) VALUES
(1, 'CF-1001', 'fan in room 118 is not working', 'Ceiling fan makes loud grinding noise and stops rotating after 2 minutes.', 'AV / Electrical', 'Room 118', 1, 1, 'Medium', 'Resolved', 1, 'Test12345', 'test12345@gmail.com', 1, 'Marcus Vance', NULL, NULL, 4, DATE_ADD(NOW(), INTERVAL -2 HOUR), 0, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 'CF-1002', "Projector in Room 304 isn't working", 'Projector flashes red lamp LED and will not connect to HDMI cable during lecture.', 'AV / Electrical', 'Room 304', 2, 1, 'High', 'Resolved', 1, 'Test12345', 'test12345@gmail.com', 1, 'Marcus Vance', 1, 'P-304', 4, DATE_ADD(NOW(), INTERVAL -1 HOUR), 1, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 'CF-1003', 'Water leaking under the sink in 2nd floor washroom, Block A', 'Continuous water drip from the main drainage pipe causing pooling on floor tiles.', 'Plumbing & Water', 'Block A, 2nd Floor', 3, 2, 'High', 'In Progress', 2, 'Aarav Sharma', 'aarav.s@campus.edu', 2, 'Elena Rostova', 3, 'WP-01', 4, DATE_ADD(NOW(), INTERVAL 2 HOUR), 0, DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL),
(4, 'CF-1004', 'AC in lab 110 blowing warm air during exams', 'Split AC unit running but cooling coil not engaging. Room temperature above 31C.', 'HVAC / Cooling', 'Lab 110', 4, 3, 'Critical', 'Open', 3, 'Priya Patel', 'priya.p@campus.edu', 3, 'David Chen', 2, 'HVAC-02', 1, DATE_ADD(NOW(), INTERVAL 1 HOUR), 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL),
(5, 'CF-1005', 'WiFi signal dropping constantly in Library Wing C', 'Students unable to access research databases due to frequent AP disconnections.', 'Network & WiFi', 'Library Wing C', 5, 4, 'High', 'Assigned', 1, 'Test12345', 'test12345@gmail.com', 4, 'Sarah Jenkins', 4, 'NET-SW-01', 4, DATE_ADD(NOW(), INTERVAL 3 HOUR), 0, DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL)
ON DUPLICATE KEY UPDATE ticket_code=VALUES(ticket_code);

-- 8. Insert Ticket History
INSERT INTO ticket_history (ticket_id, status, note, performed_by_user_id, performed_by_name) VALUES
(1, 'Open', 'Issue submitted by student via AI triage', 1, 'Test12345'),
(1, 'Assigned', 'Auto-routed to Electrical Maintenance & assigned to Marcus Vance', 1, 'System'),
(1, 'In Progress', 'Technician arrived on site with replacement capacitor', 4, 'Marcus Vance'),
(1, 'Resolved', 'Capacitor replaced and speed regulator lubricated. Fully operational.', 4, 'Marcus Vance'),
(2, 'Open', 'Reported via natural language', 1, 'Test12345'),
(2, 'Assigned', 'AI flagged as High Priority AV issue', 1, 'System'),
(2, 'Resolved', 'Lamp module reseated and HDMI switch box power-cycled', 4, 'Marcus Vance'),
(3, 'Open', 'Reported by student', 2, 'Aarav Sharma'),
(3, 'In Progress', 'Plumber on site, replacing PVC U-bend joint', 5, 'Elena Rostova'),
(4, 'Open', 'High temperature alert flagged by student', 3, 'Priya Patel'),
(5, 'Open', 'Reported by student', 1, 'Test12345'),
(5, 'Assigned', 'Assigned to Network Operations specialist Sarah Jenkins', 1, 'System');
