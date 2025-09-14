-- Migration to add enhanced fields to image_requests table
-- This adds fields needed for the n8n workflow integration

-- Add enhanced fields to image_requests table
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

-- Add comments to document the new fields
COMMENT ON COLUMN image_requests.theme IS 'Theme preference for image generation';
COMMENT ON COLUMN image_requests.target_audience IS 'Target audience for the marketing image';
COMMENT ON COLUMN image_requests.brand_colors IS 'Brand colors as JSON object {primary, secondary}';
COMMENT ON COLUMN image_requests.style_preferences IS 'Style preferences for image generation';
COMMENT ON COLUMN image_requests.benefits IS 'Product benefits description';
COMMENT ON COLUMN image_requests.additional_info IS 'Additional information for AI context';
COMMENT ON COLUMN image_requests.request_id IS 'Unique request identifier for tracking';
COMMENT ON COLUMN image_requests.brand_name IS 'Brand name for AI image generation';
COMMENT ON COLUMN image_requests.brand_tone IS 'Brand tone/personality for AI context';
COMMENT ON COLUMN image_requests.color_theme IS 'Color theme for image generation';
COMMENT ON COLUMN image_requests.background_tone IS 'Background tone preference';
COMMENT ON COLUMN image_requests.surface_type IS 'Surface type for product display';
COMMENT ON COLUMN image_requests.lighting IS 'Lighting style preference';
COMMENT ON COLUMN image_requests.camera_angle IS 'Camera angle preference';
COMMENT ON COLUMN image_requests.accent_prop IS 'Accent elements to include';
COMMENT ON COLUMN image_requests.product_placement IS 'Product placement rules';
COMMENT ON COLUMN image_requests.composition_guidelines IS 'Composition guidelines';
COMMENT ON COLUMN image_requests.visual_mood IS 'Visual mood for the image';
COMMENT ON COLUMN image_requests.texture_preferences IS 'Texture preferences';
COMMENT ON COLUMN image_requests.premium_level IS 'Premium level positioning';
COMMENT ON COLUMN image_requests.overlay_text IS 'Overlay text for the image';
COMMENT ON COLUMN image_requests.typography_style IS 'Typography style preference';
COMMENT ON COLUMN image_requests.social_media_format IS 'Target social media format';
COMMENT ON COLUMN image_requests.marketing_goal IS 'Marketing goal for the image';

-- Update the image_input_url column to be nullable (in case we want to support text-only requests in the future)
ALTER TABLE image_requests ALTER COLUMN image_input_url DROP NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_image_requests_user_status ON image_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_image_requests_request_id ON image_requests(request_id);

-- Verify the migration by showing the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'image_requests' 
ORDER BY ordinal_position;
