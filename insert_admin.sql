USE smart_campus;

-- First, let's make sure there isn't an existing admin user preventing the insert
DELETE FROM users WHERE email = 'admin@campus.edu';

-- Insert admin with password 'admin123'
INSERT INTO users (username, email, full_name, password_hash, role, status, is_active, created_at)
VALUES (
    'admin',
    'admin@campus.edu',
    'Admin User',
    '$2a$10$srmqhWexszyau2gmpVT6/OrtNtDMWVBXIfgg3IySYxUTforpavBw2',
    'ADMIN',
    1, -- 1 corresponds to ACTIVE enum ordinal
    1,
    NOW()
);
