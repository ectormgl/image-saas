-- Corrigir a função handle_new_user() para usar as colunas corretas
-- A tabela n8n_configurations tem: base_url, webhook_url, workflow_id (não workflow_name, workflow_url)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    shared_workflow_config RECORD;
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
    
    -- 3. Verificar se existe uma configuração de workflow compartilhado
    BEGIN
        SELECT * INTO shared_workflow_config 
        FROM public.n8n_workflow_templates 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 1;
        
        -- Se existir um template ativo, criar uma referência para o usuário
        IF FOUND THEN
            INSERT INTO public.n8n_configurations (
                user_id,
                base_url,
                webhook_url,
                workflow_id,
                api_key,
                is_active
            ) VALUES (
                NEW.id,
                shared_workflow_config.n8n_base_url,
                shared_workflow_config.n8n_base_url || '/webhook/generate-image',
                shared_workflow_config.workflow_id,
                '', -- API key será configurada pelo usuário se necessário
                true
            );
            
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
                    'shared_workflow_setup',
                    'completed',
                    'Configuração de workflow compartilhado criada no registro',
                    json_build_object(
                        'user_id', NEW.id, 
                        'template_id', shared_workflow_config.id,
                        'workflow_id', shared_workflow_config.workflow_id,
                        'base_url', shared_workflow_config.n8n_base_url
                    )
                );
            EXCEPTION WHEN OTHERS THEN
                -- Se falhar, apenas log o erro (não bloqueia o signup)
                RAISE NOTICE 'Falha ao criar log de setup para usuário %: %', NEW.id, SQLERRM;
            END;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Se falhar, apenas log o erro (não bloqueia o signup)
        RAISE NOTICE 'Falha ao configurar workflow para usuário %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
