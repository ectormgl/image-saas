-- Rollback script to remove enhanced AI generation fields from products table
-- Run this ONLY if you need to revert the enhanced fields migration

-- Remove enhanced AI generation fields from products table
ALTER TABLE products 
DROP COLUMN IF EXISTS brand_name,
DROP COLUMN IF EXISTS brand_tone,
DROP COLUMN IF EXISTS brand_personality,
DROP COLUMN IF EXISTS color_theme,
DROP COLUMN IF EXISTS background_style,
DROP COLUMN IF EXISTS lighting_style,
DROP COLUMN IF EXISTS product_placement,
DROP COLUMN IF EXISTS typography_style,
DROP COLUMN IF EXISTS composition_guidelines,
DROP COLUMN IF EXISTS surface_type,
DROP COLUMN IF EXISTS accent_props,
DROP COLUMN IF EXISTS camera_angle,
DROP COLUMN IF EXISTS visual_mood,
DROP COLUMN IF EXISTS texture_preferences,
DROP COLUMN IF EXISTS overlay_text_style,
DROP COLUMN IF EXISTS premium_level,
DROP COLUMN IF EXISTS trending_themes;

-- Verify the rollback by showing the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
