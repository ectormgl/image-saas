-- Migration to add enhanced AI generation fields to products table
-- This adds all the fields needed for advanced AI image generation based on prompt requirements

-- Add enhanced AI generation fields to products table
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
ADD COLUMN IF NOT EXISTS trending_themes jsonb DEFAULT '[]'::jsonb;

-- Add comments to document the new fields
COMMENT ON COLUMN products.brand_name IS 'Brand name for AI image generation (e.g., "Chanel", "Nike")';
COMMENT ON COLUMN products.brand_tone IS 'Brand tone style (e.g., "luxurious-sophisticated", "modern-minimalist")';
COMMENT ON COLUMN products.brand_personality IS 'Brand personality characteristics for AI context';
COMMENT ON COLUMN products.color_theme IS 'Color theme for image generation (e.g., "gold-black-luxury", "rose-gold-blush")';
COMMENT ON COLUMN products.background_style IS 'Background style preference (e.g., "degradee-suave", "marble-texture")';
COMMENT ON COLUMN products.lighting_style IS 'Lighting style for image (e.g., "luz-natural-suave", "dramatic-spotlight")';
COMMENT ON COLUMN products.product_placement IS 'Product placement rules (e.g., "center-hero", "rule-of-thirds")';
COMMENT ON COLUMN products.typography_style IS 'Typography style preference (e.g., "serif-classic", "sans-serif-modern")';
COMMENT ON COLUMN products.composition_guidelines IS 'Composition guidelines for image layout';
COMMENT ON COLUMN products.surface_type IS 'Surface type for product display (e.g., "marble-elegant", "velvet-luxury")';
COMMENT ON COLUMN products.accent_props IS 'Accent elements to include (e.g., "rose petals", "crystals")';
COMMENT ON COLUMN products.camera_angle IS 'Camera angle preference (e.g., "front-centered", "45-degree-elegant")';
COMMENT ON COLUMN products.visual_mood IS 'Visual mood for the image (e.g., "sophisticated-elegant", "luxurious-exclusive")';
COMMENT ON COLUMN products.texture_preferences IS 'Texture preferences for enhanced visual appeal';
COMMENT ON COLUMN products.overlay_text_style IS 'Overlay text style (e.g., "elegant-modern", "bold-impact")';
COMMENT ON COLUMN products.premium_level IS 'Premium level positioning (e.g., "ultra-luxury", "premium")';
COMMENT ON COLUMN products.trending_themes IS 'Array of trending themes to incorporate (stored as JSONB)';

-- Verify the migration by showing the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
