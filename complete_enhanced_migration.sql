-- Complete migration script to fix all database issues and add enhanced fields
-- Run this script in Supabase SQL Editor to fix the current errors

-- Step 1: Fix image_input_url constraint (CRITICAL FIX)
ALTER TABLE image_requests 
ALTER COLUMN image_input_url DROP NOT NULL;

-- Step 2: Fix status check constraint issue
DO $$ 
BEGIN
    -- Drop any problematic status constraints
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

-- Add the correct status constraint
ALTER TABLE image_requests 
ADD CONSTRAINT image_requests_status_valid 
CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

-- Step 2: Add ALL enhanced fields to image_requests table
ALTER TABLE image_requests 
ADD COLUMN IF NOT EXISTS theme text,
ADD COLUMN IF NOT EXISTS target_audience text,
ADD COLUMN IF NOT EXISTS brand_colors jsonb,
ADD COLUMN IF NOT EXISTS style_preferences text,
ADD COLUMN IF NOT EXISTS benefits text,
ADD COLUMN IF NOT EXISTS additional_info text,
ADD COLUMN IF NOT EXISTS request_id text,
-- Enhanced AI generation fields
ADD COLUMN IF NOT EXISTS brand_name text,
ADD COLUMN IF NOT EXISTS brand_tone text,
ADD COLUMN IF NOT EXISTS color_theme text,
ADD COLUMN IF NOT EXISTS background_tone text,
ADD COLUMN IF NOT EXISTS surface_type text,
ADD COLUMN IF NOT EXISTS lighting text,
ADD COLUMN IF NOT EXISTS camera_angle text,
ADD COLUMN IF NOT EXISTS accent_prop text,
ADD COLUMN IF NOT EXISTS product_placement text,
ADD COLUMN IF NOT EXISTS composition_guidelines text,
ADD COLUMN IF NOT EXISTS visual_mood text,
ADD COLUMN IF NOT EXISTS texture_preferences text,
ADD COLUMN IF NOT EXISTS premium_level text,
ADD COLUMN IF NOT EXISTS overlay_text text,
ADD COLUMN IF NOT EXISTS typography_style text,
ADD COLUMN IF NOT EXISTS social_media_format text,
ADD COLUMN IF NOT EXISTS marketing_goal text;

-- Step 3: Add ALL enhanced fields to products table (if not already done)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_name text,
ADD COLUMN IF NOT EXISTS brand_tone text,
ADD COLUMN IF NOT EXISTS brand_personality text,
ADD COLUMN IF NOT EXISTS color_theme text,
ADD COLUMN IF NOT EXISTS background_style text,
ADD COLUMN IF NOT EXISTS lighting_style text,
ADD COLUMN IF NOT EXISTS product_placement text,
ADD COLUMN IF NOT EXISTS typography_style text,
ADD COLUMN IF NOT EXISTS composition_guidelines text,
ADD COLUMN IF NOT EXISTS surface_type text,
ADD COLUMN IF NOT EXISTS accent_props text,
ADD COLUMN IF NOT EXISTS camera_angle text,
ADD COLUMN IF NOT EXISTS visual_mood text,
ADD COLUMN IF NOT EXISTS texture_preferences text,
ADD COLUMN IF NOT EXISTS overlay_text_style text,
ADD COLUMN IF NOT EXISTS premium_level text,
ADD COLUMN IF NOT EXISTS trending_themes jsonb;

-- Step 4: Add helpful comments
COMMENT ON COLUMN image_requests.image_input_url IS 'Optional input image URL for reference (nullable)';
COMMENT ON COLUMN image_requests.request_id IS 'Unique request identifier for tracking';
COMMENT ON COLUMN image_requests.brand_name IS 'Brand name for AI image generation';
COMMENT ON COLUMN image_requests.brand_tone IS 'Brand tone/personality for AI context';
COMMENT ON COLUMN image_requests.color_theme IS 'Color theme for image generation';
COMMENT ON COLUMN image_requests.background_tone IS 'Background tone preference';
COMMENT ON COLUMN image_requests.surface_type IS 'Surface type for product display';
COMMENT ON COLUMN image_requests.lighting IS 'Lighting style preference';
COMMENT ON COLUMN image_requests.camera_angle IS 'Camera angle preference';
COMMENT ON COLUMN image_requests.social_media_format IS 'Target social media format';
COMMENT ON COLUMN image_requests.marketing_goal IS 'Marketing objective for the image';

-- Verify the migration was successful
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'image_requests' 
  AND column_name IN ('request_id', 'brand_name', 'image_input_url', 'social_media_format')
ORDER BY column_name;
