-- Migração para corrigir erro de signup
-- Fix para "Database error while saving new user"

-- Primeiro, vamos criar uma versão mais robusta da função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_template_id UUID;
    new_workflow_id UUID;
BEGIN
    -- 1. Criar perfil do usuário (essencial)
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- 2. Tentar adicionar créditos iniciais (se tabela existir)
    BEGIN
        INSERT INTO public.credits (user_id, type, amount, description)
        VALUES (NEW.id, 'signup_bonus', 1, 'Crédito gratuito de boas-vindas');
    EXCEPTION WHEN OTHERS THEN
        -- Se falhar, apenas log o erro (não bloqueia o signup)
        RAISE NOTICE 'Falha ao criar créditos iniciais para usuário %: %', NEW.id, SQLERRM;
    END;
    
    -- 3. Tentar criar workflow automático (se possível)
    BEGIN
        -- Buscar template padrão ativo
        SELECT id INTO default_template_id 
        FROM public.n8n_workflow_templates 
        WHERE is_active = true 
        ORDER BY created_at ASC 
        LIMIT 1;
        
        -- Criar workflow automático se template existir
        IF default_template_id IS NOT NULL THEN
            SELECT clone_n8n_workflow_for_user(NEW.id, default_template_id) INTO new_workflow_id;
            
            -- Log da criação automática (se tabela processing_logs existir)
            BEGIN
                INSERT INTO public.processing_logs (
                    image_request_id,
                    step_name,
                    status,
                    message,
                    data
                ) VALUES (
                    NULL,
                    'auto_workflow_creation',
                    'completed',
                    'Workflow criado automaticamente no registro',
                    json_build_object('user_id', NEW.id, 'template_id', default_template_id, 'workflow_id', new_workflow_id)
                );
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Falha ao criar log de workflow para usuário %: %', NEW.id, SQLERRM;
            END;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Se falhar, apenas log o erro (não bloqueia o signup)
        RAISE NOTICE 'Falha ao criar workflow automático para usuário %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se o trigger existe e recriar se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
