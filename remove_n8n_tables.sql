-- ================================================
-- SQL Script to Remove N8N Tables from Supabase
-- ================================================
-- 
-- IMPORTANT: Execute this in your Supabase Cloud SQL Editor
-- This will remove all N8N-related tables and data
-- 
-- Before running, make sure you have the webhook URL in your .env:
-- VITE_N8N_WEBHOOK_URL=https://primary-production-8c118.up.railway.app/webhook/generate-image
-- 
-- ================================================

-- Step 1: Drop the n8n_configurations table
-- This table stores user-specific N8N workflow configurations
DROP TABLE IF EXISTS public.n8n_configurations CASCADE;

-- Step 2: Drop the n8n_workflow_templates table  
-- This table stores N8N workflow templates
DROP TABLE IF EXISTS public.n8n_workflow_templates CASCADE;

-- Step 3: Remove any functions related to N8N configuration
-- These functions were used to manage N8N workflows automatically
DROP FUNCTION IF EXISTS public.create_user_n8n_workflow(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_n8n_url(text) CASCADE;

-- Step 4: Remove triggers that automatically created N8N configurations
-- This trigger created N8N configs when new users signed up
DROP TRIGGER IF EXISTS trigger_create_n8n_workflow ON auth.users;

-- Step 5: Clean up any policies that referenced these tables
-- Note: Policies are automatically dropped when tables are dropped

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Verify that the tables have been removed
SELECT 
    'Tables verification' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('n8n_configurations', 'n8n_workflow_templates')
        ) 
        THEN '❌ N8N tables still exist' 
        ELSE '✅ N8N tables successfully removed' 
    END as status;

-- List remaining tables to confirm cleanup
SELECT 
    'Remaining tables' as info,
    string_agg(table_name, ', ' ORDER BY table_name) as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- ================================================
-- MIGRATION COMPLETED
-- ================================================
-- 
-- After running this script:
-- 
-- 1. Update your .env file to include:
--    VITE_N8N_WEBHOOK_URL=https://primary-production-8c118.up.railway.app/webhook/generate-image
-- 
-- 2. Your application will now use the shared webhook URL from .env
--    instead of per-user configurations
-- 
-- 3. All users will share the same N8N workflow
-- 
-- ================================================
