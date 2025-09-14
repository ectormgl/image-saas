-- Fix the status constraint issue in image_requests table

-- First, let's check the current constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'image_requests'::regclass 
AND contype = 'c';

-- Drop the problematic constraint if it exists
DO $$ 
BEGIN
    -- Try to drop various possible constraint names
    BEGIN
        ALTER TABLE image_requests DROP CONSTRAINT IF EXISTS valid_status;
    EXCEPTION 
        WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE image_requests DROP CONSTRAINT IF EXISTS image_requests_status_check;
    EXCEPTION 
        WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE image_requests DROP CONSTRAINT IF EXISTS check_status;
    EXCEPTION 
        WHEN OTHERS THEN NULL;
    END;
END $$;

-- Add the correct constraint with a clear name
ALTER TABLE image_requests 
ADD CONSTRAINT image_requests_status_valid 
CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

-- Verify the constraint is working
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'image_requests'::regclass 
AND contype = 'c'
AND conname = 'image_requests_status_valid';
