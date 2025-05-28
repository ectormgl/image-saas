-- Fix NULL constraint issue for image_input_url column
-- This makes the column nullable since we don't always have an input image

-- Make image_input_url nullable to fix the constraint violation
ALTER TABLE image_requests 
ALTER COLUMN image_input_url DROP NOT NULL;

-- Add comment to clarify the column purpose
COMMENT ON COLUMN image_requests.image_input_url IS 'Optional input image URL for reference (nullable)';
