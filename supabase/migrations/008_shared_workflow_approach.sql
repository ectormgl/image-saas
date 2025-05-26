-- Migração para implementar abordagem de workflow compartilhado
-- Todos os usuários usam o mesmo workflow, dados passados via webhook

-- 1. Limpar configurações antigas e implementar abordagem simplificada
-- Remover a função de clonagem de workflows (não será mais necessária)
DROP FUNCTION IF EXISTS clone_n8n_workflow_for_user(UUID, UUID);

-- 2. Criar uma nova função simplificada para o trigger de criação de usuário
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
        ORDER BY created_at ASC 
        LIMIT 1;
        
        -- Se existir um template ativo, criar uma referência para o usuário
        IF FOUND THEN
            INSERT INTO public.n8n_configurations (
                user_id,
                workflow_name,
                workflow_url,
                webhook_url,
                api_key,
                is_active,
                template_workflow_id
            ) VALUES (
                NEW.id,
                'Workflow Compartilhado - ' || shared_workflow_config.name,
                shared_workflow_config.n8n_base_url,
                shared_workflow_config.n8n_base_url || '/webhook/' || shared_workflow_config.workflow_id,
                '', -- API key será configurada pelo usuário se necessário
                true,
                shared_workflow_config.workflow_id
            );
            
            -- Log da criação automática (se tabela processing_logs existir)
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
                    'workflow_url', shared_workflow_config.n8n_base_url
                )
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Se falhar, apenas log o erro (não bloqueia o signup)
        RAISE NOTICE 'Falha ao configurar workflow para usuário %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atualizar o template de workflow com URL correta
-- IMPORTANTE: Substitua a URL abaixo pela sua URL real do N8N
UPDATE public.n8n_workflow_templates 
SET 
    n8n_base_url = 'https://your-actual-n8n-domain.com',
    description = 'Workflow compartilhado para geração de imagens - todos os usuários usam o mesmo workflow'
WHERE workflow_id = 'image-generation-workflow';

-- 4. Se não existir template, criar um
INSERT INTO public.n8n_workflow_templates (
    name, 
    description, 
    workflow_id, 
    n8n_base_url, 
    is_active
)
VALUES (
    'Geração de Imagens - Workflow Compartilhado',
    'Workflow compartilhado para todos os usuários. Os dados são enviados via webhook.',
    'image-generation-workflow',
    'https://your-actual-n8n-domain.com',
    true
)
ON CONFLICT DO NOTHING;

-- 5. Limpar configurações de usuários existentes que podem estar quebradas
-- Opcional: se você quiser limpar configurações antigas e recriá-las
-- DELETE FROM public.n8n_configurations WHERE cloned_workflow_id IS NULL;

-- 6. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. Comentários informativos
COMMENT ON FUNCTION public.handle_new_user() IS 'Função para configurar novo usuário com workflow compartilhado do N8N';

-- Criar um procedimento para atualizar a URL do N8N facilmente
CREATE OR REPLACE FUNCTION update_n8n_url(new_url TEXT)
RETURNS void AS $$
BEGIN
    -- Atualizar template
    UPDATE public.n8n_workflow_templates 
    SET n8n_base_url = new_url,
        updated_at = NOW()
    WHERE is_active = true;
    
    -- Atualizar configurações dos usuários
    UPDATE public.n8n_configurations 
    SET workflow_url = new_url,
        webhook_url = new_url || '/webhook/' || template_workflow_id,
        updated_at = NOW()
    WHERE template_workflow_id IS NOT NULL;
    
    RAISE NOTICE 'URLs do N8N atualizadas para: %', new_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_n8n_url(TEXT) IS 'Função para atualizar a URL base do N8N em todas as configurações';