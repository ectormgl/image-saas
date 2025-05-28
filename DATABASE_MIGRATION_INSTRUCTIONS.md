## 🚀 URGENT: Database Migration to Fix Current Errors

You're currently getting the error: `Could not find the 'request_id' column of 'image_requests' in the schema cache`

### ⚡ IMMEDIATE FIX - Run This Script Now:

**Copy and paste this COMPLETE script into your Supabase SQL Editor:**

```sql
-- Complete migration script to fix all database issues
-- Run this script in Supabase SQL Editor to fix the current errors

-- Step 1: Fix image_input_url constraint (CRITICAL FIX)
ALTER TABLE image_requests 
ALTER COLUMN image_input_url DROP NOT NULL;

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

-- Verify the migration was successful
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'image_requests' 
  AND column_name IN ('request_id', 'brand_name', 'image_input_url', 'social_media_format')
ORDER BY column_name;
```

### ✅ What This Script Does:

1. **Fixes NULL Constraint Error**: Makes `image_input_url` nullable
2. **Adds Missing request_id Column**: Resolves the current schema cache error
3. **Adds ALL Enhanced Fields**: 22 fields for image_requests + 17 fields for products
4. **Handles Existing Columns**: Uses `IF NOT EXISTS` to avoid conflicts
5. **Verification Query**: Shows you the results after migration

### 🎯 After Running This Script:

1. **Current Error Will Be Fixed**: `request_id` column will exist
2. **Enhanced Fields Available**: All 39 enhanced fields ready for use
3. **Full Workflow Working**: Complete image generation with AI parameters
4. **Database Constraints Fixed**: No more NULL constraint violations

### 🚀 Then Test The Workflow:

1. Try creating a new product with enhanced fields
2. Test image generation with all the enhanced parameters
3. Verify that all data is properly stored and sent to N8N

**This single script resolves all current database issues and enables the complete enhanced workflow!**
