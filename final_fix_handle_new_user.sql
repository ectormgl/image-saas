-- Final corrigido baseado no esquema real do banco de dados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    shared_workflow_config RECORD;
BEGIN
    -- 1. Criar perfil do usuário usando os nomes CORRETOS de colunas (name, não full_name)
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- 2. Buscar configuração de workflow compartilhado
    BEGIN
        SELECT * INTO shared_workflow_config 
        FROM public.n8n_workflow_templates 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 1;
        
        -- Se existir um template ativo, criar configuração N8N
        IF FOUND THEN
            INSERT INTO public.n8n_configurations (
                user_id,
                workflow_name,      -- CORRIGIDO: usando workflow_name em vez de base_url
                workflow_url,       -- CORRIGIDO: usando workflow_url em vez de webhook_url
                webhook_url,        -- mantido
                workflow_id,        -- mantido
                api_key,            -- mantido
                is_active           -- mantido
            ) VALUES (
                NEW.id,
                'Geração de Imagens',
                shared_workflow_config.n8n_base_url,
                COALESCE(shared_workflow_config.webhook_url, shared_workflow_config.n8n_base_url || '/webhook/generate-image'),
                shared_workflow_config.workflow_id,
                '',
                true
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Log do erro mas não falha o signup
        RAISE WARNING 'Erro ao configurar workflow N8N para usuário %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
