-- Add role column to users table
-- Run this in your Supabase SQL Editor

-- Add the role column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update the existing admin user to have admin role
UPDATE users 
SET role = 'admin', 
    updated_at = NOW()
WHERE email = 'workwithbrianfarello@gmail.com';

-- Verify the update
SELECT id, email, role, subscription_status, created_at, updated_at 
FROM users 
WHERE email = 'workwithbrianfarello@gmail.com'; 