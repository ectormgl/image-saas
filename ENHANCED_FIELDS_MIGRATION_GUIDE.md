# Enhanced Product Fields Migration Guide

## Overview
This migration adds 17 new enhanced AI generation fields to the products table to support advanced AI image generation based on detailed prompt requirements.

## Steps to Execute

### 1. Run the Migration SQL
Copy and paste the content of `add_enhanced_product_fields.sql` into your Supabase SQL Editor and execute it.

### 2. Fields Added
The following fields will be added to your products table:

**Core Brand Fields:**
- `brand_name` (text) - Brand name for AI generation
- `brand_tone` (text) - Brand tone/personality 
- `brand_personality` (text) - Additional brand characteristics

**Visual Style Fields:**
- `color_theme` (text) - Color scheme preference
- `background_style` (text) - Background style preference
- `lighting_style` (text) - Lighting style for images
- `surface_type` (text) - Surface material type
- `typography_style` (text) - Typography preferences

**Composition Fields:**
- `product_placement` (text) - Product positioning rules
- `composition_guidelines` (text) - Layout guidelines
- `camera_angle` (text) - Camera angle preferences
- `accent_props` (text) - Accent elements to include

**Mood & Enhancement Fields:**
- `visual_mood` (text) - Overall visual mood
- `texture_preferences` (text) - Texture preferences
- `overlay_text_style` (text) - Text overlay styling
- `premium_level` (text) - Premium positioning level
- `trending_themes` (jsonb) - Array of trending themes

### 3. How It Works

**When Creating Products:**
- Users fill out enhanced forms in MyProducts
- All 17 fields are saved to the database
- Products can be created with full AI generation context

**When Using Image Creation:**
- Users select existing products from their library
- ALL enhanced fields are automatically pre-filled in the Creation Workflow
- Forms show previously saved preferences
- Users can modify any field before generating images

### 4. Field Mapping
The following mapping ensures compatibility between database fields and form fields:

```
Database Field          → Form Field
background_style        → backgroundTone
lighting_style          → lighting  
color_theme            → colorTheme
accent_props           → accentProp
overlay_text_style     → overlayText
product_placement      → productPlacement
composition_guidelines → compositionGuidelines
typography_style       → typographyStyle
```

### 5. Benefits After Migration

1. **Complete Data Persistence** - All enhanced form data is saved and retrieved
2. **Pre-filled Forms** - Selecting products auto-fills creation forms
3. **Consistent User Experience** - No data loss between sessions
4. **Advanced AI Generation** - Full context for high-quality image generation
5. **Scalable Architecture** - Ready for future AI enhancements

### 6. Testing Steps

After running the migration:

1. **Test Product Creation:**
   - Go to "My Products" 
   - Create a new product with enhanced fields
   - Verify all fields save correctly

2. **Test Pre-filling:**
   - Go to "Image Creation"
   - Select the product you just created
   - Verify all enhanced fields are pre-filled

3. **Test Image Generation:**
   - Use the pre-filled form to generate images
   - Verify enhanced data flows to AI workflow

### 7. Rollback
If needed, run `rollback_enhanced_product_fields.sql` to remove the new fields.

## Files Modified
- `add_enhanced_product_fields.sql` - Migration script
- `rollback_enhanced_product_fields.sql` - Rollback script  
- `useUserProducts.tsx` - Updated to handle all enhanced fields
- `CreationWorkflow.tsx` - Enhanced field mapping for pre-filling

The migration is designed to be safe and backward-compatible. Existing products will continue to work, and new fields will be NULL until populated.
