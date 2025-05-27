-- Fix the handle_new_user function to properly create credits on signup
-- This script will create/update the trigger to ensure credits are created when users sign up

-- First, create the function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    shared_workflow_config RECORD;
BEGIN
    -- 1. Create user profile
    BEGIN
        INSERT INTO public.profiles (id, email, name)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
        );
        
        RAISE NOTICE 'Profile created for user %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    END;
    
    -- 2. Create initial credits (amount = 0 as requested)
    BEGIN
        INSERT INTO public.credits (user_id, type, amount, description)
        VALUES (NEW.id, 'signup_bonus', 0, 'Initial credits - signup bonus');
        
        RAISE NOTICE 'Initial credits created for user %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create initial credits for user %: %', NEW.id, SQLERRM;
    END;
    
    -- 3. Set up shared workflow configuration if template exists
    BEGIN
        SELECT * INTO shared_workflow_config 
        FROM public.n8n_workflow_templates 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 1;
        
        -- If template exists, create configuration for the user
        IF FOUND THEN
            INSERT INTO public.n8n_configurations (
                user_id,
                workflow_name,
                workflow_url,
                webhook_url,
                workflow_id,
                api_key,
                is_active
            ) VALUES (
                NEW.id,
                'Shared Image Generation Workflow',
                shared_workflow_config.n8n_base_url,
                COALESCE(shared_workflow_config.n8n_base_url || '/webhook/generate-image', 'https://primary-production-8c118.up.railway.app/webhook/generate-image'),
                shared_workflow_config.workflow_id,
                '',
                true
            );
            
            RAISE NOTICE 'Workflow configuration created for user %', NEW.id;
            
            -- Log the setup if processing_logs table exists
            BEGIN
                INSERT INTO public.processing_logs (
                    image_request_id,
                    step_name,
                    status,
                    message,
                    data
                ) VALUES (
                    NULL,
                    'user_signup_setup',
                    'completed',
                    'User signup completed with profile, credits, and workflow setup',
                    json_build_object(
                        'user_id', NEW.id, 
                        'email', NEW.email,
                        'template_id', shared_workflow_config.id,
                        'workflow_id', shared_workflow_config.workflow_id
                    )
                );
            EXCEPTION WHEN OTHERS THEN
                -- Log failure doesn't block signup
                RAISE NOTICE 'Failed to create setup log for user %: %', NEW.id, SQLERRM;
            END;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Workflow setup failure doesn't block signup
        RAISE NOTICE 'Failed to setup workflow for user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.credits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.n8n_configurations TO authenticated;
GRANT SELECT ON public.n8n_workflow_templates TO authenticated;
GRANT INSERT ON public.processing_logs TO authenticated;

-- Verify the setup
SELECT 
    'Function created successfully' as status,
    EXISTS(
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) as function_exists,
    EXISTS(
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) as trigger_exists;

COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new user registration by creating profile, initial credits (amount=0), and workflow configuration';
